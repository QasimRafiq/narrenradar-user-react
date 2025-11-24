import {Image, ImageBackground, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {IMAGES} from '../../assets/images';
import {GlobalStyleSheet} from '../../shared/constants/GlobalStyleSheet';
import CustomHeader from '../../shared/components/customHeader/CusstomHeader';
import RoundedButton from '../../shared/components/customButton/RoundedButton';
import TextField from '../../shared/components/customText/TextField';
import {COLORS} from '../../shared/constants/theme';
import {Fonts} from '../../assets/fonts/fonts';
import de from '../../shared/constants/de.json';
import {useNavigation, useRoute} from '@react-navigation/native';
import ROUTE_NAMES from '../../routes/routesName';
import FastImage from 'react-native-fast-image';

const ClubSelected = () => {
  const navigation = useNavigation<any>();

  const routes = useRoute<any>();
  const {clubData, regionDetail} = routes?.params;
  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}>
      <CustomHeader />

      <FastImage
        style={{
          height: 200,
          width: '100%',
        }}
        source={{
          uri: clubData.clubCoverUrl,
          headers: {Authorization: 'someAuthToken'},
          priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.cover}
      />
      <TextField
        alignSelf={'center'}
        textAlign="center"
        text={clubData.clubName}
        color={COLORS.green}
        fontSize={22}
        fontFamily={Fonts.heading}
        lineHeight={30}
        marginTop={'12%'}
        letterSpacing={1.5}
        uppercase={true}
        width={'70%'}
      />
      <RoundedButton
        title={de.profile}
        onPress={() =>
          navigation.navigate(ROUTE_NAMES.CLUB_PROFILE, {
            clubData,
            regionDetail,
          })
        }
        opacity={0.7}
      />
      <RoundedButton
        title={'Narrenfahrplan'}
        onPress={() => navigation.navigate(ROUTE_NAMES.CLUB_EVENT, {clubData})}
        opacity={0.7}
      />

      <RoundedButton
        title={de.away_dates_with_bus_times}
        onPress={() => navigation.navigate(ROUTE_NAMES.AWAY_DATE, {clubData})}
        opacity={0.7}
      />
    </ImageBackground>
  );
};

export default ClubSelected;

const styles = StyleSheet.create({
  image: {
    height: 200,
    width: '100%',
  },
});
