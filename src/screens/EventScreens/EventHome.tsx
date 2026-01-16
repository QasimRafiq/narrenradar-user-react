import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  Linking,
  Platform,
} from "react-native";
import { check, PERMISSIONS, RESULTS, request } from "react-native-permissions";
import { IMAGES } from "../../assets/images";
import { GlobalStyleSheet } from "../../shared/constants/GlobalStyleSheet";
import CustomHeader from "../../shared/components/customHeader/CusstomHeader";
import RoundedButton from "../../shared/components/customButton/RoundedButton";
import TextField from "../../shared/components/customText/TextField";
import { COLORS } from "../../shared/constants/theme";
import { Fonts } from "../../assets/fonts/fonts";
import EventCard from "../../shared/components/customRenderItems/EventCard";
import { useNavigation, useRoute } from "@react-navigation/native";
import de from "../../shared/constants/de.json";
import RadiusEventBlock from "../../shared/components/customRenderItems/RadiusEventBlock";
import { useEvents } from "../../shared/utills/firebaseUtils";
import CustomLoader from "../../shared/components/CustomLoader";
import Carousel from "react-native-reanimated-carousel";
import ROUTE_NAMES from "../../routes/routesName";
import Geolocation from "@react-native-community/geolocation";
import { getDistanceInKm } from "../../shared/constants/dummyData";
import { groupAndFlattenEvents } from "../../shared/utills/groupedUtils";

const { width } = Dimensions.get("window");

const EventHome = () => {
  const navigation = useNavigation<any>();
  const { events, flatGroupedEvents, loading: eventsLoading } = useEvents();
  const route = useRoute<any>();
  const selectedRegion = route.params?.selectedRegion || null;
  const selectedRadius = route.params?.selectedRadius || null;

  // Get start of today (midnight) for date comparison to include today's events
  const getStartOfToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  };
  const currentTime = Date.now();
  const startOfToday = getStartOfToday();

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  // 🔹 Force re-render when params change
  useEffect(() => {
    if (selectedRegion || selectedRadius) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [selectedRegion, selectedRadius]);

  const checkLocationPermission = async () => {
    const permission =
      Platform.OS === "ios"
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const result = await check(permission);
    if (result === RESULTS.GRANTED) {
      Geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          // Location error handled silently
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else if (result === RESULTS.DENIED) {
      const newStatus = await request(permission);
      if (newStatus === RESULTS.GRANTED) {
        checkLocationPermission();
      } else {
        setShowPermissionModal(true);
      }
    } else if (result === RESULTS.BLOCKED) {
      setShowPermissionModal(true);
    }
  };

  const openSettings = () => {
    setShowPermissionModal(false);
    Linking.openSettings();
  };

  const radiusPress = async () => {
    const permission =
      Platform.OS === "ios"
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const result = await check(permission);

    if (result === RESULTS.GRANTED) {
      navigation.navigate(ROUTE_NAMES.Search_By_Radius);
    } else if (result === RESULTS.DENIED) {
      const newStatus = await request(permission);
      if (newStatus === RESULTS.GRANTED) {
        navigation.navigate(ROUTE_NAMES.Search_By_Radius);
      } else {
        setShowPermissionModal(true);
      }
    } else if (result === RESULTS.BLOCKED) {
      setShowPermissionModal(true);
    }
  };

  // 🔹 Determine active location and radius
  const activeLocation = selectedRegion
    ? { lat: selectedRegion.latitude, lng: selectedRegion.longitude }
    : userLocation;
  const activeRadius = selectedRadius || 100; // default 100km

  // Matching Android logic: events from today up to 7 days in the future
  const sponsoredEvents = events
    ?.filter((e) => {
      if (!e?.hasSponsoring || e?.sponsorPackage !== "Plus" || !e?.eventDate)
        return false;

      const eventDate = new Date(e.eventDate).getTime();
      const sevenDaysFromNow = currentTime + 7 * 24 * 60 * 60 * 1000;

      // Include events from today onwards, up to 7 days in the future
      const isWithin7DaysFromNow =
        eventDate >= currentTime && eventDate <= sevenDaysFromNow;
      if (!isWithin7DaysFromNow) return false;

      // Extract location
      const eventLat =
        e?.eventLatitude ||
        (Array.isArray(e.locations) && e.locations[0]?.latitude);
      const eventLng =
        e?.eventLongitude ||
        (Array.isArray(e.locations) && e.locations[0]?.longitude);

      // If location enabled → check radius
      if (activeLocation && eventLat && eventLng) {
        const distance = getDistanceInKm(
          activeLocation.lat,
          activeLocation.lng,
          eventLat,
          eventLng
        );
        return distance <= activeRadius;
      }

      // No location → show all sponsored within 7 days from now
      return true;
    })
    .sort((a, b) => (a.eventDate || 0) - (b.eventDate || 0)); // Sort by eventDate ascending

  // 🔹 Filter events based on selected or user location (matching Android behavior)
  // Android: currentLocation == null || isEventWithinRadius(...)
  // This means: if no location, show ALL events. If location exists, filter by radius.
  const filteredEvents = React.useMemo(() => {
    // Helper function to check if event is in the past
    // Compare with start of today to include today's events
    const isEventInPast = (event: any) => {
      if (!event?.eventDate) return false;
      const eventDate = new Date(event.eventDate).getTime();
      // Get start of event date (midnight) for fair comparison
      const eventDateStart = new Date(event.eventDate);
      eventDateStart.setHours(0, 0, 0, 0);
      return eventDateStart.getTime() < startOfToday;
    };

    if (!activeLocation) {
      // No location selected → show all events (matching Android)
      // Filter out past events, but keep headers only if they have future events
      const filtered: any[] = [];
      let currentHeader: any = null;
      
      for (let i = 0; i < flatGroupedEvents.length; i++) {
        const item = flatGroupedEvents[i];
        
        if (item.type === 'header') {
          currentHeader = item;
        } else if (item.type === 'event') {
          if (!isEventInPast(item)) {
            // Add header if this is the first event for this date
            if (currentHeader && (filtered.length === 0 || filtered[filtered.length - 1].type !== 'header')) {
              filtered.push(currentHeader);
            }
            filtered.push(item);
          }
        }
      }
      
      return filtered;
    }

    // Location exists → filter by radius
    // First filter the raw events, then group them (matching Android: filter first, then group)
    const filteredRawEvents = events.filter((event) => {
      // Filter out past events
      if (isEventInPast(event)) {
        return false;
      }

      // Get latitude/longitude from event
      const eventLat =
        event?.eventLatitude ||
        (Array.isArray(event.locations) && event.locations[0]?.latitude);
      const eventLng =
        event?.eventLongitude ||
        (Array.isArray(event.locations) && event.locations[0]?.longitude);

      // Skip if no valid coordinates
      if (!eventLat || !eventLng || eventLat === 0 || eventLng === 0) {
        return false;
      }

      const distance = getDistanceInKm(
        activeLocation.lat,
        activeLocation.lng,
        eventLat,
        eventLng
      );

      return distance <= activeRadius;
    });

    // Group the filtered events by date (matching Android behavior)
    return groupAndFlattenEvents(filteredRawEvents);
  }, [activeLocation, activeRadius, events, flatGroupedEvents, startOfToday]);

  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}
    >
      <CustomHeader />
      <FlatList
        key={refreshKey}
        ListHeaderComponent={() => (
          <View style={styles.container}>
            <RoundedButton title={de.event} onPress={() => {}} opacity={1} />
            <TouchableOpacity onPress={radiusPress} style={styles.radiusButton}>
              <Image
                source={IMAGES.radius_ic}
                resizeMode="contain"
                style={{ height: 32, width: 32 }}
              />
              <TextField
                uppercase
                textAlign="center"
                text={"Suchradius wählen"}
                color={COLORS.green}
                fontSize={20}
                fontFamily={Fonts.heading}
                letterSpacing={1.5}
                marginLeft={10}
              />
            </TouchableOpacity>
            {sponsoredEvents?.length > 0 && (
              <>
                {eventsLoading ? (
                  <CustomLoader message="Ereignisse werden geladen..." />
                ) : (
                  <Carousel
                    style={{ marginTop: 10 }}
                    key={refreshKey}
                    loop={sponsoredEvents?.length > 1}
                    width={width}
                    height={500}
                    autoPlay={sponsoredEvents?.length > 1}
                    autoPlayInterval={4000}
                    data={sponsoredEvents || []}
                    scrollAnimationDuration={1000}
                    enabled={sponsoredEvents?.length > 1}
                    onConfigurePanGesture={(gesture) => {
                      'worklet';
                      gesture.activeOffsetX([-10, 10]);
                      gesture.failOffsetY([-5, 5]);
                    }}
                    renderItem={({ item }) => (
                      <EventCard item={item} navigation={navigation} />
                    )}
                  />
                )}
              </>
            )}
            <View style={{ width: "100%" }}>
              <TextField
                text={"ALLE EVENTS"}
                color={COLORS.green}
                fontSize={22}
                fontFamily={Fonts.heading}
                marginTop={20}
                marginBottom={6}
                letterSpacing={1.5}
              />
              <TextField
                text={
                  "Hinweis: Mit Klick auf die Veranstaltung gelangst Du zu den Veranstaltungsdetails."
                }
                color={COLORS.green}
                fontSize={14}
                fontFamily={Fonts.comfortaaLight}
                marginBottom={10}
                textAlign="left"
              />
            </View>
          </View>
        )}
        data={filteredEvents}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item }) => <RadiusEventBlock item={item} />}
        contentContainerStyle={[styles.flatListContent, { paddingHorizontal: 20 }]}
        style={styles.radiusList}
      />

      {/* 🚨 Permission Modal for iOS */}
      <Modal visible={showPermissionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={{ padding: 25, alignItems: "center" }}>
              <TextField
                text={de.permission_required}
                color={COLORS.black}
                fontSize={16}
                fontFamily={Fonts.comfortaaSemiBold}
                textAlign="center"
                letterSpacing={1}
                marginBottom={10}
              />
              <TextField
                text={de.permission_des}
                fontFamily={Fonts.comfortaaLight}
                color={"#333"}
                textAlign="center"
                marginBottom={10}
                width={"80%"}
              />
            </View>

            <View style={styles.modalButton}>
              <TouchableOpacity onPress={() => setShowPermissionModal(false)}>
                <TextField
                  text={de.no}
                  fontFamily={Fonts.comfortaaLight}
                  color={COLORS.black}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={openSettings}>
                <TextField
                  text={de.yes}
                  fontFamily={Fonts.comfortaaLight}
                  color={COLORS.black}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

export default EventHome;

const styles = StyleSheet.create({
  container: { alignItems: "center", width: "100%" },
  radiusButton: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  radiusList: { width: "100%" },
  flatListContent: {
    paddingBottom: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: COLORS.light,
    borderRadius: 16,
    width: "85%",
  },
  modalButton: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#D3D3D3",
    width: "100%",
    borderBottomEndRadius: 16,
    borderBottomLeftRadius: 16,
    alignItems: "center",
    justifyContent: "space-around",
  },
});
