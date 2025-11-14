import React, {useEffect, useState} from 'react';
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
} from 'react-native';
import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';
import {IMAGES} from '../../assets/images';
import {GlobalStyleSheet} from '../../shared/constants/GlobalStyleSheet';
import CustomHeader from '../../shared/components/customHeader/CusstomHeader';
import RoundedButton from '../../shared/components/customButton/RoundedButton';
import TextField from '../../shared/components/customText/TextField';
import {COLORS} from '../../shared/constants/theme';
import {Fonts} from '../../assets/fonts/fonts';
import EventCard from '../../shared/components/customRenderItems/EventCard';
import {useNavigation, useRoute} from '@react-navigation/native';
import de from '../../shared/constants/de.json';
import RadiusEventBlock from '../../shared/components/customRenderItems/RadiusEventBlock';
import {useEvents} from '../../shared/utills/firebaseUtils';
import CustomLoader from '../../shared/components/CustomLoader';
import Carousel from 'react-native-reanimated-carousel';
import ROUTE_NAMES from '../../routes/routesName';
import Geolocation from '@react-native-community/geolocation';
import {getDistanceInKm} from '../../shared/constants/dummyData';

const {width} = Dimensions.get('window');

const EventHome = () => {
  const navigation = useNavigation<any>();
  const {events, flatGroupedEvents, loading: eventsLoading} = useEvents();
  const route = useRoute<any>();
  const selectedRegion = route.params?.selectedRegion || null;
  const selectedRadius = route.params?.selectedRadius || null;

  console.log('selectedRegion==>>', selectedRegion);
  console.log('selectedRadius===>', selectedRadius);

  const currentTime = Date.now();

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
      console.log('Params changed, forcing refresh...');
      setRefreshKey(prev => prev + 1);
    }
  }, [selectedRegion, selectedRadius]);

  const checkLocationPermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const result = await check(permission);
    if (result === RESULTS.GRANTED) {
      Geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        error => console.log('Location error:', error),
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
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
      Platform.OS === 'ios'
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
    ? {lat: selectedRegion.latitude, lng: selectedRegion.longitude}
    : userLocation;
  const activeRadius = selectedRadius || 40; // default 40km

  console.log('Active Location:', activeLocation);
  console.log('Active Radius:', activeRadius, 'km');
  console.log('Total flatGroupedEvents:', flatGroupedEvents.length);

  const sponsoredEvents = events?.filter(e => {
    if (!e?.hasSponsoring || e?.sponsorPackage !== 'Plus' || !e?.eventDate)
      return false;
    const eventDate = new Date(e.eventDate).getTime();
    const sevenDaysBefore = eventDate - 7 * 24 * 60 * 60 * 1000;
    const isWithin7Days =
      currentTime >= sevenDaysBefore && currentTime <= eventDate;
    if (!isWithin7Days) return false;

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
        eventLng,
      );
      return distance <= activeRadius;
    }

    // No location → show all sponsored within 7 days
    return true;
  });

  // 🔹 Filter events based on selected or user location
  const filteredEvents = activeLocation
    ? flatGroupedEvents.filter(item => {
        // Get latitude/longitude from item or from first location in locations array
        const itemLat =
          item.latitude || (item.locations && item.locations[0]?.latitude);
        const itemLng =
          item.longitude || (item.locations && item.locations[0]?.longitude);

        console.log(
          'Checking item:',
          item.name,
          'Lat:',
          itemLat,
          'Lng:',
          itemLng,
        );

        // Skip if no valid coordinates
        if (!itemLat || !itemLng || itemLat === 0 || itemLng === 0) {
          console.log('Skipping - no valid coordinates');
          return false;
        }

        const distance = getDistanceInKm(
          activeLocation.lat,
          activeLocation.lng,
          itemLat,
          itemLng,
        );

        console.log(
          'Distance:',
          distance,
          'km, Active Radius:',
          activeRadius,
          'km',
        );

        return distance <= activeRadius;
      })
    : flatGroupedEvents;

  console.log('Filtered Events Count:', filteredEvents.length);
  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}>
      <CustomHeader />
      <ScrollView>
        <View style={styles.container}>
          <RoundedButton title={de.event} onPress={() => {}} opacity={1} />
          <TouchableOpacity onPress={radiusPress} style={styles.radiusButton}>
            <Image
              source={IMAGES.radius_ic}
              resizeMode="contain"
              style={{height: 32, width: 32}}
            />
            <TextField
              uppercase
              textAlign="center"
              text={'Suchradius wählen'}
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
                  style={{marginTop: 10}}
                  key={refreshKey}
                  loop={sponsoredEvents?.length > 1}
                  width={width}
                  height={470}
                  autoPlay={sponsoredEvents?.length > 1}
                  data={sponsoredEvents || []}
                  scrollAnimationDuration={1000}
                  enabled={sponsoredEvents?.length > 1} // 👈 disables swiping when only one
                  renderItem={({item}) => (
                    <EventCard item={item} navigation={navigation} />
                  )}
                />
              )}
            </>
          )}

          <FlatList
            key={refreshKey}
            ListHeaderComponent={() => (
              <TextField
                text={'ALLE EVENTS'}
                color={COLORS.green}
                fontSize={22}
                fontFamily={Fonts.heading}
                marginTop={20}
                marginBottom={10}
                letterSpacing={1.5}
              />
            )}
            data={filteredEvents}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={({item}) => <RadiusEventBlock item={item} />}
            style={styles.radiusList}
          />
        </View>
      </ScrollView>

      {/* 🚨 Permission Modal for iOS */}
      <Modal visible={showPermissionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={{padding: 25, alignItems: 'center'}}>
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
                color={'#333'}
                textAlign="center"
                marginBottom={10}
                width={'80%'}
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
  container: {flex: 1, alignItems: 'center', width: '100%'},
  radiusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  radiusList: {width: '100%', paddingHorizontal: 20},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: COLORS.light,
    borderRadius: 16,
    width: '85%',
  },
  modalButton: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#D3D3D3',
    width: '100%',
    borderBottomEndRadius: 16,
    borderBottomLeftRadius: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
