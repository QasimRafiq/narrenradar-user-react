import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Platform,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import Pdf from 'react-native-pdf';
import {IMAGES} from '../../assets/images';
import {GlobalStyleSheet} from '../../shared/constants/GlobalStyleSheet';
import CustomHeader from '../../shared/components/customHeader/CusstomHeader';
import {COLORS} from '../../shared/constants/theme';
import {useRoute, useNavigation} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const PdfViewer = () => {
  const routes = useRoute<any>();
  const navigation = useNavigation<any>();
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
      {/* Close Button - Always visible */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <AntDesign name="close" size={18} color={COLORS.white} />
      </TouchableOpacity>
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
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 15 : 15,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
