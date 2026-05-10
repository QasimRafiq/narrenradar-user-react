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
  const {clubData, tab} = routes?.params || {};
  const clubId = clubData?.id;

  const [activeTab, setActiveTab] = useState(tab === 'away' ? 'away' : 'home');
  const [homeEvents, setHomeEvents] = useState<any[]>([]);
  const [awayEvents, setAwayEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId) return;

    const eventRef = database().ref('/events');
    const onValueChange = eventRef.on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(([key, value]: any) => ({
          id: key,
          ...value,
        }));

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const sixMonthsAgoTimestamp = sixMonthsAgo.getTime();

        // 1. Home Events (Club is host)
        const hEvents = formatted.filter(item => {
          const eventClubId =
            typeof item.clubId === 'object'
              ? item.clubId?.id || item.clubId?.value
              : item.clubId;

          const hasOwnEvent = String(eventClubId)?.trim() === String(clubId)?.trim();
          const isFutureOrRecent = (item.eventDate || 0) >= sixMonthsAgoTimestamp;
          return hasOwnEvent && isFutureOrRecent;
        }).sort((a, b) => (a.eventDate || 0) - (b.eventDate || 0));

        setHomeEvents(hEvents);

        // 2. Away Events (Club is guest)
        const aEvents = formatted.map((item: any) => {
          const raw = item || {};
          let parsedAwayDates: any = {};
          const rawAway = raw.awayDates;

          if (rawAway && typeof rawAway === 'object' && !Array.isArray(rawAway)) {
            if (Object.prototype.hasOwnProperty.call(rawAway, clubId)) {
              const clubAwayData = rawAway[clubId];
              if (typeof clubAwayData === 'object' && clubAwayData !== null) {
                parsedAwayDates = {
                  ...clubAwayData,
                  departureType: clubAwayData.departureType || 'Not specified',
                  departureTime: clubAwayData.departureTime || null,
                  departureBusTimes: clubAwayData.departureBusTimes || null,
                  returnType: clubAwayData.returnType || 'Not specified',
                  returnTime: clubAwayData.returnTime || null,
                  returnBusTimes: clubAwayData.returnBusTimes || null,
                };
                
                if (parsedAwayDates.departureBusTimes && typeof parsedAwayDates.departureBusTimes === 'object' && !Array.isArray(parsedAwayDates.departureBusTimes)) {
                  parsedAwayDates.departureBusTimes = Object.values(parsedAwayDates.departureBusTimes).filter((t: any) => t);
                }
                if (parsedAwayDates.returnBusTimes && typeof parsedAwayDates.returnBusTimes === 'object' && !Array.isArray(parsedAwayDates.returnBusTimes)) {
                  parsedAwayDates.returnBusTimes = Object.values(parsedAwayDates.returnBusTimes).filter((t: any) => t);
                }
              }
            }
          }
          return { ...raw, awayDates: parsedAwayDates };
        }).filter((item: any) => {
          const hasAwayEntry = item.awayDates && item.awayDates.createdAt;
          const isFutureOrRecent = (item.eventDate || 0) >= sixMonthsAgoTimestamp;
          return hasAwayEntry && isFutureOrRecent;
        }).sort((a: any, b: any) => (a.eventDate || 0) - (b.eventDate || 0));

        setAwayEvents(aEvents);
      }
      setLoading(false);
    });

    return () => eventRef.off('value', onValueChange);
  }, [clubId]);

  const now = new Date().getTime();

  // Helper functions for Away Dates
  const hasDepartureInfo = (awayDates: any): boolean => {
    if (!awayDates) return false;
    return (awayDates.departureType === 'Shuttlebus' && awayDates.departureTime != null) || (Array.isArray(awayDates.departureBusTimes) && awayDates.departureBusTimes.length > 0);
  };

  const hasReturnInfo = (awayDates: any): boolean => {
    if (!awayDates) return false;
    return (awayDates.returnType === 'Shuttlebus' && awayDates.returnTime != null) || (Array.isArray(awayDates.returnBusTimes) && awayDates.returnBusTimes.length > 0);
  };

  const labelWithOptionalNumber = (base: string, type: string, indexOrNull: number | null): string => {
    return indexOrNull == null ? `${base} ${type}:` : `${base} ${type} ${indexOrNull}:`;
  };

  const renderTransportSection = (type: string, singleTime: string | null | undefined, times: string[] | null | undefined, isDeparture: boolean, textColor: string) => {
    const labelBase = isDeparture ? 'Abfahrt' : 'Rückfahrt';
    const displayType = type || 'Transport';

    if (singleTime && singleTime.trim() !== '') {
      return (
        <View style={styles.detailRow}>
          <TextField text={`${labelBase} ${displayType}: ${singleTime.trim()} Uhr`} color={textColor} fontSize={16} fontFamily={Fonts.comfortaaMedium} lineHeight={20} textAlign="center" />
        </View>
      );
    }

    const safeTimes = (times || []).filter(t => t && t.trim() !== '');
    if (safeTimes.length === 0) return null;

    const useNumbering = safeTimes.length > 1;
    return safeTimes.map((time, idx) => (
      <View key={idx} style={styles.detailRow}>
        <TextField text={`${labelWithOptionalNumber(labelBase, displayType, useNumbering ? idx + 1 : null)} ${time.trim()} Uhr`} color={textColor} fontSize={16} fontFamily={Fonts.comfortaaMedium} lineHeight={20} textAlign="center" />
      </View>
    ));
  };

  const renderEventItem = (item: any, index: number, isAway: boolean) => {
    const isPast = (item.eventDate || 0) < now;
    const cardBg = isPast ? '#f7fbf2' : COLORS.light_green;
    const textColor = isPast ? COLORS.text : COLORS.green;
    const ad = item.awayDates || {};

    return (
      <TouchableOpacity
        key={index}
        style={[styles.card, isPast && styles.pastCard, {backgroundColor: cardBg}]}
        activeOpacity={0.7}
        onPress={() => {
          const screen = item?.sponsorPackage === 'Plus' ? ROUTE_NAMES.EVENT_DETAIL_SCREEN : ROUTE_NAMES.Is_Publish_Event_Details;
          navigation.navigate(screen, { eventDetails: item });
        }}>
        <TextField 
          fontSize={16} 
          text={formatTimestamp(item?.eventDate)} 
          color={textColor} 
          fontFamily={Fonts.comfortaaBold} 
          textAlign="center" 
          marginBottom={5} 
        />
        <TextField 
          fontSize={16} 
          text={item?.name} 
          color={textColor} 
          fontFamily={Fonts.comfortaaBold} 
          textAlign="center" 
          marginBottom={isAway ? 10 : 0} 
        />

        {isAway && (
          <>
            {ad.anmerkungen && ad.anmerkungen.trim() !== '' && (
              <TextField text={`Anmerkung: ${ad.anmerkungen.trim()}`} color={textColor} fontSize={16} fontFamily={Fonts.comfortaaMedium} lineHeight={20} textAlign="center" marginBottom={5} />
            )}
            {hasDepartureInfo(ad) && renderTransportSection(ad.departureType || '', ad.departureTime, ad.departureBusTimes, true, textColor)}
            {hasReturnInfo(ad) && renderTransportSection(ad.returnType || '', ad.returnTime, ad.returnBusTimes, false, textColor)}

            {ad.departureType === 'Eigene Anreise' && (
              <View style={styles.detailRow}>
                <TextField text={ad.departureType} color={textColor} fontSize={16} fontFamily={Fonts.comfortaaMedium} lineHeight={20} textAlign="center" />
              </View>
            )}
            {ad.returnType === 'Eigene Abreise' && (
              <View style={styles.detailRow}>
                <TextField text={ad.returnType} color={textColor} fontSize={16} fontFamily={Fonts.comfortaaMedium} lineHeight={20} textAlign="center" />
              </View>
            )}
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground source={IMAGES.backgroundImg} resizeMode="cover" style={GlobalStyleSheet.bgImage}>
      <CustomHeader />

      <TextField uppercase textAlign="center" text="Narrenfahrplan" color={COLORS.green} fontSize={22} fontFamily={Fonts.heading} fontWeight="bold" fontStyle="italic" marginTop={10} marginBottom={10} letterSpacing={1.5} />

      <TextField text={"Hinweis: Mit Klick auf die Veranstaltung gelangst Du zu den Veranstaltungsdetails."} color={COLORS.green} fontSize={14} fontFamily={Fonts.comfortaaLight} marginLeft={25} marginRight={10} textAlign="center" />

      {/* Toggle Buttons */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterBtn, activeTab === 'home' && styles.filterBtnActive]} onPress={() => setActiveTab('home')}>
          <TextField textAlign="center" text="HEIMEVENT" fontSize={14} fontFamily={Fonts.heading} color={COLORS.green} fontStyle="italic" fontWeight="bold" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, activeTab === 'away' && styles.filterBtnActive]} onPress={() => setActiveTab('away')}>
          <TextField textAlign="center" text="AUSWÄRTSEVENT" fontSize={14} fontFamily={Fonts.heading} color={COLORS.green} fontStyle="italic" fontWeight="bold" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.green} size="large" style={{marginTop: 50}} />
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {activeTab === 'home' ? (
            homeEvents.length > 0 ? homeEvents.map((event, index) => renderEventItem(event, index, false)) : (
              <TextField text="Keine Termine gefunden" color={COLORS.green} textAlign="center" fontFamily={Fonts.comfortaaBold} marginTop={50} />
            )
          ) : (
            awayEvents.length > 0 ? awayEvents.map((item, index) => renderEventItem(item, index, true)) : (
              <TextField text="Keine Termine gefunden" color={COLORS.green} textAlign="center" fontFamily={Fonts.comfortaaBold} marginTop={50} />
            )
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
    paddingTop: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  filterBtn: {
    borderWidth: 0,
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 8,
    backgroundColor: 'rgba(226, 240, 217, 0.4)', // Very light green semi-transparent
    width: '42%',
  },
  filterBtnActive: {
    backgroundColor: COLORS.light_green,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow for card effect
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pastCard: {
    // Background handled dynamically
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
});


