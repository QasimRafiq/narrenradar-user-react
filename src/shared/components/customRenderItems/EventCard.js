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
        <View style={styles.titleContainer}>
          <TextField
            textAlign="center"
            text={item?.name}
            color={COLORS.green}
            fontSize={16}
            fontFamily={Fonts.heading}
            uppercase={true}
            fontWeight="normal"
            numofLine={3}
          />
        </View>
        <View style={{ height: 16 }} />
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
              borderRadius: 24,
              width: 280,
            }}
            source={{
              uri: item?.eventImage?.url,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </TouchableOpacity>
        <View style={{ height: 16 }} />
        <View style={styles.dateContainer}>
          <TextField
            textAlign="center"
            text={formatTimestamp(item?.eventDate)}
            color={COLORS.green}
            fontSize={16}
            fontFamily={Fonts.comfortaaMedium}
            fontWeight="500"
            numofLine={1}
          />
        </View>
        <View style={{ height: 8 }} />
        {item?.sponsorLogo ? (
          <CustomFooter
            sponsorImg={item?.sponsorLogo?.url}
            eventLink={item?.sponsorLink}
          />
        ) : (
          <View style={{ height: 200 }} />
        )}
      </View>
    </>
  );
};

export default EventCard;

const styles = StyleSheet.create({
  card: {
    width: width,
    alignItems: "center",
    borderRadius: 16,
    minHeight: 574, // Fixed minimum height: title (~48) + spacing (16) + image (280) + spacing (16) + date (~24) + spacing (8) + footer (200)
  },
  titleContainer: {
    width: "90%",
    minHeight: 48, // Fixed height for title (3 lines max)
    justifyContent: "center",
    alignItems: "center",
  },
  dateContainer: {
    minHeight: 24, // Fixed height for date
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    height: 280,
    borderRadius: 20,
    width: 280,
  },
});
