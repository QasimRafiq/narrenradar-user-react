import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import TextField from "../customText/TextField";
import { COLORS } from "../../constants/theme";
import { Fonts } from "../../../assets/fonts/fonts";
import { formatTimestamp } from "../../constants/dummyData";
import { useNavigation } from "@react-navigation/native";
import ROUTE_NAMES from "../../../routes/routesName";
import { getCityName, getCachedCityName, extractCityFromEvent } from "../../utils/geocodingUtils";

const RadiusEventBlock = ({ item }) => {
  const navigation = useNavigation();

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

  // Get latitude and longitude from event (matching Android: event.locations[0].latitude/longitude)
  const eventLat =
    item?.eventLatitude ||
    (Array.isArray(item.locations) && item.locations[0]?.latitude);
  const eventLng =
    item?.eventLongitude ||
    (Array.isArray(item.locations) && item.locations[0]?.longitude);

  const initialCity =
    (eventLat && eventLng ? getCachedCityName(eventLat, eventLng) : "") ||
    extractCityFromEvent(item);

  const [cityName, setCityName] = useState(initialCity);

  // Fetch city name when component mounts or when coordinates change (matching Android LaunchedEffect)
  useEffect(() => {
    let isMounted = true;
    if (
      eventLat &&
      eventLng &&
      eventLat !== 0 &&
      eventLng !== 0 &&
      !isNaN(eventLat) &&
      !isNaN(eventLng)
    ) {
      const cached = getCachedCityName(eventLat, eventLng);
      if (cached) {
        setCityName(cached);
      } else {
        const fallback = extractCityFromEvent(item);
        if (fallback) setCityName(fallback);
      }

      getCityName(eventLat, eventLng)
        .then((city) => {
          if (isMounted && city) {
            setCityName(city);
          }
        })
        .catch(() => {});
    } else {
      const fallback = extractCityFromEvent(item);
      if (fallback) setCityName(fallback);
    }

    return () => {
      isMounted = false;
    };
  }, [eventLat, eventLng, item]);

  // Format event name with city (matching Android: event.name +" - "+cityName)
  const displayText =
    cityName && cityName.trim()
      ? `${item?.name} - ${cityName.trim()}`
      : item?.name || "";

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
        text={`${displayText}`}
        color={COLORS.green}
        fontFamily={Fonts.comfortaaMedium}
        marginBottom={10}
        fontSize={16}
        marginLeft={10}
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
