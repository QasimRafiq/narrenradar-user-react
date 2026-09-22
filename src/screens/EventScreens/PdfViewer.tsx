import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Platform,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import Pdf from 'react-native-pdf';
import FastImage from 'react-native-fast-image';
import {IMAGES} from '../../assets/images';
import {GlobalStyleSheet} from '../../shared/constants/GlobalStyleSheet';
import CustomHeader from '../../shared/components/customHeader/CusstomHeader';
import CustomLoader from '../../shared/components/CustomLoader';
import {COLORS} from '../../shared/constants/theme';
import {useRoute, useNavigation} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {cacheDocumentUrl, getCachedDocumentPath} from '../../shared/utils/offlineStorage';

const PdfViewer = () => {
  const routes = useRoute<any>();
  const navigation = useNavigation<any>();
  const {pdfDocument} = routes?.params;
  const [source, setSource] = useState<{uri: string} | null>(null);
  // Some legacy documents are tagged as PDFs in the backend but are
  // actually images (bad upload metadata), so the PDF renderer fails to
  // parse them. Fall back to rendering as an image once before giving up.
  const [renderAsImage, setRenderAsImage] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Prefer a persistent local copy over the remote URL — react-native-pdf's
  // own `cache` option is hardcoded to a device Cache directory the OS can
  // wipe under storage pressure, which would silently break offline viewing
  // for a document already viewed once. Handing it a local file:// URI
  // directly bypasses its network/cache logic entirely.
  useEffect(() => {
    let cancelled = false;

    const resolveSource = async () => {
      if (!pdfDocument) return;

      const cachedPath = await getCachedDocumentPath(pdfDocument);
      if (cancelled) return;

      if (cachedPath) {
        setSource({uri: `file://${cachedPath}`});
      } else {
        setSource({uri: pdfDocument});
        // Save a copy for next time (best-effort, runs in the background).
        cacheDocumentUrl(pdfDocument);
      }
    };

    resolveSource();
    return () => {
      cancelled = true;
    };
  }, [pdfDocument]);

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
      {source ? (
        loadError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Dokument konnte nicht geladen werden
            </Text>
          </View>
        ) : renderAsImage ? (
          <FastImage
            source={{uri: source.uri}}
            style={styles.pdf}
            resizeMode={FastImage.resizeMode.contain}
            onError={() => setLoadError(true)}
          />
        ) : (
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
              setRenderAsImage(true);
            }}
            style={styles.pdf}
            enablePaging={false}
            spacing={0}
            fitPolicy={0}
          />
        )
      ) : (
        <CustomLoader message="Dokument wird geladen..." />
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'center',
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
