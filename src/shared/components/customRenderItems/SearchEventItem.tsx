import React, { useState, useEffect } from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import TextField from "../customText/TextField";
import { COLORS } from "../../constants/theme";
import { Fonts } from "../../../assets/fonts/fonts";
import { formatTimestamp } from "../../constants/dummyData";
import { useNavigation } from "@react-navigation/native";
import ROUTE_NAMES from "../../../routes/routesName";
import { getCityName, getCachedCityName, extractCityFromEvent } from "../../utils/geocodingUtils";

interface SearchEventItemProps {
  item: any;
}

const SearchEventItem: React.FC<SearchEventItemProps> = ({ item }) => {
  const navigation = useNavigation<any>();

  // Get latitude and longitude from event
  const eventLat =
    item?.eventLatitude ||
    (Array.isArray(item.locations) && item.locations[0]?.latitude);
  const eventLng =
    item?.eventLongitude ||
    (Array.isArray(item.locations) && item.locations[0]?.longitude);

  // Synchronous offline city lookup from persistent cache or event metadata
  const initialCity =
    (eventLat && eventLng ? getCachedCityName(eventLat, eventLng) : "") ||
    extractCityFromEvent(item);

  const [cityName, setCityName] = useState<string>(initialCity);

  // Fetch or resolve city name (works online and offline)
  useEffect(() => {
    let isMounted = true;

    if (eventLat && eventLng) {
      const cached = getCachedCityName(eventLat, eventLng);
      if (cached) {
        setCityName(cached);
      } else {
        const fallback = extractCityFromEvent(item);
        if (fallback) setCityName(fallback);
      }

      getCityName(eventLat, eventLng).then(city => {
        if (isMounted && city) {
          setCityName(city);
        }
      });
    } else {
      const fallback = extractCityFromEvent(item);
      if (fallback) setCityName(fallback);
    }

    return () => {
      isMounted = false;
    };
  }, [eventLat, eventLng, item]);

  // Format event name with city
  const displayText = cityName && cityName.trim()
    ? `${item?.name || ""} - ${cityName.trim()}`
    : item?.name || "";

  const isPast = (item.eventDate || 0) < Date.now();
  const textColor = isPast ? "#999999" : COLORS.green;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        navigation.navigate(ROUTE_NAMES.EVENT_DETAIL_SCREEN, { eventDetails: item });
      }}
      style={styles.card}
    >
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
        text={displayText}
        color={textColor}
        fontFamily={Fonts.comfortaaBold}
        textAlign="center"
        width="100%"
      />
    </TouchableOpacity>
  );
};

export default SearchEventItem;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 100,
    backgroundColor: "#CFE8BE", // same background color as heimevents
  },
});

