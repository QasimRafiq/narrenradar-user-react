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
        text={`  ${item?.name}`}
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
