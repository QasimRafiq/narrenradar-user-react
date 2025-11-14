import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import TextField from '../customText/TextField';
import {COLORS} from '../../constants/theme';
import {Fonts} from '../../../assets/fonts/fonts';

const CustomGradientButton = ({
  text,
  onPress,
  colors = ['#008243', '#8dc63f'],
  textColor = COLORS.white,
  fontSize = 14,
  fontFamily = Fonts.heading,
  letterSpacing = 1,
  style = {},
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[styles.gradientContainer, style]}>
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
    borderRadius: 32,
    marginVertical: 16,
    // width: "65%",
    alignSelf: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
});
