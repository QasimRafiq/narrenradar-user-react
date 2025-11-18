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
      end={{ x: 1, y: 1 }}
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
        />
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default CustomGradientButton;

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: 24,
    marginVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    // width: "60%",
    alignSelf: "center",
    marginBottom: 6,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    alignSelf: "center",
  },
});
