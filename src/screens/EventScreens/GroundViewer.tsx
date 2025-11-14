import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import {IMAGES} from '../../assets/images';
import {GlobalStyleSheet} from '../../shared/constants/GlobalStyleSheet';
import CustomHeader from '../../shared/components/customHeader/CusstomHeader';
import {useRoute} from '@react-navigation/native';

const GroundViewer = () => {
  const routes = useRoute<any>();
  const {imgDocument} = routes?.params;
  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}>
      <CustomHeader />
      <ScrollView
        style={{flex: 1}}
        maximumZoomScale={3}
        minimumZoomScale={1}
        bouncesZoom={true}
        contentContainerStyle={{flexGrow: 1}}>
        <Image
          source={{uri: imgDocument}}
          resizeMode="contain"
          style={{width: '100%', height: '100%', bottom: '5%'}}
        />
      </ScrollView>
    </ImageBackground>
  );
};

export default GroundViewer;

const styles = StyleSheet.create({});
