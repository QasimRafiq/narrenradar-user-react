// hooks/firebaseHooks.ts
import {useEffect, useRef, useState} from 'react';
import database from '@react-native-firebase/database';
import {groupAndFlattenEvents} from './groupedUtils';
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

// 🔹 Hook for fetching events
export const useEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [flatGroupedEvents, setFlatGroupedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const eventsRef = database().ref('/events');

    const onValueChange = eventsRef.on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data)
          .map(([key, value]: any) => ({
            id: key,
            ...value,
          }))
          // Filter out dummyEvent events (matching Android behavior)
          .filter((event: any) => !event.dummyEvent)
          // Sort by eventDate ascending (matching Android behavior)
          .sort((a: any, b: any) => {
            const dateA = a.eventDate || 0;
            const dateB = b.eventDate || 0;
            return dateA - dateB;
          });
        
        setEvents(formatted);
        setFlatGroupedEvents(groupAndFlattenEvents(formatted));
      } else {
        setEvents([]);
        setFlatGroupedEvents([]);
      }
      setLoading(false);
    });

    return () => eventsRef.off('value', onValueChange);
  }, []);

  return {events, flatGroupedEvents, loading};
};

// 🔹 Hook for fetching regions
export const useRegions = () => {
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const regionRef = database().ref('/regions');
    const onValueChange = regionRef.on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setRegions(formatted);
      } else {
        setRegions([]);
      }
      setLoading(false);
    });

    return () => regionRef.off('value', onValueChange);
  }, []);

  return {regions, loading};
};

// 🔹 Hook for fetching club users (optionally filtered by region)
export const useClubUsers = (regionId?: string) => {
  const [clubUsers, setClubUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await database().ref('club_users').once('value');
        const allUsers = snapshot.val() ? Object.values(snapshot.val()) : [];

        let filteredUsers = allUsers;

        // ✅ If regionId is provided, filter by it
        if (regionId) {
          filteredUsers = allUsers.filter(
            (user: any) =>
              user?.regionIds &&
              Object.values(user.regionIds).includes(regionId),
          );
        }

        setClubUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching club users:', error);
        setClubUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [regionId]);

  return {clubUsers, loading};
};

export const useCurrentLocation = (
  reverseGeocode?: (lat: number, lng: number) => void,
) => {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const mapRef = useRef<MapView>(null);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
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
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {region, setRegion, mapRef, getCurrentLocation};
};
