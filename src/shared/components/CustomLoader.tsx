// components/CustomLoader.tsx
import React from 'react';
import {ActivityIndicator, StyleSheet, View, Text} from 'react-native';
import {COLORS} from '../../shared/constants/theme';
import {Fonts} from '../../assets/fonts/fonts';

const CustomLoader = ({message = 'Loading...'}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.green} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  message: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.green,
    fontFamily: Fonts.heading,
  },
});

export default CustomLoader;
