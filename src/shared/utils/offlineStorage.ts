import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import { getCityName } from './geocodingUtils';

export const STORAGE_KEYS = {
  EVENTS: '@narrenradar_events',
  REGIONS: '@narrenradar_regions',
  CLUB_USERS: '@narrenradar_club_users',
  SPONSORS: '@narrenradar_sponsors',
};

// --- Helper to preload images for offline disk cache ---
export const preloadImageUrls = (urls: (string | null | undefined)[]): void => {
  try {
    const validUrls = urls
      .filter((u): u is string => typeof u === 'string' && u.trim().startsWith('http'))
      .map(u => u.trim());

    if (validUrls.length === 0) return;

    const uniqueUrls = Array.from(new Set(validUrls));
    const preloadItems = uniqueUrls.map(uri => ({
      uri,
      priority: FastImage.priority.high,
      cache: FastImage.cacheControl.immutable,
    }));

    FastImage.preload(preloadItems);
  } catch (error) {
    console.log('Error preloading images for offline cache:', error);
  }
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

      // Extract image URLs to warm the disk cache
      const imageUrls: string[] = [];
      events.forEach(event => {
        if (event?.eventImage?.url) imageUrls.push(event.eventImage.url);
        if (event?.sponsorLogo?.url) imageUrls.push(event.sponsorLogo.url);
        if (Array.isArray(event?.locations)) {
          event.locations.forEach((loc: any) => {
            if (loc?.flyer?.url) imageUrls.push(loc.flyer.url);
          });
        }
        if (Array.isArray(event?.toilets)) {
          event.toilets.forEach((toilet: any) => {
            if (toilet?.file?.url) imageUrls.push(toilet.file.url);
            if (toilet?.flyer?.url) imageUrls.push(toilet.flyer.url);
            if (typeof toilet?.file === 'string' && toilet.file.startsWith('http')) {
              imageUrls.push(toilet.file);
            }
          });
        }
      });
      preloadImageUrls(imageUrls);

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
      const imageUrls: string[] = [];
      regions.forEach(region => {
        if (region?.imageUrl) imageUrls.push(region.imageUrl);
        if (Array.isArray(region?.sponsors)) {
          region.sponsors.forEach((sponsor: any) => {
            if (sponsor?.imageUrl) imageUrls.push(sponsor.imageUrl);
          });
        }
      });
      preloadImageUrls(imageUrls);
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
      const imageUrls: string[] = [];
      users.forEach(user => {
        if (user?.clubImageUrl) imageUrls.push(user.clubImageUrl);
        if (user?.clubCoverUrl) imageUrls.push(user.clubCoverUrl);
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
      preloadImageUrls(imageUrls);
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
      const imageUrls: string[] = [];
      sponsors.forEach(sponsor => {
        if (sponsor?.imageUrl) imageUrls.push(sponsor.imageUrl);
      });
      preloadImageUrls(imageUrls);
    }
  } catch (error) {
    console.error('Error saving stored sponsors:', error);
  }
};
