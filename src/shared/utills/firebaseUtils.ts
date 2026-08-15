// hooks/firebaseHooks.ts
import { useEffect, useRef, useState } from 'react';
import database from '@react-native-firebase/database';
import { groupAndFlattenEvents } from './groupedUtils';
import {
  getStoredEvents,
  saveStoredEvents,
  getStoredRegions,
  saveStoredRegions,
  getStoredClubUsers,
  saveStoredClubUsers,
} from '../utils/offlineStorage';
// hooks/useCurrentLocation.ts
import Geolocation from '@react-native-community/geolocation';
import MapView from 'react-native-maps';

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const DEFAULT_REGION: Region = {
  latitude: 31.5204, // fallback (Lahore)
  longitude: 74.3587,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// 🔹 Hook for fetching events (Offline-First + Realtime Sync)
export const useEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [flatGroupedEvents, setFlatGroupedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Instant offline hydration from local storage
    getStoredEvents().then(cached => {
      if (isMounted && cached && cached.length > 0) {
        setEvents(cached);
        setFlatGroupedEvents(groupAndFlattenEvents(cached));
        setLoading(false);
      }
    });

    // 2. Real-time Firebase listener (syncs adds, edits, and deletions)
    const eventsRef = database().ref('/events');

    const onValueChange = eventsRef.on(
      'value',
      snapshot => {
        if (!isMounted) return;
        const data = snapshot.val();
        if (data) {
          const formatted = Object.entries(data)
            .map(([key, value]: any) => ({
              id: key,
              ...value,
            }))
            // Filter out dummyEvent events (matching Android behavior)
            .filter((event: any) => !event.dummyEvent)
            // Sort by createdAt descending (matching Android: events.sortByDescending { it.createdAt })
            .sort((a: any, b: any) => {
              const createdAtA = a.createdAt || 0;
              const createdAtB = b.createdAt || 0;
              return createdAtB - createdAtA; // Descending order (newest first)
            });

          setEvents(formatted);
          setFlatGroupedEvents(groupAndFlattenEvents(formatted));
          saveStoredEvents(formatted);
        } else {
          setEvents([]);
          setFlatGroupedEvents([]);
          saveStoredEvents([]);
        }
        setLoading(false);
      },
      error => {
        console.log('Firebase events listener error (offline or unreachable):', error);
        if (isMounted) {
          setLoading(false);
        }
      },
    );

    return () => {
      isMounted = false;
      eventsRef.off('value', onValueChange);
    };
  }, []);

  return { events, flatGroupedEvents, loading };
};

// 🔹 Hook for fetching regions (Offline-First + Realtime Sync)
export const useRegions = () => {
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Instant offline hydration from local storage
    getStoredRegions().then(cached => {
      if (isMounted && cached && cached.length > 0) {
        setRegions(cached);
        setLoading(false);
      }
    });

    // 2. Real-time Firebase listener
    const regionRef = database().ref('/regions');
    const onValueChange = regionRef.on(
      'value',
      snapshot => {
        if (!isMounted) return;
        const data = snapshot.val();
        if (data) {
          const formatted = Object.entries(data).map(([key, value]: [string, any]) => ({
            id: key,
            ...(typeof value === 'object' && value !== null ? value : {}),
          }));
          setRegions(formatted);
          saveStoredRegions(formatted);
        } else {
          setRegions([]);
          saveStoredRegions([]);
        }
        setLoading(false);
      },
      error => {
        console.log('Firebase regions listener error (offline or unreachable):', error);
        if (isMounted) {
          setLoading(false);
        }
      },
    );

    return () => {
      isMounted = false;
      regionRef.off('value', onValueChange);
    };
  }, []);

  return { regions, loading };
};

// 🔹 Hook for fetching club users (Offline-First + Realtime Sync, optionally filtered by region)
export const useClubUsers = (regionId?: string) => {
  const [clubUsers, setClubUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Instant offline hydration from local storage
    getStoredClubUsers().then(cached => {
      if (isMounted && cached && cached.length > 0) {
        let filteredUsers = cached;
        if (regionId) {
          filteredUsers = cached.filter(
            (user: any) =>
              user?.regionIds &&
              Object.values(user.regionIds).includes(regionId),
          );
        }
        setClubUsers(filteredUsers);
        setLoading(false);
      }
    });

    // 2. Real-time Firebase listener (syncs adds, edits, and deletions)
    const clubUsersRef = database().ref('club_users');
    const onValueChange = clubUsersRef.on(
      'value',
      snapshot => {
        if (!isMounted) return;
        const rawData = snapshot.val();
        const allUsers = rawData ? Object.values(rawData) : [];

        // Save complete list to local storage
        saveStoredClubUsers(allUsers);

        let filteredUsers = allUsers;
        // If regionId is provided, filter by it
        if (regionId) {
          filteredUsers = allUsers.filter(
            (user: any) =>
              user?.regionIds &&
              Object.values(user.regionIds).includes(regionId),
          );
        }

        setClubUsers(filteredUsers);
        setLoading(false);
      },
      error => {
        console.log('Firebase club_users listener error (offline or unreachable):', error);
        if (isMounted) {
          setLoading(false);
        }
      },
    );

    return () => {
      isMounted = false;
      clubUsersRef.off('value', onValueChange);
    };
  }, [regionId]);

  return { clubUsers, loading };
};

export const useCurrentLocation = (
  reverseGeocode?: (lat: number, lng: number) => void,
) => {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const mapRef = useRef<MapView>(null);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

        setRegion(newRegion);

        if (reverseGeocode) reverseGeocode(latitude, longitude);
        mapRef.current?.animateToRegion(newRegion, 1000);
      },
      error => {
        // Alert.alert(
        //   'Standortfehler',
        //   'Standort konnte nicht abgerufen werden. Bitte aktivieren Sie die Standortdienste.',
        // );
        console.log(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return { region, setRegion, mapRef, getCurrentLocation };
};
