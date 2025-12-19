import React, { useState, useEffect } from "react";
import { TouchableOpacity } from "react-native";
import TextField from "../customText/TextField";
import { COLORS } from "../../constants/theme";
import { Fonts } from "../../../assets/fonts/fonts";
import { formatTimestamp } from "../../constants/dummyData";
import { useNavigation } from "@react-navigation/native";
import ROUTE_NAMES from "../../../routes/routesName";
import { getCityName } from "../../utils/geocodingUtils";

interface SearchEventItemProps {
  item: any;
}

const SearchEventItem: React.FC<SearchEventItemProps> = ({ item }) => {
  const navigation = useNavigation<any>();
  const [cityName, setCityName] = useState<string | null>(null);

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
    ? `${item?.name || ""} - ${cityName}`
    : item?.name || "";

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate(ROUTE_NAMES.EVENT_DETAIL_SCREEN, {
          eventDetails: item,
        })
      }
      style={{ marginBottom: 18 }}
    >
      <TextField
        text={`${formatTimestamp(item.eventDate)}- ${displayText}`}
        fontSize={18}
        color={COLORS.green}
        fontFamily={Fonts.comfortaaSemiBold}
      />
    </TouchableOpacity>
  );
};

export default SearchEventItem;

