import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Or any icon lib you use
import {COLORS} from '../../constants/theme';
import {Fonts} from '../../../assets/fonts/fonts';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import de from '../../../shared/constants/de.json';
import {IMAGES} from '../../../assets/images';
import ROUTE_NAMES from '../../../routes/routesName';

const CustomHeader = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {/* Menu Icon */}
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
        <Icon name="menu" size={32} color={COLORS.green} />
      </TouchableOpacity>

      {/* Title */}
      <TouchableOpacity
        onPress={() => navigation.navigate(ROUTE_NAMES.WELCOME_SCREEN)}
        activeOpacity={0.7}>
        <Text style={styles.title}>{de.app_name}</Text>
      </TouchableOpacity>

      {/* Search Icon */}
      <TouchableOpacity
        onPress={() => navigation.navigate(ROUTE_NAMES.Search_Screen)}>
        <Image
          source={IMAGES.search}
          resizeMode="contain"
          style={{width: 30, height: 30}}
        />
      </TouchableOpacity>
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent', // <-- this makes the background transparent
  },
  iconContainer: {
    // padding: 4,
  },
  title: {
    fontSize: 22,
    letterSpacing: 1.5,
    color: COLORS.green,
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.heading,
  },
});
