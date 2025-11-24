import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import React from "react";
import { COLORS } from "../constants/theme";
import TextField from "../components/customText/TextField";
import { Fonts } from "../../assets/fonts/fonts";
import de from "../../shared/constants/de.json";

interface CustomFooterProps {
  sponsorImg?: string;
  eventLink?: string;
}

const CustomFooter = ({ sponsorImg, eventLink }: CustomFooterProps) => {
  const handlePress = () => {
    if (eventLink) {
      Linking.openURL(eventLink).catch((err) => {
        // Failed to open link - handled silently
      });
    }
  };

  return (
    <View
      style={{
        backgroundColor: COLORS.light_green,
        paddingHorizontal: 14,
        paddingVertical: 10,
        width: "100%",
        alignItems: "center",
      }}
    >
      <TextField
        textAlign="center"
        text={de.presented_by}
        color={COLORS.green}
        fontSize={16}
        fontFamily={Fonts.heading}
        marginTop={4}
        uppercase={true}
        marginBottom={4}
        letterSpacing={1}
      />
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Image
          source={{ uri: sponsorImg }}
          resizeMode="contain"
          style={styles.homeLogo}
        />
      </TouchableOpacity>
    </View>
  );
};

export default CustomFooter;

const styles = StyleSheet.create({
  homeLogo: {
    height: 80,
    width: 150,
  },
});
