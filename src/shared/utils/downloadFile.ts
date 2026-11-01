import { Alert, Linking } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { getCachedDocumentPath } from './offlineStorage';

// The real type is read from the file itself — some documents are stored as
// "pdf" but are actually images (and the other way round).
const TYPE_BY_SIGNATURE: { prefix: string; ext: string; isPhoto: boolean }[] = [
  { prefix: 'JVBERi', ext: 'pdf', isPhoto: false }, // %PDF
  { prefix: '/9j/', ext: 'jpg', isPhoto: true },
  { prefix: 'iVBORw0KGgo', ext: 'png', isPhoto: true },
  { prefix: 'R0lGOD', ext: 'gif', isPhoto: true },
  { prefix: 'UklGR', ext: 'webp', isPhoto: true },
  { prefix: 'PD94bWwg', ext: 'svg', isPhoto: false }, // <?xml (Photos can't show SVG)
  { prefix: 'PHN2Zy', ext: 'svg', isPhoto: false }, // <svg
];

const cleanName = (name?: string) =>
  (name || '')
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'Narrenradar';

// "Name.pdf", or "Name (2).pdf" if that file already exists.
const uniquePath = async (dir: string, base: string, ext?: string) => {
  const dot = ext ? `.${ext}` : '';
  let path = `${dir}/${base}${dot}`;
  for (let i = 2; await ReactNativeBlobUtil.fs.exists(path); i++) {
    path = `${dir}/${base} (${i})${dot}`;
  }
  return path;
};

export type DownloadResult = 'photos' | 'files';

export class PhotosPermissionError extends Error {}

/**
 * Download button in the image/PDF viewer — saves directly, no share sheet:
 *  - images → Photos app
 *  - PDFs and other files → Files app › On My iPhone › NARRENRADAR
 * Uses the saved offline copy when there is one, so it also works offline.
 */
export const downloadFile = async (url: string, name?: string): Promise<DownloadResult> => {
  let sourcePath = await getCachedDocumentPath(url);
  let downloadedPath: string | null = null;

  if (!sourcePath) {
    const res = await ReactNativeBlobUtil.config({ fileCache: true, timeout: 30000 }).fetch(
      'GET',
      url,
    );
    const status = res.info().status;
    downloadedPath = res.path();
    if (status < 200 || status >= 300) {
      await ReactNativeBlobUtil.fs.unlink(downloadedPath).catch(() => {});
      throw new Error(`Download failed with status ${status}`);
    }
    sourcePath = downloadedPath;
  }

  try {
    const head = (await ReactNativeBlobUtil.fs.readFile(sourcePath, 'base64')).slice(0, 16);
    const type = TYPE_BY_SIGNATURE.find(t => head.startsWith(t.prefix));
    const base = cleanName(name);

    if (type?.isPhoto) {
      // Photos needs a file with the right extension to recognise the image.
      const tmpDir = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/downloads`;
      await ReactNativeBlobUtil.fs.mkdir(tmpDir).catch(() => {});
      const tmp = `${tmpDir}/${base}.${type.ext}`;
      await ReactNativeBlobUtil.fs.unlink(tmp).catch(() => {});
      await ReactNativeBlobUtil.fs.cp(sourcePath, tmp);
      try {
        await CameraRoll.saveAsset(`file://${tmp}`, { type: 'photo' });
      } catch (error: any) {
        const message = String(error?.message || error).toLowerCase();
        if (message.includes('denied') || message.includes('permission') || message.includes('not authorized')) {
          throw new PhotosPermissionError(message);
        }
        throw error;
      } finally {
        await ReactNativeBlobUtil.fs.unlink(tmp).catch(() => {});
      }
      return 'photos';
    }

    // Documents folder = what the Files app shows for this app.
    const target = await uniquePath(ReactNativeBlobUtil.fs.dirs.DocumentDir, base, type?.ext);
    await ReactNativeBlobUtil.fs.cp(sourcePath, target);
    return 'files';
  } finally {
    if (downloadedPath) await ReactNativeBlobUtil.fs.unlink(downloadedPath).catch(() => {});
  }
};

// Download + tell the user where the file went (or why it failed).
export const downloadWithFeedback = async (url: string, name?: string): Promise<void> => {
  try {
    const where = await downloadFile(url, name);
    Alert.alert(
      'Gespeichert',
      where === 'photos'
        ? 'Das Bild wurde in Deinen Fotos gespeichert.'
        : 'Die Datei wurde in der Dateien-App unter „Auf meinem iPhone › NARRENRADAR“ gespeichert.',
    );
  } catch (error) {
    console.log('Download failed:', error);
    if (error instanceof PhotosPermissionError) {
      Alert.alert(
        'Kein Zugriff auf Fotos',
        'Bitte erlaube NARRENRADAR in den Einstellungen, Bilder zu Deinen Fotos hinzuzufügen.',
        [
          { text: 'Abbrechen', style: 'cancel' },
          { text: 'Einstellungen', onPress: () => Linking.openSettings() },
        ],
      );
    } else {
      Alert.alert(
        'Download fehlgeschlagen',
        'Bitte prüfe Deine Internetverbindung und versuche es erneut.',
      );
    }
  }
};
