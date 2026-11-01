import {
  StyleSheet,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import FastImage from "react-native-fast-image";
import { WebView } from "react-native-webview";
import ReactNativeBlobUtil from "react-native-blob-util";
import { getCachedDocumentPath } from "../utils/offlineStorage";
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

  // The offline download queue keeps a file copy of every sponsor logo.
  // If that copy is an SVG (some have no ".svg" in the link), show it from
  // the file — FastImage can't draw SVGs, and this also works offline.
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setSvgMarkup(null);
    setImageFailed(false);
    if (sponsorImg) {
      getCachedDocumentPath(sponsorImg)
        .then(async (path) => {
          if (!path) return null;
          const stat = await ReactNativeBlobUtil.fs.stat(path);
          if (Number(stat.size) > 500 * 1024) return null; // logos are small
          return ReactNativeBlobUtil.fs.readFile(path, "utf8");
        })
        .then((markup) => {
          if (!cancelled && markup && markup.includes("<svg")) setSvgMarkup(markup);
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [sponsorImg]);

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
          {(svgMarkup || isSvgImage || imageFailed) && sponsorImg ? (
            <WebView
              source={
                svgMarkup
                  ? {
                      html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;height:100%;background:transparent;display:flex;align-items:center;justify-content:center}svg{max-width:100%;max-height:100%;width:100%;height:100%}</style></head><body>${svgMarkup}</body></html>`,
                    }
                  : { uri: sponsorImg }
              }
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
            <FastImage
              source={{
                uri: sponsorImg,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }}
              style={styles.homeLogo}
              resizeMode={FastImage.resizeMode.contain}
              onError={() => setImageFailed(true)}
            />
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
