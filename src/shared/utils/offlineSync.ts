import database from '@react-native-firebase/database';
import {
  saveStoredClubUsers,
  saveStoredEvents,
  saveStoredRegions,
  saveStoredSponsors,
} from './offlineStorage';

let started = false;

// Downloads all data once when the app opens (if online) and stores it
// locally, together with every image and PDF (see offlineStorage queue),
// so the whole app works offline — even screens the user never opened.
// Formatting matches the screen hooks in firebaseUtils.ts / Welcome.tsx.
export const startOfflineSync = () => {
  if (started) return;
  started = true;

  const db = database();

  db.ref('/events')
    .once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) return;
      const events = Object.entries(data)
        .map(([key, value]: any) => ({ id: key, ...value }))
        .filter((event: any) => !event.dummyEvent)
        .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      saveStoredEvents(events);
    })
    .catch(error => console.log('Offline sync: events skipped', error));

  db.ref('/regions')
    .once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) return;
      const regions = Object.entries(data).map(([key, value]: [string, any]) => ({
        id: key,
        ...(typeof value === 'object' && value !== null ? value : {}),
      }));
      saveStoredRegions(regions);
    })
    .catch(error => console.log('Offline sync: regions skipped', error));

  db.ref('club_users')
    .once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) return;
      saveStoredClubUsers(Object.values(data));
    })
    .catch(error => console.log('Offline sync: clubs skipped', error));

  db.ref('footersponsor')
    .once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) return;
      const sponsors: any[] = [];
      for (let i = 0; i < 3; i++) {
        sponsors.push(data?.[`sponsor_${i}`] || {});
      }
      saveStoredSponsors(sponsors);
    })
    .catch(error => console.log('Offline sync: sponsors skipped', error));
};
