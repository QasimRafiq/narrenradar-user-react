// import {
//   ImageBackground,
//   StyleSheet,
//   View,
//   ScrollView,
//   TouchableOpacity,
// } from 'react-native';
// import React, {useEffect, useState} from 'react';
// import TextField from '../../shared/components/customText/TextField';
// import {COLORS} from '../../shared/constants/theme';
// import {Fonts} from '../../assets/fonts/fonts';
// import {IMAGES} from '../../assets/images';
// import {GlobalStyleSheet} from '../../shared/constants/GlobalStyleSheet';
// import CustomHeader from '../../shared/components/customHeader/CusstomHeader';
// import de from '../../shared/constants/de.json';
// import {eventsData, formatTimestamp} from '../../shared/constants/dummyData';
// import {useNavigation, useRoute} from '@react-navigation/native';
// import ROUTE_NAMES from '../../routes/routesName';
// import database from '@react-native-firebase/database';

// const ClubEventScreen = () => {
//   const navigation = useNavigation<any>();
//   const routes = useRoute<any>();

//   const {clubData} = routes?.params || {};
//   console.log(clubData.id);

//   const [event, setEvent] = useState<any>([]);

//   useEffect(() => {
//     const eventRef = database()?.ref('/events');
//     const onValueChange = eventRef?.on('value', snapshot => {
//       const data = snapshot?.val();
//       if (data) {
//         const formatted = Object?.entries(data)?.map(([key, value]) => ({
//           id: key,
//           ...value,
//         }));
//         setEvent(formatted);
//       }
//     });
//     return () => eventRef?.off('value', onValueChange);
//   }, []);
//   return (
//     <ImageBackground
//       source={IMAGES.backgroundImg}
//       resizeMode="cover"
//       style={GlobalStyleSheet.bgImage}>
//       <CustomHeader />

//       <TextField
//         uppercase={true}
//         textAlign="center"
//         text={de.event}
//         color={COLORS.green}
//         fontSize={22}
//         fontFamily={Fonts.heading}
//         marginTop={10}
//         marginBottom={20}
//         letterSpacing={1.5}
//       />

//       <ScrollView contentContainerStyle={styles.listContainer}>
//         {event.map((event, index) => (
//           <TouchableOpacity
//             style={styles.eventRow}
//             key={index}
//             activeOpacity={0.7}
//             onPress={() => {
//               navigation.navigate(ROUTE_NAMES.EVENT_DETAIL_SCREEN, {
//                 eventDetails: event,
//               });
//             }}>
//             {/* <Text style={styles.eventText}>
//               {event.date} - {event.title}
//             </Text> */}

//             <TextField
//               fontSize={16}
//               text={`${formatTimestamp(event?.eventDate)} - ${event?.name}`}
//               color={COLORS.green}
//               fontFamily={Fonts.comfortaaBold}
//               marginBottom={10}
//             />
//           </TouchableOpacity>
//         ))}
//       </ScrollView>
//     </ImageBackground>
//   );
// };

// export default ClubEventScreen;

// const styles = StyleSheet.create({
//   listContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 40,
//   },
//   eventRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: 10,
//   },
//   bullet: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: COLORS.green,
//     marginTop: 4,
//     marginRight: 10,
//     fontFamily: Fonts.comfortaaBold,
//   },
// });

import React, {useEffect, useState} from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import TextField from '../../shared/components/customText/TextField';
import {COLORS} from '../../shared/constants/theme';
import {Fonts} from '../../assets/fonts/fonts';
import {IMAGES} from '../../assets/images';
import {GlobalStyleSheet} from '../../shared/constants/GlobalStyleSheet';
import CustomHeader from '../../shared/components/customHeader/CusstomHeader';
import de from '../../shared/constants/de.json';
import {formatTimestamp} from '../../shared/constants/dummyData';
import {useNavigation, useRoute} from '@react-navigation/native';
import ROUTE_NAMES from '../../routes/routesName';
import database from '@react-native-firebase/database';

const ClubEventScreen = () => {
  const navigation = useNavigation<any>();
  const routes = useRoute<any>();
  const {clubData} = routes?.params || {};

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubData?.id) return;

    const eventRef = database().ref('/events');
    const onValueChange = eventRef.on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(([key, value]: any) => ({
          id: key,
          ...value,
        }));

        console.log('🔹 Raw Events:', formatted);
        console.log('🔹 Looking for clubId:', clubData.id);

        // ✅ Updated filtering logic
        const filtered = formatted.filter(item => {
          const eventClubId =
            typeof item.clubId === 'object'
              ? item.clubId?.id || item.clubId?.value
              : item.clubId;

          const hasOwnEvent =
            String(eventClubId)?.trim() === String(clubData.id)?.trim();

          const hasAwayEvent =
            item.awayDates &&
            Object.keys(item.awayDates || {}).includes(String(clubData.id));

          return hasOwnEvent || hasAwayEvent;
        });

        console.log('✅ Filtered Events:', filtered);

        // ✅ Sort ascending by event date
        const sorted = filtered.sort(
          (a, b) => (a.eventDate || 0) - (b.eventDate || 0),
        );

        setEvents(sorted);
      }
      setLoading(false);
    });

    return () => eventRef.off('value', onValueChange);
  }, [clubData?.id]);

  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}>
      <CustomHeader />

      <TextField
        uppercase
        textAlign="center"
        text={de.event}
        color={COLORS.green}
        fontSize={22}
        fontFamily={Fonts.heading}
        marginTop={10}
        marginBottom={10}
        letterSpacing={1.5}
      />

      {loading ? (
        <ActivityIndicator
          color={COLORS.green}
          size="large"
          style={{marginTop: 50}}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {events.length > 0 ? (
            events.map((event, index) => (
              <TouchableOpacity
                key={index}
                style={styles.eventRow}
                activeOpacity={0.7}
                onPress={() => {
                  // console.log(event)
                  if (event?.sponsorPackage === 'Plus') {
                    navigation.navigate(ROUTE_NAMES.EVENT_DETAIL_SCREEN, {
                      eventDetails: event,
                    });
                  } else {
                    navigation.navigate(ROUTE_NAMES.Is_Publish_Event_Details, {
                      eventDetails: event,
                    });
                  }
                }}>
                <TextField
                  fontSize={16}
                  text={`${formatTimestamp(event?.eventDate)} - ${event?.name}`}
                  color={COLORS.green}
                  fontFamily={Fonts.comfortaaBold}
                  marginBottom={10}
                />
              </TouchableOpacity>
            ))
          ) : (
            <TextField
              text=""
              color={COLORS.green}
              textAlign="center"
              fontFamily={Fonts.comfortaaBold}
              marginTop={50}
            />
          )}
        </ScrollView>
      )}
    </ImageBackground>
  );
};

export default ClubEventScreen;

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
});
