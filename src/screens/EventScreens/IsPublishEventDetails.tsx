import {
  FlatList,
  Image,
  ImageBackground,
  Linking,
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
import CustomFooter from '../../shared/customFooter/CustomFooter';
import TextField from '../../shared/components/customText/TextField';
import {COLORS} from '../../shared/constants/theme';
import {Fonts} from '../../assets/fonts/fonts';
import LinearGradient from 'react-native-linear-gradient';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useNavigation, useRoute} from '@react-navigation/native';
import ROUTE_NAMES from '../../routes/routesName';
import {formatTimestamp, locationsData} from '../../shared/constants/dummyData';
import de from '../../shared/constants/de.json';
import Bullet from '../../shared/components/customText/Bullet';

const IsPublishEventDetails = () => {
  const navigation = useNavigation<any>();
  const routes = useRoute<any>();
  const {eventDetails} = routes?.params || {};

  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecastDay, setForecastDay] = useState<any>(null);
  const [checkPress, setCheckPress] = useState(false);

  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}>
      <CustomHeader />
      <ScrollView contentContainerStyle={styles.container}>
        {eventDetails?.sponsorLogo && (
          <CustomFooter sponsorImg={eventDetails?.sponsorLogo?.url} />
        )}
        <View style={{flex: 1, paddingHorizontal: 20}}>
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-end',
              marginTop: 16,
            }}>
            <TouchableOpacity onPress={() => setCheckPress(!checkPress)}>
              <Image
                source={IMAGES.exclamation}
                style={{width: 24, height: 24}}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <TouchableOpacity style={{marginLeft: 10}}>
              <AntDesign name="sharealt" size={24} color={COLORS.green} />
            </TouchableOpacity>
          </View>
          {checkPress && (
            <View
              style={{
                backgroundColor: COLORS.light_green,
                justifyContent: 'center',
                padding: 16,
                marginTop: 16,
                borderRadius: 8,
              }}>
              <TextField
                fontSize={18}
                text={
                  'Diese Dummy-Veranstaltung wurde vom Gastverein erstellt.'
                }
                color={COLORS.black}
                fontFamily={Fonts.comfortaaMedium}
              />
            </View>
          )}

          <TextField
            text={eventDetails?.name}
            color={COLORS.green}
            fontSize={18}
            fontFamily={Fonts.heading}
            marginTop={10}
            marginBottom={10}
            uppercase={true}
            letterSpacing={1.5}
          />
          {eventDetails?.eventImage?.url && (
            <Image
              source={{uri: eventDetails?.eventImage?.url}}
              style={{
                width: '90%',
                height: 280,
                alignSelf: 'center',
                marginBottom: 10,
                borderRadius: 24,
              }}
              resizeMode="cover"
            />
          )}

          {/* Event date and description box - left-aligned */}
          <View
            style={{
              marginBottom: 10,
              borderColor: COLORS.green,
              borderRadius: 8,
              marginTop: 10,
            }}>
            <TextField
              lineHeight={22}
              fontSize={18}
              text={formatTimestamp(eventDetails?.eventDate)}
              color={COLORS.green}
              fontFamily={Fonts.comfortaaRegular}
              marginBottom={10}
            />
            <TextField
              lineHeight={22}
              fontSize={18}
              text={eventDetails?.description}
              color={COLORS.green}
              fontFamily={Fonts.comfortaaRegular}
            />
            {eventDetails?.ort && (
              <TextField
                lineHeight={22}
                fontSize={18}
                text={`Ort: ${eventDetails?.ort}`}
                color={COLORS.green}
                fontFamily={Fonts.comfortaaRegular}
                marginTop={10}
              />
            )}
            {eventDetails?.plz && (
              <TextField
                lineHeight={22}
                fontSize={18}
                text={`PLZ: ${eventDetails?.plz}`}
                color={COLORS.green}
                fontFamily={Fonts.comfortaaRegular}
                marginTop={10}
              />
            )}
          </View>

          {/* Location and postal code - show after event card box */}
          {eventDetails?.locations && eventDetails.locations.length > 0 && (
            <View style={{marginBottom: 10, paddingHorizontal: 20}}>
              <TextField
                textAlign="left"
                fontSize={16}
                text={eventDetails.locations[0]?.name || ''}
                color={COLORS.green}
                fontFamily={Fonts.comfortaaBold}
                marginBottom={4}
                fontWeight="700"
              />
              {eventDetails.locations[0]?.address && (
                <>
                  <TextField
                    textAlign="left"
                    fontSize={15}
                    text={eventDetails.locations[0].address}
                    color={COLORS.green}
                    fontFamily={Fonts.comfortaaRegular}
                    marginBottom={4}
                  />
                  {/* Extract and display postal code if available */}
                  {(() => {
                    const addressMatch =
                      eventDetails.locations[0].address.match(/\b\d{5}\b/);
                    const postalCode = addressMatch ? addressMatch[0] : '';
                    const cityMatch =
                      eventDetails.locations[0].address.match(
                        /\d{5}\s+([^,]+)/,
                      );
                    const city = cityMatch ? cityMatch[1].trim() : '';
                    return postalCode && city ? (
                      <TextField
                        textAlign="left"
                        fontSize={15}
                        text={`${city}, ${postalCode}`}
                        color={COLORS.green}
                        fontFamily={Fonts.comfortaaRegular}
                        marginBottom={4}
                      />
                    ) : null;
                  })()}
                </>
              )}
            </View>
          )}
          {eventDetails?.entryTime && (
            <TextField
              textAlign="center"
              lineHeight={22}
              fontSize={18}
              text={eventDetails?.entryTime}
              color={COLORS.green}
              fontFamily={Fonts.comfortaaRegular}
              marginBottom={10}
            />
          )}
          {eventDetails?.lineUp && (
            <>
              <TextField
                textAlign="center"
                text={de.line_up}
                color={COLORS.green}
                fontSize={22}
                fontFamily={Fonts.heading}
                marginTop={10}
                marginBottom={10}
                uppercase={true}
                letterSpacing={1.5}
              />
              <LinearGradient
                colors={['#008243', '#8dc63f']} // 🌈 Gradient: light to dark green
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.gradientContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    navigation.navigate(ROUTE_NAMES.PDF_VIEWER_SCREEN, {
                      pdfDocument: eventDetails?.lineUp?.url,
                    })
                  }>
                  <TextField
                    text={'AUFSTELLUNG ANSEHEN'}
                    color={COLORS.white}
                    fontSize={14}
                    fontFamily={Fonts.heading}
                    letterSpacing={1}
                  />
                </TouchableOpacity>
              </LinearGradient>
            </>
          )}

          {eventDetails?.groundPlan && (
            <>
              <TextField
                textAlign="center"
                text={de.ground_plan}
                color={COLORS.green}
                fontSize={22}
                fontFamily={Fonts.heading}
                marginTop={10}
                marginBottom={10}
                letterSpacing={1.5}
                uppercase={true}
              />
              <LinearGradient
                colors={['#008243', '#8dc63f']} // 🌈 Gradient: light to dark green
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.gradientContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    navigation.navigate(ROUTE_NAMES.Ground_VIEWER_SCREEN, {
                      imgDocument: eventDetails?.groundPlan?.url,
                    })
                  }>
                  <TextField
                    text={'PLAN ANSEHEN'}
                    color={COLORS.white}
                    fontSize={14}
                    fontFamily={Fonts.heading}
                    letterSpacing={1}
                  />
                </TouchableOpacity>
              </LinearGradient>
            </>
          )}

          {eventDetails?.locations && (
            <>
              <TextField
                textAlign="center"
                text={'LOCATIONS'}
                color={COLORS.green}
                fontSize={22}
                fontFamily={Fonts.heading}
                marginTop={10}
                marginBottom={14}
                letterSpacing={1.5}
              />

              <FlatList
                data={eventDetails.locations}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <View style={{marginBottom: 10}}>
                    <View style={{flexDirection: 'row'}}>
                      <TextField
                        fontSize={16}
                        text={`${item?.name}`}
                        color={COLORS.green}
                        fontFamily={Fonts.comfortaaBold}
                        marginBottom={4}
                        fontWeight="700"
                      />
                    </View>

                    <View style={{flexDirection: 'row', paddingLeft: 24}}>
                      <TextField
                        fontSize={15}
                        text={`${item.address}`}
                        color={COLORS.green}
                        fontFamily={Fonts.comfortaaRegular}
                        marginBottom={10}
                        width={'90%'}
                      />
                    </View>
                    {/* ICONS */}
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 10,
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          if (item.link) {
                            Linking.openURL(item.link);
                          }
                        }}>
                        <Image
                          source={IMAGES.location_icon}
                          style={{width: 32, height: 32, marginRight: 20}}
                          tintColor={COLORS.green}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>

                      {item?.flyer?.url && (
                        <TouchableOpacity
                          onPress={() => {
                            if (item?.flyer?.url) {
                              navigation.navigate(
                                ROUTE_NAMES.Ground_VIEWER_SCREEN,
                                {
                                  imgDocument: item?.flyer?.url,
                                },
                              );
                            } else {
                            }
                          }}>
                          <Image
                            source={IMAGES.flyer_icon}
                            style={{width: 32, height: 32}}
                            tintColor={COLORS.green}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              />
              {eventDetails?.startTime && (
                <View style={{marginTop: 10, paddingHorizontal: 10}}>
                  <TextField
                    textAlign="left"
                    lineHeight={22}
                    fontSize={18}
                    text={`Startzeit: ${eventDetails?.startTime}`}
                    color={COLORS.green}
                    fontFamily={Fonts.comfortaaRegular}
                    marginBottom={10}
                  />
                </View>
              )}
            </>
          )}

          {eventDetails?.documents && (
            <>
              <TextField
                textAlign="center"
                text={de.other_documents}
                color={COLORS.green}
                fontSize={22}
                fontFamily={Fonts.heading}
                marginTop={10}
                marginBottom={10}
                uppercase={true}
                letterSpacing={1.5}
              />
              {eventDetails.documents?.map((doc: any, index: number) => (
                <LinearGradient
                  key={index}
                  colors={['#008243', '#8dc63f']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.gradientContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      if (doc.type === 'pdf') {
                        navigation.navigate(ROUTE_NAMES.PDF_VIEWER_SCREEN, {
                          pdfDocument: doc?.url,
                        });
                      } else {
                        navigation.navigate(ROUTE_NAMES.Ground_VIEWER_SCREEN, {
                          imgDocument: doc?.url,
                        });
                      }
                    }}>
                    <TextField
                      text={doc.name?.toUpperCase() || `DOKUMENT ${index + 1}`}
                      color={COLORS.white}
                      fontSize={14}
                      fontFamily={Fonts.heading}
                      letterSpacing={1}
                    />
                  </TouchableOpacity>
                </LinearGradient>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default IsPublishEventDetails;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 50,
  },
  button: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  gradientContainer: {
    borderRadius: 20, // Optional: add rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
    alignSelf: 'center',
    marginBottom: 6,
  },
  weatherGradientContainer: {
    borderRadius: 20, // Optional: add rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  bullet: {
    fontSize: 14,
    color: COLORS.green,
    marginRight: 4,
  },
  subBullet: {
    fontSize: 10,
    color: COLORS.green,
    marginRight: 0,
    top: 2,
  },
});
