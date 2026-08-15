import React from 'react';
import {
  ImageBackground,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {IMAGES} from '../../assets/images';
import {GlobalStyleSheet} from '../../shared/constants/GlobalStyleSheet';
import CustomHeader from '../../shared/components/customHeader/CusstomHeader';
import RoundedButton from '../../shared/components/customButton/RoundedButton';
import TextField from '../../shared/components/customText/TextField';
import {Fonts} from '../../assets/fonts/fonts';
import {COLORS} from '../../shared/constants/theme';
import {useRoute} from '@react-navigation/native';
import {useClubUsers} from '../../shared/utills/firebaseUtils';
import CustomLoader from '../../shared/components/CustomLoader';
import ClubUserList from '../../shared/components/customRenderItems/ClubUserList';

const screenWidth = Dimensions.get('window').width;

const ClubDetailScreen = () => {
  const routes = useRoute<any>();
  const {regionData} = routes?.params;
  const {clubUsers, loading} = useClubUsers(regionData?.id);

  // --- Function to open sponsor website ---
  const openSponsorLink = async (url: string) => {
    if (!url) return Alert.alert('Fehler', 'Keine Website-URL angegeben');
    const validUrl = url.startsWith('http') ? url : `https://${url}`;
    try {
      const supported = await Linking.canOpenURL(validUrl);
      if (supported) {
        await Linking.openURL(validUrl);
      } else {
        Alert.alert('Fehler', 'Link konnte nicht geöffnet werden');
      }
    } catch (error) {
      Alert.alert('Fehler', 'Beim Öffnen des Links ist ein Fehler aufgetreten');
      console.log('Error opening URL:', error);
    }
  };

  // --- Render each sponsor in grid ---
  const renderSponsor = ({item}: {item: any}) => (
    <TouchableOpacity
      style={{
        width: (screenWidth - 80) / 3, // 3 per row
        alignItems: 'center',
        marginBottom: 16,
      }}
      activeOpacity={0.8}
      onPress={() => openSponsorLink(item.websiteUrl)}>
      <FastImage
        source={{
          uri: item.imageUrl,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        }}
        style={{
          width: 100,
          height: 70,
          borderRadius: 12,
        }}
        resizeMode={FastImage.resizeMode.contain}
      />
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}>
      <CustomHeader />
      <RoundedButton title="NARRENRADAR" onPress={() => {}} opacity={1} />

      <View style={GlobalStyleSheet.componentContainer}>
        {/* Region Title */}
        <TextField
          width={'80%'}
          textAlign="center"
          alignSelf={'center'}
          fontSize={16}
          text={regionData?.name}
          color={COLORS.green}
          fontFamily={Fonts.heading}
          marginBottom={10}
          marginTop={-10}
          uppercase={true}
        />

        {/* Sponsors Section */}
        {regionData?.sponsors?.length > 0 && (
          <View>
            <TextField
              fontSize={14}
              text={
                'Dank der folgenden Sponsoren ist das erste Jahr im Narrenradar für diese Vereine kostenfrei!'
              }
              color={COLORS.green}
              fontFamily={Fonts.comfortaaMedium}
              marginBottom={10}
              lineHeight={18}
            />

            <FlatList
              data={regionData.sponsors}
              renderItem={renderSponsor}
              keyExtractor={(item, index) => index.toString()}
              numColumns={3}
              columnWrapperStyle={{justifyContent: 'space-between'}}
              contentContainerStyle={{
                paddingVertical: 10,
              }}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Clubs Section */}
        {loading ? (
          <CustomLoader message="DATEN ABRUFEN..." />
        ) : clubUsers.length > 0 ? (
          <ClubUserList data={clubUsers} regionDetail={regionData} />
        ) : (
          <Text
            style={{
              textAlign: 'center',
              marginTop: 20,
              color: COLORS.green,
              fontFamily: Fonts.regular,
            }}>
            Keine Vereine in diesem Verband gefunden.
          </Text>
        )}
      </View>
    </ImageBackground>
  );
};

export default ClubDetailScreen;
