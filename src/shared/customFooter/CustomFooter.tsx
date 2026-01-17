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
        width: "100%",
        alignItems: "center",
        minHeight: 200,
        height: 200,
        justifyContent: "flex-start",
      }}
    >
      <TextField
        textAlign="center"
        text={de.presented_by}
        color={COLORS.green}
        fontSize={16}
        fontFamily={Fonts.heading}
        marginTop={8}
        uppercase={true}
        letterSpacing={1}
        fontWeight="bold"
      />
      <View style={{ height: 8 }} />
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          style={styles.imageContainer}
        >
          <Image
            source={{ uri: sponsorImg }}
            resizeMode="contain"
            style={styles.homeLogo}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomFooter;

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    height: 120,
  },
  homeLogo: {
    height: 140,
    width: 140,
  },
});
