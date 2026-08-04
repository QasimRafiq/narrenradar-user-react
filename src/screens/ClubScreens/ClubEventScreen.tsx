import React, { useEffect, useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import TextField from '../../shared/components/customText/TextField';
import { COLORS } from '../../shared/constants/theme';
import { Fonts } from '../../assets/fonts/fonts';
import { IMAGES } from '../../assets/images';
import { GlobalStyleSheet } from '../../shared/constants/GlobalStyleSheet';
import CustomHeader from '../../shared/components/customHeader/CusstomHeader';
import { formatTimestamp } from '../../shared/constants/dummyData';
import { useNavigation, useRoute } from '@react-navigation/native';
import ROUTE_NAMES from '../../routes/routesName';
import database from '@react-native-firebase/database';

// Fixed tab & card background colors
const TAB_BG = {
  all: '#F3E6E0',
  fahrplan: '#CFE8BE',
  away: '#EDF4E4',
};

type TabKey = 'all' | 'fahrplan' | 'away';

const ClubEventScreen = () => {
  const navigation = useNavigation<any>();
  const routes = useRoute<any>();
  const { clubData, tab } = routes?.params || {};
  const clubId = clubData?.id;

  const [activeTab, setActiveTab] = useState<TabKey>(tab === 'away' ? 'away' : 'all');
  const [heimEvents, setHeimEvents] = useState<any[]>([]);
  const [awayEvents, setAwayEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId) return;

    const eventRef = database().ref('/events');
    const onValueChange = eventRef.on('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        const formatted: any[] = Object.entries(data).map(([key, value]: any) => ({
          id: key,
          ...value,
        }));

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const cutoff = sixMonthsAgo.getTime();

        // Sort everything latest-first
        const sorted = [...formatted].sort((a, b) => (b.eventDate || 0) - (a.eventDate || 0));

        // Parse the raw Firebase awayDates object into a flat, normalised structure.
        const normaliseAwayData = (clubAwayData: any): any => {
          if (!clubAwayData || typeof clubAwayData !== 'object') return {};
          const parsed: any = { ...clubAwayData };

          // Firebase can store bus-time arrays as keyed objects {"0":"08:00","1":"09:00"}
          // Normalise both departure and return bus times to real arrays.
          if (parsed.departureBusTimes !== null && parsed.departureBusTimes !== undefined) {
            if (!Array.isArray(parsed.departureBusTimes)) {
              parsed.departureBusTimes = Object.values(parsed.departureBusTimes).filter(
                (t: any) => t && String(t).trim() !== '',
              );
            } else {
              parsed.departureBusTimes = parsed.departureBusTimes.filter(
                (t: any) => t && String(t).trim() !== '',
              );
            }
          } else {
            parsed.departureBusTimes = [];
          }

          if (parsed.returnBusTimes !== null && parsed.returnBusTimes !== undefined) {
            if (!Array.isArray(parsed.returnBusTimes)) {
              parsed.returnBusTimes = Object.values(parsed.returnBusTimes).filter(
                (t: any) => t && String(t).trim() !== '',
              );
            } else {
              parsed.returnBusTimes = parsed.returnBusTimes.filter(
                (t: any) => t && String(t).trim() !== '',
              );
            }
          } else {
            parsed.returnBusTimes = [];
          }

          // Normalise single-time strings
          parsed.departureTime = parsed.departureTime
            ? String(parsed.departureTime).trim()
            : null;
          parsed.returnTime = parsed.returnTime
            ? String(parsed.returnTime).trim()
            : null;

          return parsed;
        };

        // --- Heim events: events belonging to this club, excluding any that are already away events ---
        const heim = sorted.filter(item => {
          const eventClubId =
            typeof item.clubId === 'object'
              ? item.clubId?.id || item.clubId?.value
              : item.clubId;

          const isBelongingToClub = String(eventClubId)?.trim() === String(clubId)?.trim();
          if (!isBelongingToClub) return false;

          // Check if this event is already registered as an away event with transport info for this club
          const rawAway = item.awayDates;
          let hasAwayTransport = false;
          if (
            rawAway &&
            typeof rawAway === 'object' &&
            !Array.isArray(rawAway) &&
            Object.prototype.hasOwnProperty.call(rawAway, clubId)
          ) {
            const ad = normaliseAwayData(rawAway[clubId]);
            hasAwayTransport = !!(
              ad.departureType ||
              ad.returnType ||
              (ad.departureBusTimes && ad.departureBusTimes.length > 0) ||
              (ad.returnBusTimes && ad.returnBusTimes.length > 0)
            );
          }

          return !hasAwayTransport && (item.eventDate || 0) >= cutoff;
        });
        setHeimEvents(heim);

        // --- Away events: events where this club appears in awayDates ---
        const away = sorted
          .map((item: any) => {
            const raw = item || {};
            const rawAway = raw.awayDates;
            let parsedAwayDates: any = {};

            if (
              rawAway &&
              typeof rawAway === 'object' &&
              !Array.isArray(rawAway) &&
              Object.prototype.hasOwnProperty.call(rawAway, clubId)
            ) {
              parsedAwayDates = normaliseAwayData(rawAway[clubId]);
            }

            // Store the parsed object under a separate key so the raw awayDates
            // (needed for heim-event anmerkungen lookup) is not overwritten.
            return { ...raw, _parsedAway: parsedAwayDates };
          })
          .filter((item: any) => {
            const ad = item._parsedAway || {};
            // Include if any transport info exists for this club
            const hasTransport =
              ad.departureType ||
              ad.returnType ||
              (ad.departureBusTimes && ad.departureBusTimes.length > 0) ||
              (ad.returnBusTimes && ad.returnBusTimes.length > 0);
            return !!hasTransport && (item.eventDate || 0) >= cutoff;
          });
        setAwayEvents(away);
      }
      setLoading(false);
    });

    return () => eventRef.off('value', onValueChange);
  }, [clubId]);

  const now = new Date().getTime();

  // ---- Helpers (mirrors AwayDateScreen.tsx logic exactly) ----

  const hasDepartureInfo = (ad: any): boolean => {
    if (!ad) return false;
    return (
      (ad.departureType === 'Shuttlebus' && ad.departureTime != null) ||
      (Array.isArray(ad.departureBusTimes) && ad.departureBusTimes.length > 0)
    );
  };

  const hasReturnInfo = (ad: any): boolean => {
    if (!ad) return false;
    return (
      (ad.returnType === 'Shuttlebus' && ad.returnTime != null) ||
      (Array.isArray(ad.returnBusTimes) && ad.returnBusTimes.length > 0)
    );
  };

  const labelWithOptionalNumber = (
    base: string,
    type: string,
    indexOrNull: number | null,
  ): string => {
    return indexOrNull == null ? `${base} ${type}:` : `${base} ${type} ${indexOrNull}:`;
  };

  // Only called for Shuttlebus (when hasDepartureInfo / hasReturnInfo is true)
  const renderTransportSection = (
    type: string,
    singleTime: string | null | undefined,
    times: string[] | null | undefined,
    isDeparture: boolean,
    textColor: string,
  ) => {
    const labelBase = isDeparture ? 'Abfahrt' : 'Rückfahrt';
    const displayType = type || 'Transport';

    // Single time (e.g. Shuttlebus with one departure time)
    if (singleTime && singleTime.trim() !== '') {
      return (
        <View style={styles.detailRow}>
          <TextField
            text={`${labelBase} ${displayType}: ${singleTime.trim()} Uhr`}
            color={textColor}
            fontSize={16}
            fontFamily={Fonts.comfortaaMedium}
            lineHeight={22}
            textAlign="center"
            width="100%"
          />
        </View>
      );
    }

    // Bus-time array
    const safeTimes = (times || []).filter((t: any) => t && String(t).trim() !== '');
    if (safeTimes.length === 0) return null;

    const useNumbering = safeTimes.length > 1;
    return safeTimes.map((time: any, idx: number) => (
      <View key={idx} style={styles.detailRow}>
        <TextField
          text={`${labelWithOptionalNumber(labelBase, displayType, useNumbering ? idx + 1 : null)} ${String(time).trim()} Uhr`}
          color={textColor}
          fontSize={16}
          fontFamily={Fonts.comfortaaMedium}
          lineHeight={22}
          textAlign="center"
          width="100%"
        />
      </View>
    ));
  };

  const renderEventItem = (item: any, index: number, cardBg: string, isAway: boolean) => {
    const isPast = (item.eventDate || 0) < now;
    const textColor = isPast ? '#999999' : COLORS.green;
    // For away items, use the pre-parsed _parsedAway object.
    // For heim items, check awayDates keyed by clubId for anmerkungen.
    const ad = isAway ? (item._parsedAway || {}) : (item.awayDates?.[clubId] || {});

    return (
      <TouchableOpacity
        key={`${item.id}-${index}`}
        style={[styles.card, { backgroundColor: cardBg }]}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate(ROUTE_NAMES.EVENT_DETAIL_SCREEN, { eventDetails: item });
        }}>
        <TextField
          fontSize={16}
          text={formatTimestamp(item?.eventDate)}
          color={textColor}
          fontFamily={Fonts.comfortaaBold}
          textAlign="center"
          marginBottom={5}
          width="100%"
        />
        <TextField
          fontSize={16}
          text={item?.name}
          color={textColor}
          fontFamily={Fonts.comfortaaBold}
          textAlign="center"
          marginBottom={isAway ? 10 : 5}
          width="100%"
        />

        {ad.anmerkungen && ad.anmerkungen.trim() !== '' && (
          <View style={styles.detailRow}>
            <TextField
              text={`Anmerkung:\n${ad.anmerkungen.trim()}`}
              color={textColor}
              fontSize={16}
              fontFamily={Fonts.comfortaaMedium}
              lineHeight={22}
              textAlign="center"
              marginBottom={isAway ? 10 : 0}
              width="100%"
            />
          </View>
        )}

        {isAway && (
          <View style={{ width: '100%', alignItems: 'center' }}>

            {/* Shuttlebus departure with time */}
            {hasDepartureInfo(ad) &&
              renderTransportSection(
                ad.departureType || '',
                ad.departureTime,
                ad.departureBusTimes,
                true,
                textColor,
              )}

            {/* Eigene Anreise — just the label, no prefix */}
            {ad.departureType === 'Eigene Anreise' && (
              <View style={styles.detailRow}>
                <TextField
                  text={ad.departureType}
                  color={textColor}
                  fontSize={16}
                  fontFamily={Fonts.comfortaaMedium}
                  lineHeight={22}
                  textAlign="center"
                  width="100%"
                />
              </View>
            )}

            {/* Nicht angegeben departure — just the label, no prefix */}
            {ad.departureType === 'Nicht angegeben' && (
              <View style={styles.detailRow}>
                <TextField
                  text={ad.departureType}
                  color={textColor}
                  fontSize={16}
                  fontFamily={Fonts.comfortaaMedium}
                  lineHeight={22}
                  textAlign="center"
                  width="100%"
                />
              </View>
            )}

            {/* Shuttlebus return with time */}
            {hasReturnInfo(ad) &&
              renderTransportSection(
                ad.returnType || '',
                ad.returnTime,
                ad.returnBusTimes,
                false,
                textColor,
              )}

            {/* Eigene Abreise — just the label, no prefix */}
            {(ad.returnType === 'Eigene Abreise' || ad.returnType === 'Eigene Anreise') && (
              <View style={styles.detailRow}>
                <TextField
                  text={ad.returnType}
                  color={textColor}
                  fontSize={16}
                  fontFamily={Fonts.comfortaaMedium}
                  lineHeight={22}
                  textAlign="center"
                  width="100%"
                />
              </View>
            )}

            {/* Nicht angegeben return — just the label, no prefix */}
            {ad.returnType === 'Nicht angegeben' && (
              <View style={styles.detailRow}>
                <TextField
                  text={ad.returnType}
                  color={textColor}
                  fontSize={16}
                  fontFamily={Fonts.comfortaaMedium}
                  lineHeight={22}
                  textAlign="center"
                  width="100%"
                />
              </View>
            )}

          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Merged "All Events": combine heim + away, re-sort latest first, deduplicate by id.
  // Away items carry `_parsedAway` (the normalised flat transport object).
  // If an event appears in both lists (e.g. home club also registered as away),
  // keep the away version so transport info is available.
  const allEvents: any[] = (() => {
    const map = new Map<string, { item: any; isAway: boolean }>();
    // Add heim events first
    for (const item of heimEvents) {
      map.set(item.id, { item, isAway: false });
    }
    // Add away events — prefer away version if duplicate (has parsed transport)
    for (const item of awayEvents) {
      map.set(item.id, { item, isAway: true });
    }
    return Array.from(map.values()).sort(
      (a, b) => (b.item.eventDate || 0) - (a.item.eventDate || 0),
    );
  })();

  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}>
      <CustomHeader />

      <TextField
        uppercase
        textAlign="center"
        text="Narrenfahrplan"
        color={COLORS.green}
        fontSize={22}
        fontFamily={Fonts.heading}
        fontWeight="bold"
        fontStyle="italic"
        marginTop={10}
        marginBottom={10}
        letterSpacing={1.5}
        width="100%"
      />

      <View style={styles.tabsContainer}>
        {/* Row 1: ALL */}
        <View style={styles.rowAll}>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              styles.btnAll,
              { backgroundColor: TAB_BG.all },
              activeTab === 'all' && styles.activeBtn,
            ]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.9}>
            <TextField
              textAlign="center"
              text="ALLE EVENTS"
              fontSize={12}
              fontFamily={Fonts.heading}
              color={COLORS.green}
              fontStyle="italic"
              fontWeight="bold"
            />
          </TouchableOpacity>
        </View>

        {/* Row 2: HEIMEVENT & AUSWÄRTS */}
        <View style={styles.rowSub}>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              { backgroundColor: TAB_BG.fahrplan },
              activeTab === 'fahrplan' && styles.activeBtn,
            ]}
            onPress={() => setActiveTab('fahrplan')}
            activeOpacity={0.9}>
            <TextField
              textAlign="center"
              text="HEIMEVENTS"
              fontSize={12}
              fontFamily={Fonts.heading}
              color={COLORS.green}
              fontStyle="italic"
              fontWeight="bold"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              { backgroundColor: TAB_BG.away },
              activeTab === 'away' && styles.activeBtn,
            ]}
            onPress={() => setActiveTab('away')}
            activeOpacity={0.9}>
            <TextField
              textAlign="center"
              text="AUSWÄRTSEVENTS"
              fontSize={12}
              fontFamily={Fonts.heading}
              color={COLORS.green}
              fontStyle="italic"
              fontWeight="bold"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TextField
        text={
          'Hinweis: Mit Klick auf die Veranstaltung gelangst Du zu den Veranstaltungsdetails.'
        }
        color={COLORS.green}
        fontSize={14}
        fontFamily={Fonts.comfortaaLight}
        marginLeft={25}
        marginRight={25}
        textAlign="center"
        width="85%"
        alignSelf="center"
        marginBottom={10}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.green} size="large" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {activeTab === 'all' ? (
            allEvents.length > 0 ? (
              allEvents.map(({ item, isAway }, index) => {
                // Card color: heim events → #CFE8BE, away events → #EDF4E4
                const cardBg = isAway ? TAB_BG.away : TAB_BG.fahrplan;
                return renderEventItem(item, index, cardBg, isAway);
              })
            ) : (
              <TextField
                text="Keine Termine gefunden"
                color={COLORS.green}
                textAlign="center"
                fontFamily={Fonts.comfortaaBold}
                marginTop={50}
                width="100%"
              />
            )
          ) : activeTab === 'fahrplan' ? (
            heimEvents.length > 0 ? (
              heimEvents.map((event, index) =>
                renderEventItem(event, index, TAB_BG.fahrplan, false),
              )
            ) : (
              <TextField
                text="Keine Termine gefunden"
                color={COLORS.green}
                textAlign="center"
                fontFamily={Fonts.comfortaaBold}
                marginTop={50}
                width="100%"
              />
            )
          ) : (
            // activeTab === 'away'
            awayEvents.length > 0 ? (
              awayEvents.map((item, index) =>
                renderEventItem(item, index, TAB_BG.away, true),
              )
            ) : (
              <TextField
                text="Keine Termine gefunden"
                color={COLORS.green}
                textAlign="center"
                fontFamily={Fonts.comfortaaBold}
                marginTop={50}
                width="100%"
              />
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
  tabsContainer: {
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  rowAll: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  rowSub: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  filterBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 5,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  btnAll: {
    alignSelf: 'stretch',
    flex: 1,
  },
  activeBtn: {
    borderColor: COLORS.green,
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
  detailRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
});
