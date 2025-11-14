import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
} from "react-native";
import { COLORS } from "../../constants/theme";
import TextField from "../customText/TextField";
import { Fonts } from "../../../assets/fonts/fonts";

interface RoundedButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  opacity?: number;
  style?: ViewStyle;
  uppercase?: boolean; // <-- Added
  titleSize?: number;
}

const RoundedButton: React.FC<RoundedButtonProps> = ({
  title,
  onPress,
  opacity = 0.7,
  style,
  uppercase = true, // <-- Default is true
  titleSize,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={opacity}
    >
      <TextField
        textAlign="center"
        text={uppercase ? title.toUpperCase() : title} // <-- Check if should be uppercased
        color={COLORS.green}
        fontSize={titleSize ? titleSize : 20}
        fontFamily={Fonts.heading}
        letterSpacing={1.5}
      />
    </TouchableOpacity>
  );
};

export default RoundedButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.light_green,
    paddingVertical: 20,
    marginVertical: 8,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 14,
    width: "90%",
    alignSelf: "center",
  },
});
