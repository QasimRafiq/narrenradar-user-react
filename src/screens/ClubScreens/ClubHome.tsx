import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {IMAGES} from '../../assets/images';
import {GlobalStyleSheet} from '../../shared/constants/GlobalStyleSheet';
import CustomHeader from '../../shared/components/customHeader/CusstomHeader';
import RoundedButton from '../../shared/components/customButton/RoundedButton';
import ROUTE_NAMES from '../../routes/routesName';
import {useNavigation} from '@react-navigation/native';
import {COLORS, FONTS} from '../../shared/constants/theme';
import {Fonts} from '../../assets/fonts/fonts';
import LinearGradient from 'react-native-linear-gradient';
import TextField from '../../shared/components/customText/TextField';
import database from '@react-native-firebase/database';
import {useRegions} from '../../shared/utills/firebaseUtils';
import CustomRegionGrid from '../../shared/components/customRenderItems/CustomRegionGrid';

const {width} = Dimensions.get('window');

const DATA = [
  {
    title: 'NARRENFREUND-SCHAFTSRING ZOLLERNALB E.V.',
    image: {uri: 'https://your-image-url.com/logo1.png'}, // replace with real image URL or require()
  },
  {
    title: 'RING 2',
    image: null,
  },
  {
    title: 'RING XY',
    image: null,
  },
  {
    title: 'OTHERS',
    image: null,
  },
];
const CARD_SIZE = width / 2 - 30;

const ClubHome = () => {
  const navigation = useNavigation<any>();
  const {regions, loading: regionsLoading} = useRegions();

  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}>
      <CustomHeader />
      <ScrollView>
        <RoundedButton
          title="NARRENRADAR"
          onPress={() => console.log()}
          opacity={1}
        />
        <View style={GlobalStyleSheet.componentContainer}>
          <CustomRegionGrid
            data={regions}
            titleKey="name"
            imageKey="imageUrl"
            onPress={item =>
              navigation.navigate(ROUTE_NAMES.CLUB_DETAIL, {regionData: item})
            }
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default ClubHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    alignItems: 'center',
  },

  listContent: {
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    // paddingHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    width: CARD_SIZE,
    alignItems: 'center',
  },
  imageContainer: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: 'red',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
  placeholder: {
    width: '90%',
    height: '90%',
    borderRadius: 20,
    backgroundColor: 'red',
  },
  cardTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'green',
    fontFamily: Fonts.heading,
  },
});
