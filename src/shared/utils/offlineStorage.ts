import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import ReactNativeBlobUtil from 'react-native-blob-util';
import SHA1 from 'crypto-js/sha1';
import { getCityName } from './geocodingUtils';

export const STORAGE_KEYS = {
  EVENTS: '@narrenradar_events',
  REGIONS: '@narrenradar_regions',
  CLUB_USERS: '@narrenradar_club_users',
  SPONSORS: '@narrenradar_sponsors',
};

// --- Offline download queue ---
//
// With internet, every image and PDF is saved locally so the whole app works
// offline. Everything goes through one ordered queue:
//  - Highlights first, then upcoming events (images, then their documents),
//    then past events and club pictures.
//  - Small batches at LOW priority, so images on screen (normal/high priority)
//    always jump ahead and appear immediately.
//  - A URL is queued once per session (retried later if it may have failed).
export const PRELOAD_PRIORITY = {
  HIGHLIGHT: 0, // Highlights images
  UPCOMING: 1, // upcoming event images, sponsors, regions
  DETAILS: 2, // documents/plans/flyers of upcoming events
  OTHER: 3, // past events, club logos, region sponsors
  DETAILS_PAST: 4, // past event files, club member photos
};

const START_DELAY_MS = 2000; // let the first screen load its own images first
const IMAGE_BATCH_SIZE = 8;
const IMAGE_BATCH_INTERVAL_MS = 1000;
const PDF_WORKERS = 4; // same as Android
const REQUEUE_AFTER_MS = 10 * 60 * 1000; // allow a retry if a download failed
const OFFLINE_RETRY_MS = 5000;
const RECENT_IMAGE_WINDOW_MS = 20000;

type QueueItem = { url: string; isPdf: boolean; priority: number; seq: number };

const queue: QueueItem[] = [];
const queuedAt = new Map<string, number>();
let seq = 0;
let imageLoopRunning = false;
let pdfWorkersRunning = 0;
const appStart = Date.now();

// Images handed to FastImage recently. FastImage.preload gives no result, so
// if the connection drops we put these back in the queue to be safe.
let recentImages: { item: QueueItem; sentAt: number }[] = [];

const cleanUrl = (u: unknown): string | null =>
  typeof u === 'string' && u.trim().startsWith('http') ? u.trim() : null;

const keyOf = (url: string, isPdf: boolean) => `${isPdf ? 'pdf' : 'img'}:${url}`;

const enqueue = (rawUrl: unknown, isPdf: boolean, priority: number) => {
  const url = cleanUrl(rawUrl);
  if (!url) return;
  const key = keyOf(url, isPdf);
  const last = queuedAt.get(key);
  if (last && Date.now() - last < REQUEUE_AFTER_MS) return;
  queuedAt.set(key, Date.now());
  queue.push({ url, isPdf, priority, seq: seq++ });
  startWorkers();
};

const requeue = (item: QueueItem) => {
  if (!queue.some(q => q.url === item.url && q.isPdf === item.isPdf)) queue.push(item);
};

const sortQueue = () => queue.sort((a, b) => a.priority - b.priority || a.seq - b.seq);

const takeNext = (isPdf: boolean, max: number): QueueItem[] => {
  sortQueue();
  const picked: QueueItem[] = [];
  for (let i = 0; i < queue.length && picked.length < max; ) {
    if (queue[i].isPdf === isPdf) picked.push(...queue.splice(i, 1));
    else i++;
  }
  return picked;
};

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// --- Connection check (no native library needed) ---
// Any HTTP answer from Firebase Storage means we're online.
let lastCheck = { at: 0, online: true };
const checkOnline = async (): Promise<boolean> => {
  if (Date.now() - lastCheck.at < 3000) return lastCheck.online;
  let online = false;
  try {
    await Promise.race([
      fetch('https://firebasestorage.googleapis.com/', { method: 'HEAD' }),
      sleep(5000).then(() => {
        throw new Error('timeout');
      }),
    ]);
    online = true;
  } catch {
    online = false;
  }
  lastCheck = { at: Date.now(), online };
  return online;
};

// Waits until we're online. On a drop, recently sent images go back in the queue.
const waitUntilOnline = async () => {
  if (await checkOnline()) return;
  const cutoff = Date.now() - RECENT_IMAGE_WINDOW_MS;
  recentImages.filter(r => r.sentAt >= cutoff).forEach(r => requeue(r.item));
  recentImages = [];
  while (!(await checkOnline())) {
    await sleep(OFFLINE_RETRY_MS);
  }
};

const waitForStart = async () => {
  const wait = START_DELAY_MS - (Date.now() - appStart);
  if (wait > 0) await sleep(wait);
};

// Images: small batches at low priority, highest priority first.
const runImageLoop = async () => {
  if (imageLoopRunning) return;
  imageLoopRunning = true;
  try {
    await waitForStart();
    while (queue.some(item => !item.isPdf)) {
      await waitUntilOnline();
      const images = takeNext(false, IMAGE_BATCH_SIZE);
      if (images.length === 0) continue;
      try {
        FastImage.preload(
          images.map(item => ({
            uri: item.url,
            priority: FastImage.priority.low,
            cache: FastImage.cacheControl.immutable,
          })),
        );
        const now = Date.now();
        recentImages = recentImages
          .filter(r => r.sentAt >= now - RECENT_IMAGE_WINDOW_MS)
          .concat(images.map(item => ({ item, sentAt: now })));
      } catch (error) {
        console.log('Error preloading images for offline cache:', error);
      }
      await sleep(IMAGE_BATCH_INTERVAL_MS);
    }
  } finally {
    imageLoopRunning = false;
  }
};

// PDFs: several at a time, but only once no image of a higher priority is waiting.
const runPdfWorker = async () => {
  pdfWorkersRunning++;
  try {
    await waitForStart();
    while (queue.some(item => item.isPdf)) {
      sortQueue();
      const nextImage = queue.find(item => !item.isPdf);
      const nextPdf = queue.find(item => item.isPdf);
      if (!nextPdf) break;
      if (nextImage && nextImage.priority < nextPdf.priority) {
        await sleep(1000);
        continue;
      }
      await waitUntilOnline();
      const [pdf] = takeNext(true, 1);
      if (!pdf) continue;
      const ok = await cacheDocumentUrl(pdf.url);
      if (!ok) {
        lastCheck.at = 0; // re-check the connection now
        if (!(await checkOnline())) {
          requeue(pdf); // connection dropped mid-download: retry when back online
        } else {
          queuedAt.delete(keyOf(pdf.url, true)); // real failure: retry on the next sync
        }
      }
    }
  } finally {
    pdfWorkersRunning--;
  }
};

const startWorkers = () => {
  runImageLoop();
  while (pdfWorkersRunning < PDF_WORKERS && queue.some(item => item.isPdf)) {
    runPdfWorker();
  }
};

export const preloadImageUrls = (
  urls: unknown[],
  priority: number = PRELOAD_PRIORITY.OTHER,
): void => {
  urls.forEach(url => enqueue(url, false, priority));
};

// --- Helpers to preload/read PDF/document files for offline viewing ---
//
// react-native-pdf's own `cache: true` option is hardcoded to its CacheDir,
// which iOS/Android can silently wipe under storage pressure — that would
// quietly reintroduce the "worked once, now offline it's gone" bug this is
// meant to fix. So instead of relying on that, we keep our own copy in
// DocumentDir (persistent — only cleared by the app itself or an uninstall)
// and hand PdfViewer.tsx a local file:// URI directly when we have one,
// bypassing react-native-pdf's network/cache logic entirely for that case.
// Renamed from narrenradar_documents: earlier builds downloaded straight to
// the final path with no atomic move, so an interrupted download could
// leave a truncated file cached forever. Using a new directory name makes
// devices that already installed that build start clean under the fixed
// download logic below, instead of trusting whatever was left on disk.
const DOCUMENT_CACHE_DIR = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/narrenradar_documents_v2`;

const documentCachePathFor = (url: string): string =>
  `${DOCUMENT_CACHE_DIR}/${SHA1(url).toString()}.pdf`;

// A build before the temp-file-then-move fix below could leave a
// truncated file at the final cache path if a download was interrupted.
// Treat an empty file as not cached so it gets deleted and re-fetched
// instead of being served forever as if it were complete.
const isValidCachedFile = async (path: string): Promise<boolean> => {
  const exists = await ReactNativeBlobUtil.fs.exists(path);
  if (!exists) return false;
  const stat = await ReactNativeBlobUtil.fs.stat(path);
  return !!stat && Number(stat.size) > 0;
};

export const getCachedDocumentPath = async (url: string): Promise<string | null> => {
  try {
    const path = documentCachePathFor(url);
    if (await isValidCachedFile(path)) return path;
    await ReactNativeBlobUtil.fs.unlink(path).catch(() => {});
    return null;
  } catch (error) {
    return null;
  }
};

export const cacheDocumentUrl = async (url: string): Promise<boolean> => {
  const path = documentCachePathFor(url);
  const tempPath = `${path}.tmp`;
  try {
    if (await isValidCachedFile(path)) return true;
    await ReactNativeBlobUtil.fs.unlink(path).catch(() => {});

    await ReactNativeBlobUtil.fs.mkdir(DOCUMENT_CACHE_DIR).catch(() => {});
    // Download to a temp file first and only move it into place once
    // fully downloaded — writing straight to `path` would leave a
    // truncated file there (and getCachedDocumentPath would trust it as
    // complete forever) if the download is interrupted, e.g. the network
    // dropping mid-transfer or the app being backgrounded.
    await ReactNativeBlobUtil.fs.unlink(tempPath).catch(() => {});
    // Timeout so a dropped connection can't block the download queue forever.
    const res = await ReactNativeBlobUtil.config({ path: tempPath, timeout: 30000 }).fetch(
      'GET',
      url,
    );
    const status = res.info().status;
    if (status < 200 || status >= 300) {
      throw new Error(`Unexpected status ${status} downloading ${url}`);
    }
    const stat = await ReactNativeBlobUtil.fs.stat(tempPath);
    if (!stat || Number(stat.size) <= 0) {
      throw new Error(`Downloaded file is empty for ${url}`);
    }
    await ReactNativeBlobUtil.fs.mv(tempPath, path);
    return true;
  } catch (error) {
    // Best-effort — a failure here just means the document will be
    // fetched live the next time it's opened.
    console.log('Error caching document for offline use:', error);
    await ReactNativeBlobUtil.fs.unlink(tempPath).catch(() => {});
    return false;
  }
};

export const preloadDocumentUrls = (
  urls: unknown[],
  priority: number = PRELOAD_PRIORITY.DETAILS,
): void => {
  urls.forEach(url => enqueue(url, true, priority));
};

// Same rule as the Highlights slider on EventHome (Plus sponsoring, next 7 days).
const eventPriority = (event: any, startOfToday: number) => {
  const date = event?.eventDate ? new Date(event.eventDate).getTime() : 0;
  const upcoming = date >= startOfToday;
  const highlight =
    event?.hasSponsoring && event?.sponsorPackage === 'Plus' && upcoming &&
    date < startOfToday + 8 * 24 * 60 * 60 * 1000;
  return {
    main: highlight ? PRELOAD_PRIORITY.HIGHLIGHT : upcoming ? PRELOAD_PRIORITY.UPCOMING : PRELOAD_PRIORITY.OTHER,
    details: upcoming ? PRELOAD_PRIORITY.DETAILS : PRELOAD_PRIORITY.DETAILS_PAST,
  };
};

const isClearlyPdf = (file: any) =>
  file?.type === 'pdf' || /\.pdf(\?|$)/i.test(String(file?.url || ''));

// List images (event image, sponsor logo): FastImage cache only.
const enqueueFile = (file: any, priority: number) => {
  if (!file) return;
  enqueue(typeof file === 'string' ? file : file.url, false, priority);
};

// Detail files can open in either the PDF viewer or the image viewer
// (EventDetailScreen guesses the type), so save them for both unless
// they are clearly PDFs.
const enqueueDetailFile = (file: any, priority: number) => {
  if (!file) return;
  const url = typeof file === 'string' ? file : file.url;
  enqueue(url, true, priority);
  if (!isClearlyPdf(file)) enqueue(url, false, priority);
};

// --- Events ---
export const getStoredEvents = async (): Promise<any[] | null> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('Error reading stored events:', error);
    return null;
  }
};

export const saveStoredEvents = async (events: any[]): Promise<void> => {
  try {
    if (Array.isArray(events)) {
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));

      // Save all event images and documents for offline use, Highlights first.
      const startOfToday = new Date().setHours(0, 0, 0, 0);
      const byDate = [...events].sort(
        (a, b) => new Date(a?.eventDate || 0).getTime() - new Date(b?.eventDate || 0).getTime(),
      );
      byDate.forEach(event => {
        const p = eventPriority(event, startOfToday);
        enqueueFile(event?.eventImage, p.main);
        enqueueFile(event?.sponsorLogo, p.main);
        enqueueDetailFile(event?.lineUp, p.details);
        enqueueDetailFile(event?.groundPlan, p.details);
        if (Array.isArray(event?.documents)) {
          event.documents.forEach((doc: any) => enqueue(doc?.url, true, p.details));
        }
        if (Array.isArray(event?.locations)) {
          event.locations.forEach((loc: any) => enqueueDetailFile(loc?.flyer, p.details));
        }
        if (Array.isArray(event?.toilets)) {
          event.toilets.forEach((toilet: any) => {
            enqueueDetailFile(toilet?.file, p.details);
            enqueueDetailFile(toilet?.flyer, p.details);
          });
        }
      });

      // Pre-cache geocoded cities in the background for offline use
      events.forEach(event => {
        const lat =
          event?.eventLatitude ||
          (Array.isArray(event?.locations) && event?.locations[0]?.latitude);
        const lng =
          event?.eventLongitude ||
          (Array.isArray(event?.locations) && event?.locations[0]?.longitude);
        if (lat && lng && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          getCityName(lat, lng).catch(() => {});
        }
      });
    }
  } catch (error) {
    console.error('Error saving stored events:', error);
  }
};

// --- Regions ---
export const getStoredRegions = async (): Promise<any[] | null> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.REGIONS);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('Error reading stored regions:', error);
    return null;
  }
};

export const saveStoredRegions = async (regions: any[]): Promise<void> => {
  try {
    if (Array.isArray(regions)) {
      await AsyncStorage.setItem(STORAGE_KEYS.REGIONS, JSON.stringify(regions));

      // Extract image URLs to warm the disk cache
      regions.forEach(region => {
        preloadImageUrls([region?.imageUrl], PRELOAD_PRIORITY.UPCOMING);
        if (Array.isArray(region?.sponsors)) {
          preloadImageUrls(region.sponsors.map((sponsor: any) => sponsor?.imageUrl));
        }
      });
    }
  } catch (error) {
    console.error('Error saving stored regions:', error);
  }
};

// --- Club Users ---
export const getStoredClubUsers = async (): Promise<any[] | null> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.CLUB_USERS);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('Error reading stored club users:', error);
    return null;
  }
};

export const saveStoredClubUsers = async (users: any[]): Promise<void> => {
  try {
    if (Array.isArray(users)) {
      await AsyncStorage.setItem(STORAGE_KEYS.CLUB_USERS, JSON.stringify(users));

      // Extract image URLs to warm the disk cache
      users.forEach(user => {
        preloadImageUrls([user?.clubImageUrl, user?.clubCoverUrl], PRELOAD_PRIORITY.OTHER);
      });
      const imageUrls: string[] = [];
      users.forEach(user => {
        if (user?.locationImageUrl) imageUrls.push(user.locationImageUrl);
        if (user?.masterImageUrl) imageUrls.push(user.masterImageUrl);

        if (Array.isArray(user?.characterList)) {
          user.characterList.forEach((char: any) => {
            if (char?.imageUrl) imageUrls.push(char.imageUrl);
          });
        }
        if (Array.isArray(user?.vorstandMembers)) {
          user.vorstandMembers.forEach((member: any) => {
            if (member?.imageUrl) imageUrls.push(member.imageUrl);
          });
        }
        if (Array.isArray(user?.funktionaereMembers)) {
          user.funktionaereMembers.forEach((member: any) => {
            if (member?.imageUrl) imageUrls.push(member.imageUrl);
          });
        }
      });
      preloadImageUrls(imageUrls, PRELOAD_PRIORITY.DETAILS_PAST);
    }
  } catch (error) {
    console.error('Error saving stored club users:', error);
  }
};

// --- Sponsors ---
export const getStoredSponsors = async (): Promise<any[] | null> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.SPONSORS);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('Error reading stored sponsors:', error);
    return null;
  }
};

export const saveStoredSponsors = async (sponsors: any[]): Promise<void> => {
  try {
    if (Array.isArray(sponsors)) {
      await AsyncStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(sponsors));

      // Extract image URLs to warm the disk cache
      preloadImageUrls(
        sponsors.map(sponsor => sponsor?.imageUrl),
        PRELOAD_PRIORITY.UPCOMING,
      );
    }
  } catch (error) {
    console.error('Error saving stored sponsors:', error);
  }
};
