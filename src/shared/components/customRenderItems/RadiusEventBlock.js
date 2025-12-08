import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import TextField from "../customText/TextField";
import { COLORS } from "../../constants/theme";
import { Fonts } from "../../../assets/fonts/fonts";
import { formatTimestamp } from "../../constants/dummyData";
import { useNavigation } from "@react-navigation/native";
import ROUTE_NAMES from "../../../routes/routesName";

// Reverse geocoding function to get city name from lat/long
const getCityName = async (latitude, longitude) => {
  try {
    if (!latitude || !longitude) return null;
    
    // Using BigDataCloud API for faster and better response
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=de`;
    const response = await fetch(url);
    
    const data = await response.json();
    
    if (data) {
      // Try to get city name from various possible fields
      return (
        data.locality ||
        data.city ||
        data.principalSubdivision ||
        null
      );
    }
    
    return null;
  } catch (error) {
    console.log("Error getting city name:", error);
    return null;
  }
};

const RadiusEventBlock = ({ item }) => {
  const navigation = useNavigation();
  const [cityName, setCityName] = useState(null);

  // Handle header items (date headers) - date is already formatted as dd.MM.yyyy
  if (item.type === "header") {
    return (
      <View style={styles.eventBlock}>
        <TextField
          text={item.date}
          color={COLORS.green}
          fontSize={20}
          fontFamily={Fonts.heading}
          marginBottom={10}
        />
      </View>
    );
  }

  // Get latitude and longitude from event
  const eventLat =
    item?.eventLatitude ||
    (Array.isArray(item.locations) && item.locations[0]?.latitude);
  const eventLng =
    item?.eventLongitude ||
    (Array.isArray(item.locations) && item.locations[0]?.longitude);

  // Fetch city name when component mounts or when coordinates change
  useEffect(() => {
    if (eventLat && eventLng) {
      getCityName(eventLat, eventLng).then(setCityName);
    }
  }, [eventLat, eventLng]);

  // Format event name with city
  const displayText = cityName
    ? `${item?.name} - ${cityName}`
    : item?.name;

  // Handle event items
  return (
    <TouchableOpacity
      style={styles.eventBlock}
      onPress={() =>
        navigation.navigate(ROUTE_NAMES.EVENT_DETAIL_SCREEN, {
          eventDetails: item,
        })
      }
    >
      <TextField
        text={`  ${displayText}`}
        color={COLORS.green}
        fontFamily={Fonts.comfortaaMedium}
        marginBottom={10}
        fontSize={16}
      />
    </TouchableOpacity>
  );
};

export default RadiusEventBlock;

const styles = StyleSheet.create({
  eventBlock: {
    marginBottom: 10,
    width: "100%",
  },
});
