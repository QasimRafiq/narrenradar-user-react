// import {StyleSheet, Text, View} from 'react-native';
// import React from 'react';

// const Splash = () => {
//   return (
//     <View>
//       <Text>Splash</Text>
//     </View>
//   );
// };

// export default Splash;

// const styles = StyleSheet.create({});

import {StyleSheet, Animated, SafeAreaView, Easing, Image} from 'react-native';
import React, {useEffect} from 'react';

import ROUTE_NAMES from '../routes/routesName';
import {IMAGES} from '../assets/images';
import {COLORS} from '../shared/constants/theme';

const Splash: React.FC<{navigation: any}> = ({navigation}) => {
  const animation = new Animated.Value(0);

  useEffect(() => {
    const smallLogoDuration = 500;
    const fullSizeLogoDuration = 500;

    const logoAnimation = Animated.sequence([
      Animated.timing(animation, {
        toValue: 0.5,
        duration: smallLogoDuration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: fullSizeLogoDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    logoAnimation.start(() => {
      navigation.navigate(ROUTE_NAMES.WELCOME_SCREEN);
    });
    const loginCheckTimeout = setTimeout(() => {}, 2000);
    return () => clearTimeout(loginCheckTimeout);
  }, [animation, navigation]);

  const logoScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <SafeAreaView
      style={[
        {
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          backgroundColor: COLORS.white,
        },
      ]}>
      <Animated.View
        style={[styles.container, {transform: [{scale: logoScale}]}]}>
        <Image
          source={IMAGES.appIcon}
          resizeMode="contain"
          style={{width: 100, height: 100}}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});
