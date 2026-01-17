import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import React from "react";
import { WebView } from "react-native-webview";
import { COLORS } from "../constants/theme";
import TextField from "../components/customText/TextField";
import { Fonts } from "../../assets/fonts/fonts";
import de from "../../shared/constants/de.json";

interface CustomFooterProps {
  sponsorImg?: string;
  eventLink?: string;
}

const CustomFooter = ({ sponsorImg, eventLink }: CustomFooterProps) => {
  // Check if the image URL is an SVG
  const isSvg = (url?: string): boolean => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.endsWith(".svg") ||
      lowerUrl.includes(".svg?") ||
      lowerUrl.includes("image/svg+xml")
    );
  };

  const handlePress = () => {
    if (eventLink) {
      Linking.openURL(eventLink).catch((err) => {
        // Failed to open link - handled silently
      });
    }
  };

  const isSvgImage = isSvg(sponsorImg);

  return (
    <View style={styles.container}>
      <TextField
        textAlign="center"
        text={de.presented_by}
        color={COLORS.green}
        fontSize={16}
        fontFamily={Fonts.heading}
        marginTop={10}
        uppercase={true}
        letterSpacing={1}
        fontWeight="bold"
      />
      <View style={styles.imageWrapper}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          style={styles.imageContainer}
        >
          {isSvgImage && sponsorImg ? (
            <WebView
              source={{ uri: sponsorImg }}
              style={styles.webView}
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              bounces={false}
              originWhitelist={["*"]}
              scalesPageToFit={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <View style={styles.placeholder} />
                </View>
              )}
            />
          ) : sponsorImg ? (
            <Image source={{ uri: sponsorImg }} style={styles.homeLogo} />
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomFooter;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light_green,
    width: "100%",
    alignItems: "center",
    minHeight: 180,
    height: 180,
    justifyContent: "flex-start",
    paddingBottom: 8,
  },
  imageWrapper: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 4,
    height: 140,
  },
  imageContainer: {
    width: 240,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  homeLogo: {
    width: 240,
    height: 130,
    resizeMode: "contain",
  },
  webView: {
    width: 240,
    height: 130,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    width: 220,
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  placeholder: {
    width: 220,
    height: 130,
    backgroundColor: "transparent",
  },
});
