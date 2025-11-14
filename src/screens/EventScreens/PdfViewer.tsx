import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Platform,
  ImageBackground,
} from 'react-native';
import Pdf from 'react-native-pdf';
import {IMAGES} from '../../assets/images';
import {GlobalStyleSheet} from '../../shared/constants/GlobalStyleSheet';
import CustomHeader from '../../shared/components/customHeader/CusstomHeader';
import {COLORS} from '../../shared/constants/theme';
import {useRoute} from '@react-navigation/native';

const PdfViewer = () => {
  const routes = useRoute<any>();
  const {pdfDocument} = routes?.params;
  const source =
    // Platform.OS === "android"
    //   ? { uri: "bundle-assets://aufstellung.pdf" }
    //   :
    {uri: pdfDocument};
  // require('../../assets/pdf/aufstellung.pdf'); // iOS only

  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}>
      <CustomHeader />
      <Pdf
        source={source}
        onLoadComplete={numberOfPages => {
          console.log(`PDF loaded with ${numberOfPages} pages`);
        }}
        onPageChanged={page => {
          console.log(`Current page: ${page}`);
        }}
        onError={error => {
          console.error(error);
        }}
        style={styles.pdf}
        enablePaging={false}
        spacing={0}
        fitPolicy={0}
      />
    </ImageBackground>
  );
};

export default PdfViewer;

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    backgroundColor: COLORS.white,
  },
});
