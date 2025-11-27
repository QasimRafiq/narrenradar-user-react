import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import TextField from "../customText/TextField";
import { COLORS } from "../../constants/theme";
import { Fonts } from "../../../assets/fonts/fonts";

interface CustomGradientButtonProps {
  text: string;
  onPress: () => void;
  colors?: string[];
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  letterSpacing?: number;
  style?: object;
}

const CustomGradientButton = ({
  text,
  onPress,
  colors = ["#004200", "#8dc63f"],
  textColor = COLORS.white,
  fontSize = 14,
  fontFamily = Fonts.heading,
  letterSpacing = 1,
  style = {},
}: CustomGradientButtonProps) => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }} // Horizontal gradient (left to right) like Android
      style={[styles.gradientContainer, style]}
    >
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <TextField
          uppercase={true}
          text={text}
          color={textColor}
          fontSize={fontSize}
          fontFamily={fontFamily}
          letterSpacing={letterSpacing}
          fontWeight="bold"
          textAlign="center"
          numofLine={2}
        />
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default CustomGradientButton;

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: 32, // Match Android: RoundedCornerShape(32.dp)
    minWidth: 220, // Minimum width like Android, but allow expansion
    maxWidth: "90%", // Prevent button from being too wide
    minHeight: 50, // Minimum height like Android, but allow expansion for wrapped text
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: 8,
    paddingHorizontal: 16, // Match Android: horizontal = 16.dp
    paddingVertical: 8, // Match Android: vertical = 8.dp
  },
  button: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
