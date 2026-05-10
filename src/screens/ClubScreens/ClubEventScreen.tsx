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

  const [activeTab, setActiveTab] = useState(tab === 'away' ? 'away' : 'fahrplan');
  const [events, setEvents] = useState<any[]>([]);
  const [awayDates, setAwayDates] = useState<any[]>([]);
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

        // 1. Narrenfahrplan (Both Home and Away)
        const fahrplanFiltered = formatted.filter(item => {
          const eventClubId =
            typeof item.clubId === 'object'
              ? item.clubId?.id || item.clubId?.value
              : item.clubId;

          const hasOwnEvent = String(eventClubId)?.trim() === String(clubId)?.trim();
          const hasAwayEvent = item.awayDates && Object.keys(item.awayDates || {}).includes(String(clubId));
          const matchesClub = hasOwnEvent || hasAwayEvent;
          const isFutureOrRecent = (item.eventDate || 0) >= sixMonthsAgoTimestamp;

          return matchesClub && isFutureOrRecent;
        }).sort((a, b) => (a.eventDate || 0) - (b.eventDate || 0));

        setEvents(fahrplanFiltered);

        // 2. Buszeiten (Specifically events with transport info)
        const awayFiltered = formatted.map((item: any) => {
          const raw = item || {};
          let parsedAwayDates: any = {};
          const rawAway = raw.awayDates;

          if (rawAway && typeof rawAway === 'object' && !Array.isArray(rawAway)) {
            if (Object.prototype.hasOwnProperty.call(rawAway, clubId)) {
              const clubAwayData = rawAway[clubId];
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
          const ad = item.awayDates || {};
          const hasDepartureInfo = (ad.departureType === 'Shuttlebus' && ad.departureTime != null) || (Array.isArray(ad.departureBusTimes) && ad.departureBusTimes.length > 0);
          const hasReturnInfo = (ad.returnType === 'Shuttlebus' && ad.returnTime != null) || (Array.isArray(ad.returnBusTimes) && ad.returnBusTimes.length > 0);
          const matchesTransport = hasDepartureInfo || hasReturnInfo || ad.departureType === 'Eigene Anreise' || ad.returnType === 'Eigene Anreise' || ad.departureType === 'Nicht angegeben' || ad.returnType === 'Nicht angegeben';
          const isFutureOrRecent = (item.eventDate || 0) >= sixMonthsAgoTimestamp;
          return matchesTransport && isFutureOrRecent;
        }).sort((a: any, b: any) => (a.eventDate || 0) - (b.eventDate || 0));

        setAwayDates(awayFiltered);
      }
      setLoading(false);
    });

    return () => eventRef.off('value', onValueChange);
  }, [clubId]);

  const now = new Date().getTime();

  // Helper functions for Transport info
  const hasDepartureInfo = (transport: any): boolean => {
    if (!transport) return false;
    return (transport.departureType === 'Shuttlebus' && transport.departureTime != null) || (Array.isArray(transport.departureBusTimes) && transport.departureBusTimes.length > 0);
  };

  const hasReturnInfo = (transport: any): boolean => {
    if (!transport) return false;
    return (transport.returnType === 'Shuttlebus' && transport.returnTime != null) || (Array.isArray(transport.returnBusTimes) && transport.returnBusTimes.length > 0);
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
          <TextField text={`${labelBase} ${displayType}: ${singleTime.trim()} Uhr`} color={textColor} fontSize={16} fontFamily={Fonts.comfortaaMedium} lineHeight={22} textAlign="center" width="100%" />
        </View>
      );
    }

    const safeTimes = (times || []).filter(t => t && t.trim() !== '');
    if (safeTimes.length === 0) return null;

    const useNumbering = safeTimes.length > 1;
    return safeTimes.map((time, idx) => (
      <View key={idx} style={styles.detailRow}>
        <TextField text={`${labelWithOptionalNumber(labelBase, displayType, useNumbering ? idx + 1 : null)} ${time.trim()} Uhr`} color={textColor} fontSize={16} fontFamily={Fonts.comfortaaMedium} lineHeight={22} textAlign="center" width="100%" />
      </View>
    ));
  };

  const renderEventItem = (item: any, index: number, isAway: boolean) => {
    const isPast = (item.eventDate || 0) < now;
    const cardBg = isPast ? '#f7fbf2' : COLORS.light_green;
    const textColor = isPast ? COLORS.text : COLORS.green;
    
    // In 'away' tab, we use the parsed awayDates. In 'fahrplan' tab, we look up the raw awayDates for anmerkungen.
    const ad = isAway ? item.awayDates : (item.awayDates?.[clubId] || {});

    return (
      <TouchableOpacity
        key={index}
        style={[styles.card, isPast && styles.pastCard, {backgroundColor: cardBg}]}
        activeOpacity={0.7}
        onPress={() => {
          const screen = item?.sponsorPackage === 'Plus' ? ROUTE_NAMES.EVENT_DETAIL_SCREEN : ROUTE_NAMES.Is_Publish_Event_Details;
          navigation.navigate(screen, { eventDetails: item });
        }}>
        <TextField fontSize={16} text={formatTimestamp(item?.eventDate)} color={textColor} fontFamily={Fonts.comfortaaBold} textAlign="center" marginBottom={5} width="100%" />
        <TextField fontSize={16} text={item?.name} color={textColor} fontFamily={Fonts.comfortaaBold} textAlign="center" marginBottom={isAway ? 10 : 5} width="100%" />

        {ad.anmerkungen && ad.anmerkungen.trim() !== '' && (
          <View style={styles.detailRow}>
            <TextField text={`Anmerkung: ${ad.anmerkungen.trim()}`} color={textColor} fontSize={16} fontFamily={Fonts.comfortaaMedium} lineHeight={22} textAlign="center" marginBottom={isAway ? 10 : 0} width="100%" />
          </View>
        )}

        {isAway && (
          <View style={{width: '100%', alignItems: 'center'}}>
            {/* Departure */}
            {hasDepartureInfo(ad) ? (
              renderTransportSection(ad.departureType || '', ad.departureTime, ad.departureBusTimes, true, textColor)
            ) : (
              (ad.departureType === 'Eigene Anreise' || ad.departureType === 'Nicht angegeben') && (
                <View style={styles.detailRow}>
                  <TextField text={ad.departureType} color={textColor} fontSize={16} fontFamily={Fonts.comfortaaMedium} lineHeight={22} textAlign="center" width="100%" />
                </View>
              )
            )}

            {/* Return */}
            {hasReturnInfo(ad) ? (
              renderTransportSection(ad.returnType || '', ad.returnTime, ad.returnBusTimes, false, textColor)
            ) : (
              (ad.returnType === 'Eigene Abreise' || ad.returnType === 'Eigene Anreise' || ad.returnType === 'Nicht angegeben') && (
                <View style={styles.detailRow}>
                  <TextField text={ad.returnType} color={textColor} fontSize={16} fontFamily={Fonts.comfortaaMedium} lineHeight={22} textAlign="center" width="100%" />
                </View>
              )
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground source={IMAGES.backgroundImg} resizeMode="cover" style={GlobalStyleSheet.bgImage}>
      <CustomHeader />

      <TextField uppercase textAlign="center" text="Narrenfahrplan" color={COLORS.green} fontSize={22} fontFamily={Fonts.heading} fontWeight="bold" fontStyle="italic" marginTop={10} marginBottom={10} letterSpacing={1.5} width="100%" />

      <TextField text={"Hinweis: Mit Klick auf die Veranstaltung gelangst Du zu den Veranstaltungsdetails."} color={COLORS.green} fontSize={14} fontFamily={Fonts.comfortaaLight} marginLeft={25} marginRight={25} textAlign="center" width="85%" alignSelf="center" />

      {/* Toggle Buttons */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterBtn, activeTab === 'fahrplan' && styles.filterBtnActive]} onPress={() => setActiveTab('fahrplan')}>
          <TextField textAlign="center" text="Fahrplan" fontSize={14} fontFamily={Fonts.heading} color={COLORS.green} fontStyle="italic" fontWeight="bold" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, activeTab === 'away' && styles.filterBtnActive]} onPress={() => setActiveTab('away')}>
          <TextField textAlign="center" text="Buszeiten" fontSize={14} fontFamily={Fonts.heading} color={COLORS.green} fontStyle="italic" fontWeight="bold" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.green} size="large" style={{marginTop: 50}} />
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {activeTab === 'fahrplan' ? (
            events.length > 0 ? events.map((event, index) => renderEventItem(event, index, false)) : (
              <TextField text="Keine Termine gefunden" color={COLORS.green} textAlign="center" fontFamily={Fonts.comfortaaBold} marginTop={50} width="100%" />
            )
          ) : (
            awayDates.length > 0 ? awayDates.map((item, index) => renderEventItem(item, index, true)) : (
              <TextField text="Keine Termine gefunden" color={COLORS.green} textAlign="center" fontFamily={Fonts.comfortaaBold} marginTop={50} width="100%" />
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
    backgroundColor: 'rgba(226, 240, 217, 0.4)',
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 100,
  },
  pastCard: {},
  detailRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
});
