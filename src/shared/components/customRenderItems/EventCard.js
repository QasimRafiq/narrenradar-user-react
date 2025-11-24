import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import TextField from "../customText/TextField";
import { COLORS } from "../../constants/theme";
import ROUTE_NAMES from "../../../routes/routesName";
import { Fonts } from "../../../assets/fonts/fonts";
import CustomFooter from "../../customFooter/CustomFooter";
import { formatTimestamp } from "../../constants/dummyData";
import FastImage from "react-native-fast-image";

const { width } = Dimensions.get("window");
const EventCard = ({ item, navigation }) => {
  return (
    <>
      <View style={styles.card}>
        <TextField
          textAlign="center"
          text={item?.name}
          color={COLORS.green}
          fontSize={18}
          fontFamily={Fonts.heading}
          marginBottom={10}
          uppercase={true}
        />
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(ROUTE_NAMES.EVENT_DETAIL_SCREEN, {
              eventDetails: item,
            })
          }
        >
          <FastImage
            style={{
              height: 280,
              borderRadius: 20,
              width: 280,
            }}
            source={{
              uri: item?.eventImage?.url,
              headers: { Authorization: "someAuthToken" },
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
        <TextField
          textAlign="center"
          text={formatTimestamp(item?.eventDate)}
          color={COLORS.green}
          fontSize={18}
          fontFamily={Fonts.comfortaaMedium}
          marginTop={10}
          marginBottom={10}
        />
        {item?.sponsorLogo && (
          <CustomFooter
            sponsorImg={item?.sponsorLogo?.url}
            eventLink={item?.sponsorLink}
          />
        )}
      </View>
    </>
  );
};

export default EventCard;

const styles = StyleSheet.create({
  card: {
    width: width,
    // paddingVertical: 20,
    alignItems: "center",
    borderRadius: 16,
  },
  image: {
    height: 280,
    borderRadius: 20,
    width: 280,
  },
});
