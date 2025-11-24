import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import TextField from "../customText/TextField";
import { COLORS } from "../../constants/theme";
import { Fonts } from "../../../assets/fonts/fonts";
import { formatTimestamp } from "../../constants/dummyData";
import { useNavigation } from "@react-navigation/native";
import ROUTE_NAMES from "../../../routes/routesName";

const RadiusEventBlock = ({ item }) => {
  const navigation = useNavigation();
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
        text={formatTimestamp(item.eventDate)}
        color={COLORS.green}
        fontSize={20}
        fontFamily={Fonts.heading}
        marginBottom={10}
      />
      <TextField
        text={`  ${item?.name}`}
        color={COLORS.green}
        fontFamily={Fonts.comfortaaMedium}
        marginBottom={10}
      />

      {/* {item.type === 'header' ? (
        <TextField
          text={formatTimestamp(item.date)}
          color={COLORS.green}
          fontSize={20}
          fontFamily={Fonts.heading}
          marginBottom={10}
        />
      ) : (
        <TextField
          text={`  ${item?.name}`}
          color={COLORS.green}
          fontFamily={Fonts.comfortaaSemiBold}
          marginBottom={10}
        />
      )} */}
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
