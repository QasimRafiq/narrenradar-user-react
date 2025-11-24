import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Slider from "@react-native-community/slider";
import Icon from "react-native-vector-icons/MaterialIcons";

import { Fonts } from "../../assets/fonts/fonts";
import { COLORS } from "../../shared/constants/theme";
import TextField from "../../shared/components/customText/TextField";
import { useNavigation } from "@react-navigation/native";
import { map_api_key } from "../../shared/constants/api";
import { useCurrentLocation } from "../../shared/utills/firebaseUtils";
import ROUTE_NAMES from "../../routes/routesName";

const SLIDER_CONFIG = {
  min: 1000,
  max: 100000,
  step: 1000,
  labels: ["1 km", "25 km", "50 km", "100 km"],
};

const SearchByRadius = () => {
  const navigation = useNavigation<any>();

  // const [region, setRegion] = useState(DEFAULT_REGION);
  const [radius, setRadius] = useState(1000); // 10 km
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // const mapRef = useRef<MapView>(null);

  // 🔹 Fetch formatted address via Geocoding API
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${map_api_key}&language=de`
      );
      const data = await res.json();
      if (data.results?.length > 0) {
        setSelectedAddress(data.results[0].formatted_address);
      } else {
        setSelectedAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (error) {
      setSelectedAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  // 🔹 Update region + address
  const updateRegion = (lat: number, lng: number) => {
    const newRegion = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
    fetchAddress(lat, lng);
  };

  // 🔹 Map tap
  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    updateRegion(latitude, longitude);
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${map_api_key}&language=de`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setSelectedAddress(data.results[0].formatted_address);
      } else {
        setSelectedAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (error) {
      setSelectedAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  };

  const { region, setRegion, mapRef, getCurrentLocation } =
    useCurrentLocation(reverseGeocode);

  return (
    <View style={{ flex: 1 }}>
      {/* 🔹 Top Search Card */}
      <View style={styles.topCard}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <TextField
            text="Standort auswählen"
            color="#000"
            fontSize={20}
            fontFamily={Fonts.comfortaaSemiBold}
          />
        </View>

        <GooglePlacesAutocomplete
          placeholder="Standort eingeben"
          fetchDetails={true}
          onPress={(data, details = null) => {
            try {
              if (details?.geometry?.location) {
                updateRegion(
                  details.geometry.location.lat,
                  details.geometry.location.lng
                );
                setSelectedAddress(data.description);
              } else if (data?.description) {
                // Fallback: use description if details are not available
                setSelectedAddress(data.description);
              }
            } catch (error) {
              // Error handling place selection - handled silently
            }
          }}
          onFail={(error) => {
            // GooglePlacesAutocomplete error - handled silently
          }}
          query={{
            key: map_api_key,
            language: "de",
            components: "country:de", // Optional: restrict to Germany
          }}
          debounce={300}
          minLength={2}
          enablePoweredByContainer={false}
          keepResultsAfterBlur={false}
          textInputProps={{
            onFocus: () => setIsFocused(true),
            onBlur: () => setIsFocused(false),
          }}
          styles={{
            textInput: [
              styles.searchInput,
              {
                borderWidth: 1,
                borderColor: isFocused ? "green" : "#ccc",
                borderRadius: 12,
              },
            ],
            container: { flex: 0, marginBottom: 20 },
            listView: {
              backgroundColor: "#fff",
              marginTop: 4,
              borderWidth: 0.5,
              borderRadius: 16,
              borderColor: "#999",
              padding: 10,
            },
            poweredContainer: {
              display: "none",
            },
          }}
          renderLeftButton={() => (
            <Icon
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
          )}
        />
        {/* Slider Section */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <View>
              <TextField
                text="Suchradius"
                color="#000"
                fontSize={16}
                fontFamily={Fonts.comfortaaMedium}
              />
              <TextField
                text="Radius anpassen"
                color="#999"
                fontSize={12}
                fontFamily={Fonts.comfortaaMedium}
              />
            </View>
            <View style={styles.radiusBadge}>
              <TextField
                text={`${Math.round(radius / 1000)} km`}
                color={COLORS.green}
                fontSize={14}
                fontFamily={Fonts.comfortaaSemiBold}
              />
            </View>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={SLIDER_CONFIG.min}
            maximumValue={SLIDER_CONFIG.max}
            step={SLIDER_CONFIG.step}
            minimumTrackTintColor={COLORS.green}
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor={COLORS.green}
            onValueChange={setRadius}
          />

          <View style={styles.sliderLabels}>
            {SLIDER_CONFIG.labels.map((label, idx) => (
              <TextField
                key={idx}
                text={label}
                color="#999"
                fontSize={12}
                fontFamily={Fonts.comfortaaLight}
              />
            ))}
          </View>
        </View>
      </View>

      {/* 🔹 Map */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        region={region}
        mapType="satellite"
        onPress={handleMapPress}
      >
        <Marker coordinate={region}>
          <Icon name="location-on" size={40} color="#E53935" />
        </Marker>
        <Circle
          center={region}
          radius={radius}
          strokeWidth={2}
          strokeColor={COLORS.green}
          fillColor="rgba(0,200,0,0.15)"
        />
      </MapView>

      {/* 🔹 Floating Location Button */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={getCurrentLocation}
      >
        <Icon name="my-location" size={30} color={COLORS.green} />
      </TouchableOpacity>

      {/* 🔹 Bottom Card */}
      <View style={styles.bottomCard}>
        <View style={styles.locationBox}>
          <View style={styles.locationIconWrapper}>
            <Icon name="location-on" size={24} color={COLORS.green} />
          </View>
          <View style={styles.locationInfo}>
            <TextField
              text="Ausgewählter Standort"
              color="#999"
              fontSize={12}
              fontFamily={Fonts.comfortaaMedium}
              marginBottom={10}
            />
            <TextField
              text={
                selectedAddress ||
                `${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}`
              }
              color="#000"
              fontSize={14}
              fontFamily={Fonts.comfortaaMedium}
              lineHeight={22}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate(ROUTE_NAMES.EVENT_HOME_SCREEN, {
              selectedRegion: region,
              selectedRadius: radius / 1000, // convert to km
            });
          }}
          style={styles.confirmBtn}
        >
          <TextField
            text="Standort bestätigen"
            color="#fff"
            fontSize={16}
            fontFamily={Fonts.comfortaaSemiBold}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchByRadius;

const styles = StyleSheet.create({
  topCard: {
    position: "absolute",
    top: 0,
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginTop: 20,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  searchWrapper: {
    marginBottom: 20,
  },
  searchInput: {
    height: 55,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 40,
    fontSize: 14,
    backgroundColor: "#fff",
    color: "#000",
    fontFamily: Fonts.comfortaaRegular,
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: 18,
    zIndex: 1,
  },
  sliderSection: {
    marginTop: 8,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  radiusBadge: {
    backgroundColor: "rgba(0, 200, 0, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  locationButton: {
    position: "absolute",
    right: 20,
    bottom: 200,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomCard: {
    position: "absolute",
    bottom: 10,
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignSelf: "center",
  },
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  locationIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  confirmBtn: {
    backgroundColor: COLORS.green,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
});
