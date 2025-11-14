// import {
//   ImageBackground,
//   StyleSheet,
//   View,
//   FlatList,
//   TouchableOpacity,
// } from 'react-native';
// import React, {useEffect, useState} from 'react';
// import {IMAGES} from '../../assets/images';
// import {GlobalStyleSheet} from '../../shared/constants/GlobalStyleSheet';
// import CustomHeader from '../../shared/components/customHeader/CusstomHeader';
// import TextField from '../../shared/components/customText/TextField';
// import {COLORS} from '../../shared/constants/theme';
// import {Fonts} from '../../assets/fonts/fonts';
// import de from '../../shared/constants/de.json';
// import database from '@react-native-firebase/database';
// import {formatTimestamp} from '../../shared/constants/dummyData';
// import {useNavigation} from '@react-navigation/native';
// import ROUTE_NAMES from '../../routes/routesName';

// const AwayDateScreen = () => {
//   const navigation = useNavigation<any>();

//   const [awayDates, setAwayDates] = useState<any>([]);

//   useEffect(() => {
//     const eventRef = database()?.ref('/events');
//     const onValueChange = eventRef?.on('value', snapshot => {
//       const data = snapshot?.val();
//       if (data) {
//         const formatted = Object?.entries(data)?.map(([key, value]) => ({
//           id: key,
//           ...value,
//         }));
//         setAwayDates(formatted);
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
//         text={de.away_dates_with_bus_times}
//         color={COLORS.green}
//         fontSize={22}
//         fontFamily={Fonts.heading}
//         marginTop={10}
//         marginBottom={10}
//         letterSpacing={1.5}
//       />

//       <FlatList
//         contentContainerStyle={styles.listContainer}
//         data={awayDates}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({item}) => (
//           <View style={styles.itemWrapper}>
//             {item.awayDates && (
//               <TouchableOpacity
//                 onPress={() => {
//                   navigation.navigate(ROUTE_NAMES.EVENT_DETAIL_SCREEN, {
//                     eventDetails: item,
//                   });
//                 }}>
//                 <View style={styles.row}>
//                   <TextField
//                     text={`${formatTimestamp(item?.eventDate)} - ${item?.name}`}
//                     color={COLORS.green}
//                     fontSize={16}
//                     fontFamily={Fonts.comfortaaMedium}
//                   />
//                 </View>
//                 <View style={styles.detailRow}>
//                   <TextField
//                     text={`Abfahrt Bus: ${item?.awayDates?.departureTime} Uhr`}
//                     color={COLORS.green}
//                     fontSize={16}
//                     fontFamily={Fonts.comfortaaMedium}
//                     lineHeight={22}
//                   />
//                 </View>
//                 <View style={styles.detailRow}>
//                   <TextField
//                     text={`Rückfahrt: ${item?.awayDates?.returnTime} Uhr`}
//                     color={COLORS.green}
//                     fontSize={16}
//                     fontFamily={Fonts.comfortaaMedium}
//                     lineHeight={22}
//                   />
//                 </View>
//               </TouchableOpacity>
//             )}
//           </View>
//         )}
//       />
//     </ImageBackground>
//   );
// };

// export default AwayDateScreen;

// const styles = StyleSheet.create({
//   listContainer: {
//     paddingHorizontal: 16,
//     paddingBottom: 40,
//   },
//   itemWrapper: {
//     marginBottom: 2,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//   },
//   detailRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: 20,
//     marginTop: 10,
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
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {IMAGES} from '../../assets/images';
import {GlobalStyleSheet} from '../../shared/constants/GlobalStyleSheet';
import CustomHeader from '../../shared/components/customHeader/CusstomHeader';
import TextField from '../../shared/components/customText/TextField';
import {COLORS} from '../../shared/constants/theme';
import {Fonts} from '../../assets/fonts/fonts';
import de from '../../shared/constants/de.json';
import database from '@react-native-firebase/database';
import {formatTimestamp} from '../../shared/constants/dummyData';
import {useNavigation, useRoute} from '@react-navigation/native';
import ROUTE_NAMES from '../../routes/routesName';

const AwayDateScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {clubData} = route?.params || {};
  const clubId = clubData?.id;
  console.log('clubId ->', clubId);

  const [awayDates, setAwayDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId) {
      console.warn('⚠️ No clubId found in params');
      setLoading(false);
      return;
    }

    // query events by clubId (same as Android)
    const eventRef = database()
      .ref('/events')
      .orderByChild('clubId')
      .equalTo(clubId);

    const onValueChange = eventRef.on('value', snapshot => {
      const data = snapshot.val();
      console.log('raw events for club ->', data);

      if (data) {
        const events = Object.entries(data)
          .map(([key, value]: any) => {
            const raw = value || {};
            // NORMALIZE awayDates:
            // Cases:
            // 1) raw.awayDates = { departureType: "...", ... }  => use as-is
            // 2) raw.awayDates = { "<clubId>": [ { departureType: ... }, ... ] } => use first element
            let normalizedAwayDates: any = {};
            const rawAway = raw.awayDates;

            if (rawAway) {
              // If awayDates has a key equal to clubId, prefer that
              if (
                typeof rawAway === 'object' &&
                !Array.isArray(rawAway) &&
                Object.prototype.hasOwnProperty.call(rawAway, clubId)
              ) {
                const entry = rawAway[clubId];
                // entry might be an array or an object
                if (Array.isArray(entry) && entry.length > 0) {
                  normalizedAwayDates = entry[0];
                } else if (typeof entry === 'object' && entry !== null) {
                  normalizedAwayDates = entry;
                } else {
                  // fallback: keep rawAway as-is
                  normalizedAwayDates = rawAway;
                }
              } else {
                // no clubId key — use rawAway directly
                normalizedAwayDates = rawAway;
              }
            } else {
              normalizedAwayDates = {};
            }

            // Keep whole event but replace awayDates with normalized version
            return {id: key, ...raw, awayDates: normalizedAwayDates};
          })
          .filter((item: any) => {
            // same filtering logic as before but using normalized awayDates
            const ad = item.awayDates || {};

            // Normalize strings and safe-check types
            const departureType = (ad.departureType || '').toString();
            const returnType = (ad.returnType || '').toString();

            const hasDepartureInfo =
              (departureType.toLowerCase() === 'shuttlebus' &&
                !!ad.departureTime) ||
              (Array.isArray(ad.departureBusTimes) &&
                ad.departureBusTimes.length > 0);

            const hasReturnInfo =
              (returnType.toLowerCase() === 'shuttlebus' && !!ad.returnTime) ||
              (Array.isArray(ad.returnBusTimes) &&
                ad.returnBusTimes.length > 0);

            const matches =
              hasDepartureInfo ||
              hasReturnInfo ||
              departureType === 'Eigene Anreise' ||
              returnType === 'Eigene Anreise' ||
              departureType === 'Nicht angegeben' ||
              returnType === 'Nicht angegeben';

            // Debug each item
            console.log(
              'event:',
              item.id,
              item.name,
              'awayDates(normalized):',
              ad,
              'matches:',
              matches,
            );

            return matches;
          })
          .sort((a: any, b: any) => {
            // sort ascending by eventDate (string or number)
            const da = parseInt(a.eventDate || '0', 10);
            const db = parseInt(b.eventDate || '0', 10);
            return da - db;
          });

        setAwayDates(events);
      } else {
        setAwayDates([]);
      }
      setLoading(false);
    });

    return () => eventRef.off('value', onValueChange);
  }, [clubId]);

  const renderTransportSection = (
    labelBase: string,
    type: string,
    singleTime?: string,
    times?: string[],
  ) => {
    if (singleTime) {
      return (
        <View style={styles.detailRow}>
          <TextField
            text={`${labelBase} ${type}: ${singleTime} Uhr`}
            color={COLORS.green}
            fontSize={16}
            fontFamily={Fonts.comfortaaMedium}
            lineHeight={22}
          />
        </View>
      );
    }

    if (Array.isArray(times) && times.length > 0) {
      const useNumbering = times.length > 1;
      return times.map((time, i) => (
        <View key={i} style={styles.detailRow}>
          <TextField
            text={`${labelBase} ${type}${
              useNumbering ? ` ${i + 1}` : ''
            }: ${time} Uhr`}
            color={COLORS.green}
            fontSize={16}
            fontFamily={Fonts.comfortaaMedium}
            lineHeight={22}
          />
        </View>
      ));
    }

    return null;
  };

  const renderEventItem = ({item}: any) => {
    const ad = item.awayDates || {};

    return (
      <TouchableOpacity
        style={styles.itemWrapper}
        onPress={() => {
          if (item?.sponsorPackage === 'Plus') {
            navigation.navigate(ROUTE_NAMES.EVENT_DETAIL_SCREEN, {
              eventDetails: item,
            });
          } else {
            navigation.navigate(ROUTE_NAMES.Is_Publish_Event_Details, {
              eventDetails: item,
            });
          }
        }}>
        <View style={styles.row}>
          <TextField
            text={`${formatTimestamp(item?.eventDate)} - ${item?.name || ''}`}
            color={COLORS.green}
            fontSize={16}
            fontFamily={Fonts.comfortaaBold}
          />
        </View>

        {ad.departureType === 'Eigene Anreise' ||
        ad.departureType === 'Nicht angegeben' ? (
          <View style={styles.detailRow}>
            <TextField
              text={ad.departureType}
              color={COLORS.green}
              fontSize={16}
              fontFamily={Fonts.comfortaaMedium}
              lineHeight={22}
            />
          </View>
        ) : (
          renderTransportSection(
            'Abfahrt',
            ad.departureType || '',
            ad.departureTime,
            ad.departureBusTimes,
          )
        )}

        {ad.returnType === 'Eigene Abreise' ||
        ad.returnType === 'Nicht angegeben' ? (
          <View style={styles.detailRow}>
            <TextField
              text={ad.returnType}
              color={COLORS.green}
              fontSize={16}
              fontFamily={Fonts.comfortaaMedium}
              lineHeight={22}
            />
          </View>
        ) : (
          renderTransportSection(
            'Rückfahrt',
            ad.returnType || '',
            ad.returnTime,
            ad.returnBusTimes,
          )
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}>
      <CustomHeader />

      <TextField
        uppercase
        textAlign="center"
        text={de.away_dates_with_bus_times}
        color={COLORS.green}
        fontSize={22}
        fontFamily={Fonts.heading}
        marginTop={10}
        marginBottom={10}
        letterSpacing={1.5}
        fontWeight="700"
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <TextField
            text="Daten abrufen..."
            color={COLORS.green}
            fontSize={16}
            textAlign="center"
            marginTop={10}
          />
        </View>
      ) : awayDates.length === 0 ? (
        <View style={styles.center}>
          <TextField
            text="Keine Termine gefunden"
            color={COLORS.green}
            fontSize={16}
            textAlign="center"
          />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContainer}
          data={awayDates}
          keyExtractor={item => item.id}
          renderItem={renderEventItem}
        />
      )}
    </ImageBackground>
  );
};

export default AwayDateScreen;

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  itemWrapper: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginTop: 4,
  },
  center: {
    marginTop: 40,
    alignItems: 'center',
  },
});
