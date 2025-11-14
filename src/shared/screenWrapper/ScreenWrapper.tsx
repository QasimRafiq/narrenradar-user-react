// shared/components/ScreenWrapper.tsx

import React, {ReactNode} from 'react';
import {ImageBackground, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {IMAGES} from '../../assets/images'; // Replace with actual path

interface Props {
  children: ReactNode;
}

const ScreenWrapper = ({children}: Props) => {
  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      style={styles.background}
      resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>{children}</SafeAreaView>
    </ImageBackground>
  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
