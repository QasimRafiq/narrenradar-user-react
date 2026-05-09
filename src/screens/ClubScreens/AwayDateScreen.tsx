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

    // Fetch ALL events (like Android), then filter in code
    const eventRef = database().ref('/events');

    const onValueChange = eventRef.on('value', snapshot => {
      const data = snapshot.val();

      if (data) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const sixMonthsAgoTimestamp = sixMonthsAgo.getTime();

        const events = Object.entries(data)
          .map(([key, value]: any) => {
            const raw = value || {};
            
            // Parse awayDates for this specific clubId (matching Android parseAwayData)
            // Android: awayDatesSnapshot.child(clubId)
            let parsedAwayDates: any = {};
            const rawAway = raw.awayDates;

            if (rawAway && typeof rawAway === 'object' && !Array.isArray(rawAway)) {
              // Check if awayDates has a key matching clubId
              if (Object.prototype.hasOwnProperty.call(rawAway, clubId)) {
                const clubAwayData = rawAway[clubId];
                
                // Parse the awayDates structure for this club
                if (typeof clubAwayData === 'object' && clubAwayData !== null) {
                  parsedAwayDates = {
                    departureType: clubAwayData.departureType || 'Not specified',
                    departureTime: clubAwayData.departureTime || null,
                    departureBusTimes: clubAwayData.departureBusTimes || null,
                    returnType: clubAwayData.returnType || 'Not specified',
                    returnTime: clubAwayData.returnTime || null,
                    returnBusTimes: clubAwayData.returnBusTimes || null,
                    postcode: clubAwayData.postcode || '',
                    description: clubAwayData.description || '',
                    anmerkungen: clubAwayData.anmerkungen || null,
                    isPublish: clubAwayData.isPublish || false,
                    createdAt: clubAwayData.createdAt || 0,
                  };
                  
                  // Handle departureBusTimes - convert object to array if needed
                  if (parsedAwayDates.departureBusTimes && typeof parsedAwayDates.departureBusTimes === 'object' && !Array.isArray(parsedAwayDates.departureBusTimes)) {
                    parsedAwayDates.departureBusTimes = Object.values(parsedAwayDates.departureBusTimes).filter((t: any) => t);
                  }
                  
                  // Handle returnBusTimes - convert object to array if needed
                  if (parsedAwayDates.returnBusTimes && typeof parsedAwayDates.returnBusTimes === 'object' && !Array.isArray(parsedAwayDates.returnBusTimes)) {
                    parsedAwayDates.returnBusTimes = Object.values(parsedAwayDates.returnBusTimes).filter((t: any) => t);
                  }
                }
              }
            }

            // Return event with parsed awayDates
            return {
              id: key,
              ...raw,
              awayDates: parsedAwayDates,
            };
          })
          .filter((item: any) => {
            // Filter logic matching Android exactly
            const ad = item.awayDates || {};

            const hasDepartureInfo =
              (ad.departureType === 'Shuttlebus' && ad.departureTime != null) ||
              (Array.isArray(ad.departureBusTimes) && ad.departureBusTimes.length > 0);

            const hasReturnInfo =
              (ad.returnType === 'Shuttlebus' && ad.returnTime != null) ||
              (Array.isArray(ad.returnBusTimes) && ad.returnBusTimes.length > 0);

            const matchesTransport =
              hasDepartureInfo ||
              hasReturnInfo ||
              ad.departureType === 'Eigene Anreise' ||
              ad.returnType === 'Eigene Anreise' ||
              ad.departureType === 'Nicht angegeben' ||
              ad.returnType === 'Nicht angegeben';

            const isFutureOrRecent = (item.eventDate || 0) >= sixMonthsAgoTimestamp;

            return matchesTransport && isFutureOrRecent;
          })
          .sort((a: any, b: any) => {
            // Sort ascending by eventDate first
            const da = a.eventDate ? (typeof a.eventDate === 'string' ? parseInt(a.eventDate, 10) : a.eventDate) : Number.MAX_SAFE_INTEGER;
            const db = b.eventDate ? (typeof b.eventDate === 'string' ? parseInt(b.eventDate, 10) : b.eventDate) : Number.MAX_SAFE_INTEGER;
            
            // If dates are the same, sort alphabetically by name
            if (da === db) {
              const nameA = (a.name || '').toLowerCase();
              const nameB = (b.name || '').toLowerCase();
              return nameA.localeCompare(nameB);
            }
            
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

  const now = new Date().getTime();

  // Helper functions matching Android
  const hasDepartureInfo = (awayDates: any): boolean => {
    if (!awayDates) return false;
    return (
      (awayDates.departureType === 'Shuttlebus' && awayDates.departureTime != null) ||
      (Array.isArray(awayDates.departureBusTimes) && awayDates.departureBusTimes.length > 0)
    );
  };

  const hasReturnInfo = (awayDates: any): boolean => {
    if (!awayDates) return false;
    return (
      (awayDates.returnType === 'Shuttlebus' && awayDates.returnTime != null) ||
      (Array.isArray(awayDates.returnBusTimes) && awayDates.returnBusTimes.length > 0)
    );
  };

  const labelWithOptionalNumber = (
    base: string,
    type: string,
    indexOrNull: number | null,
  ): string => {
    if (indexOrNull == null) {
      return `${base} ${type}:`;
    } else {
      return `${base} ${type} ${indexOrNull}:`;
    }
  };

  const renderTransportSection = (
    type: string,
    singleTime: string | null | undefined,
    times: string[] | null | undefined,
    isDeparture: boolean,
    textColor: string,
  ) => {
    const labelBase = isDeparture ? 'Abfahrt' : 'Rückfahrt';
    const displayType = type || 'Transport';

    // Case 1: single time (e.g., Shuttlebus has a single time)
    if (singleTime && singleTime.trim() !== '') {
      return (
        <View style={styles.detailRow}>
          <View style={{flex: 1, flexShrink: 1}}>
            <TextField
              text={`${labelBase} ${displayType}: ${singleTime.trim()} Uhr`}
              color={textColor}
              fontSize={16}
              fontFamily={Fonts.comfortaaMedium}
              lineHeight={20}
            />
          </View>
        </View>
      );
    }

    // Case 2: multiple times (e.g., Bus or any other type with list of times)
    const safeTimes = (times || []).filter(t => t && t.trim() !== '');
    if (safeTimes.length === 0) return null;

    const useNumbering = safeTimes.length > 1;
    return safeTimes.map((time, idx) => {
      const indexForLabel = useNumbering ? idx + 1 : null;
      return (
        <View key={idx} style={styles.detailRow}>
          <View style={{flex: 1, flexShrink: 1}}>
            <TextField
              text={`${labelWithOptionalNumber(labelBase, displayType, indexForLabel)} ${time.trim()} Uhr`}
              color={textColor}
              fontSize={16}
              fontFamily={Fonts.comfortaaMedium}
              lineHeight={20}
            />
          </View>
        </View>
      );
    });
  };

  const renderEventItem = ({item}: any) => {
    const ad = item.awayDates || {};
    const isPast = (item.eventDate || 0) < now;
    const textColor = isPast ? COLORS.text : COLORS.green;

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
        {/* Event row (no bullet) */}
        <View style={styles.row}>
          <TextField
            text={
              item.eventDate
                ? `${formatTimestamp(item.eventDate)} - ${item.name || ''}`
                : item.name || ''
            }
            color={textColor}
            fontSize={16}
            fontFamily={Fonts.comfortaaBold}
          />
        </View>

        {/* Anmerkung */}
        {ad.anmerkungen && ad.anmerkungen.trim() !== '' && (
          <View style={styles.row}>
            <TextField
              text={`Anmerkung: ${ad.anmerkungen.trim()}`}
              color={textColor}
              fontSize={16}
              fontFamily={Fonts.comfortaaMedium}
              lineHeight={20}
            />
          </View>
        )}

        {/* DEPARTURE */}
        {hasDepartureInfo(ad) &&
          renderTransportSection(
            ad.departureType || '',
            ad.departureTime,
            ad.departureBusTimes,
            true,
            textColor,
          )}

        {/* RETURN */}
        {hasReturnInfo(ad) &&
          renderTransportSection(
            ad.returnType || '',
            ad.returnTime,
            ad.returnBusTimes,
            false,
            textColor,
          )}

        {/* Eigene Anreise */}
        {ad.departureType === 'Eigene Anreise' && (
          <View style={styles.detailRow}>
            <TextField
              text={ad.departureType}
              color={textColor}
              fontSize={16}
              fontFamily={Fonts.comfortaaMedium}
              lineHeight={20}
            />
          </View>
        )}

        {/* Eigene Abreise */}
        {ad.returnType === 'Eigene Abreise' && (
          <View style={styles.detailRow}>
            <TextField
              text={ad.returnType}
              color={textColor}
              fontSize={16}
              fontFamily={Fonts.comfortaaMedium}
              lineHeight={20}
            />
          </View>
        )}

        {/* Nicht angegeben - Departure */}
        {ad.departureType === 'Nicht angegeben' && (
          <View style={styles.detailRow}>
            <TextField
              text={ad.departureType}
              color={textColor}
              fontSize={16}
              fontFamily={Fonts.comfortaaMedium}
              lineHeight={20}
            />
          </View>
        )}

        {/* Nicht angegeben - Return */}
        {ad.returnType === 'Nicht angegeben' && (
          <View style={styles.detailRow}>
            <TextField
              text={ad.returnType}
              color={textColor}
              fontSize={16}
              fontFamily={Fonts.comfortaaMedium}
              lineHeight={20}
            />
          </View>
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

              <TextField
                text={
                  "Hinweis: Mit Klick auf die Veranstaltung gelangst Du zu den Veranstaltungsdetails."
                }
                color={COLORS.green}
                fontSize={14}
                fontFamily={Fonts.comfortaaLight}
                marginLeft={25}
                marginRight={10}
                textAlign="left"
              />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <TextField
            text="DATEN ABRUFEN..."
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
    paddingHorizontal: 25,
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
    alignItems: 'flex-start',
    marginLeft: 32,
    marginTop: 2,
    marginBottom: 2,
  },
  center: {
    marginTop: 40,
    alignItems: 'center',
  },
});
