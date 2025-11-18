import {
  FlatList,
  Image,
  ImageBackground,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { IMAGES } from "../../assets/images";
import { GlobalStyleSheet } from "../../shared/constants/GlobalStyleSheet";
import CustomHeader from "../../shared/components/customHeader/CusstomHeader";
import CustomFooter from "../../shared/customFooter/CustomFooter";
import TextField from "../../shared/components/customText/TextField";
import { COLORS } from "../../shared/constants/theme";
import { Fonts } from "../../assets/fonts/fonts";
import LinearGradient from "react-native-linear-gradient";
import CustomGradientButton from "../../shared/components/customButton/CustomGradientButton";
import Fontisto from "react-native-vector-icons/Fontisto";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useNavigation, useRoute } from "@react-navigation/native";
import ROUTE_NAMES from "../../routes/routesName";
import {
  formatTimestamp,
  locationsData,
} from "../../shared/constants/dummyData";
import de from "../../shared/constants/de.json";
import Bullet from "../../shared/components/customText/Bullet";

const EventDetailScreen = () => {
  const navigation = useNavigation<any>();
  const routes = useRoute<any>();
  const { eventDetails } = routes?.params || {};

  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecastDay, setForecastDay] = useState<any>(null);
  const [checkPress, setCheckPress] = useState(false);

  const WEATHER_API_KEY = "d028bd113c2b4a1e86d105239252604"; // your key

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=1&aqi=no&alerts=no&lang=de`
      );
      const json = await res.json();

      // ✅ Current weather
      setCurrentWeather(json.current);

      // ✅ Forecast (day info)
      setForecastDay(json.forecast.forecastday[0].day);

      // ✅ Hourly forecast (limit to next 5 hours)
      const hourly = json.forecast.forecastday[0].hour.map((item: any) => ({
        id: item.time_epoch.toString(),
        temp: `${Math.round(item.temp_c)}°`,
        time: new Date(item.time).toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        icon: item.condition.icon,
      }));

      setWeatherData(hourly);
    } catch (error) {
      console.log("WeatherAPI fetch error:", error);
    }
  };

  useEffect(() => {
    if (
      eventDetails?.locations[0]?.latitude &&
      eventDetails?.locations[0]?.longitude
    ) {
      fetchWeather(
        eventDetails?.locations[0]?.latitude,
        eventDetails?.locations[0]?.longitude
      );
    } else {
      // fallback: Lahore
      fetchWeather(48.306403701846286, 8.783842921257019);
    }
  }, [eventDetails]);

  const formattedDate = currentWeather?.last_updated
    ? new Date(currentWeather?.last_updated).toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
      })
    : "";

  const shareEvent = async () => {
    if (!eventDetails || !eventDetails.id || !eventDetails.clubId) {
      return;
    }

    // Extract clubId if it's an object
    const clubId =
      typeof eventDetails.clubId === "object"
        ? eventDetails.clubId?.id || eventDetails.clubId?.value
        : eventDetails.clubId;

    const shareUrl = `https://go.narrenradar.de/vereine/club/events/detail?clubId=${clubId}&eventId=${eventDetails.id}`;

    const shareText = `Schau dir diese Veranstaltung an: ${
      eventDetails.name
    }\n\n${eventDetails.description || ""}\n\n${shareUrl}`;

    try {
      const result = await Share.share({
        message: shareText,
        title: eventDetails.name,
      });
    } catch (error) {
      console.log("Error sharing event:", error);
    }
  };

  const WeatherItem = ({
    temp,
    time,
    icon,
  }: {
    temp: string;
    time: string;
    icon: string;
  }) => (
    <LinearGradient
      colors={["#004200", "#8dc63f"]} // 🌈 Gradient: dark to light green
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        backgroundColor: COLORS.green,
        alignItems: "center",
        borderRadius: 20,
        marginRight: 10,
        width: 60,
      }}
    >
      <View
        style={{
          alignItems: "center",
          borderRadius: 20,
          padding: 10,
        }}
      >
        {icon && (
          <Image
            source={{ uri: `https:${icon}` }}
            style={{ width: 38, height: 38 }}
            resizeMode="cover"
          />
        )}
        <TextField
          textAlign="center"
          text={temp}
          color={COLORS.white}
          fontSize={14}
          fontFamily={Fonts.comfortaaRegular}
          marginTop={10}
          marginBottom={10}
        />
        <TextField
          textAlign="center"
          fontSize={12}
          text={time}
          color={COLORS.white}
          fontFamily={Fonts.comfortaaRegular}
          marginBottom={10}
        />
      </View>
    </LinearGradient>
  );

  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}
    >
      <CustomHeader />
      <ScrollView contentContainerStyle={styles.container}>
        {eventDetails?.sponsorLogo && (
          <CustomFooter
            sponsorImg={eventDetails?.sponsorLogo?.url}
            eventLink={eventDetails?.sponsorLink}
          />
        )}
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <View
            style={{
              flexDirection: "row",
              alignSelf: "flex-end",
              marginTop: 16,
            }}
          >
            <TouchableOpacity onPress={() => setCheckPress(!checkPress)}>
              <Image
                source={IMAGES.checkmarkcircle}
                style={{ width: 24, height: 24 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 10 }} onPress={shareEvent}>
              <AntDesign name="sharealt" size={24} color={COLORS.green} />
            </TouchableOpacity>
          </View>
          {checkPress && (
            <View
              style={{
                backgroundColor: COLORS.light_green,
                justifyContent: "center",
                paddingVertical: 10,
                paddingHorizontal: 16,
                marginTop: 16,
                borderRadius: 8,
              }}
            >
              <TextField
                fontSize={18}
                text={"Diese Veranstaltung wurde vom Gastgeber angelegt."}
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
            marginTop={16}
            marginBottom={16}
            uppercase={true}
            letterSpacing={1.5}
          />
          {eventDetails?.eventImage?.url && (
            <Image
              source={{ uri: eventDetails?.eventImage?.url }}
              style={{
                width: "90%",
                height: 280,
                marginBottom: 10,
                borderRadius: 24,
              }}
              resizeMode="cover"
            />
          )}

          <View style={{ marginBottom: 10 }}>
            <TextField
              lineHeight={22}
              fontSize={18}
              text={formatTimestamp(eventDetails?.eventDate)}
              color={COLORS.green}
              fontFamily={Fonts.comfortaaMedium}
              marginBottom={10}
              marginTop={10}
            />
            {eventDetails?.startTime && (
              <TextField
                textAlign="left"
                lineHeight={22}
                fontSize={18}
                text={`Startzeit: ${eventDetails?.startTime} Uhr`}
                color={COLORS.green}
                fontFamily={Fonts.comfortaaMedium}
                marginBottom={10}
              />
            )}
            {eventDetails?.entryTime && (
              <TextField
                lineHeight={22}
                fontSize={18}
                text={`Einlass: ${eventDetails?.entryTime} Uhr`}
                color={COLORS.green}
                fontFamily={Fonts.comfortaaMedium}
                marginBottom={10}
              />
            )}
            {eventDetails?.endTime && (
              <TextField
                lineHeight={22}
                fontSize={18}
                text={`Endzeit: ${eventDetails?.endTime} Uhr`}
                color={COLORS.green}
                fontFamily={Fonts.comfortaaMedium}
                marginBottom={10}
              />
            )}
            {eventDetails?.description && (
              <TextField
                textAlign="left"
                lineHeight={22}
                fontSize={18}
                text={eventDetails?.description}
                color={COLORS.green}
                fontFamily={Fonts.comfortaaMedium}
              />
            )}
          </View>

          {eventDetails?.lineUp && (
            <>
              <TextField
                text={de.line_up}
                color={COLORS.green}
                fontSize={22}
                fontFamily={Fonts.heading}
                marginTop={20}
                marginBottom={20}
                uppercase={true}
                letterSpacing={1.5}
              />
              <CustomGradientButton
                text={"AUFSTELLUNG ANSEHEN"}
                onPress={() =>
                  navigation.navigate(ROUTE_NAMES.PDF_VIEWER_SCREEN, {
                    pdfDocument: eventDetails?.lineUp?.url,
                  })
                }
              />
            </>
          )}

          {eventDetails?.groundPlan && (
            <>
              <TextField
                text={de.ground_plan}
                color={COLORS.green}
                fontSize={22}
                fontFamily={Fonts.heading}
                marginTop={20}
                marginBottom={20}
                letterSpacing={1.5}
                uppercase={true}
              />
              <CustomGradientButton
                text={"PLAN ANSEHEN"}
                onPress={() =>
                  navigation.navigate(ROUTE_NAMES.Ground_VIEWER_SCREEN, {
                    imgDocument: eventDetails?.groundPlan?.url,
                  })
                }
              />
            </>
          )}

          {eventDetails?.locations && (
            <>
              <TextField
                text={"LOCATIONS"}
                color={COLORS.green}
                fontSize={18}
                fontFamily={Fonts.heading}
                marginTop={20}
                marginBottom={14}
                letterSpacing={1.5}
              />

              <FlatList
                data={eventDetails.locations}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={{ marginBottom: 10, paddingHorizontal: 10 }}>
                    <View style={{ flexDirection: "row" }}>
                      <TextField
                        fontSize={16}
                        text={`${item?.name}`}
                        color={COLORS.green}
                        fontFamily={Fonts.comfortaaBold}
                        marginBottom={4}
                        fontWeight="700"
                      />
                    </View>

                    <View style={{ flexDirection: "row", paddingLeft: 24 }}>
                      <TextField
                        fontSize={15}
                        text={`${item.address}`}
                        color={COLORS.green}
                        fontFamily={Fonts.comfortaaRegular}
                        marginBottom={10}
                        width={"90%"}
                      />
                    </View>
                    {/* ICONS */}
                    <View
                      style={{
                        flexDirection: "row",
                        marginLeft: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: 10,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          if (item.link) {
                            Linking.openURL(item.link);
                          }
                        }}
                      >
                        <Image
                          source={IMAGES.location_icon}
                          style={{ width: 32, height: 32, marginRight: 20 }}
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
                                }
                              );
                            } else {
                            }
                          }}
                        >
                          <Image
                            source={IMAGES.flyer_icon}
                            style={{ width: 32, height: 32 }}
                            tintColor={COLORS.green}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              />
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
                <CustomGradientButton
                  key={index}
                  text={doc.name?.toUpperCase() || `DOKUMENT ${index + 1}`}
                  onPress={() => {
                    if (doc.type === "pdf") {
                      navigation.navigate(ROUTE_NAMES.PDF_VIEWER_SCREEN, {
                        pdfDocument: doc?.url,
                      });
                    } else {
                      navigation.navigate(ROUTE_NAMES.Ground_VIEWER_SCREEN, {
                        imgDocument: doc?.url,
                      });
                    }
                  }}
                />
              ))}
            </>
          )}

          {/* <LinearGradient
            colors={['#008243', '#8dc63f']} // 🌈 Gradient: light to dark green
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradientContainer}>
            <TouchableOpacity style={styles.button}>
              <TextField
                text={'DOKUMENT 1'}
                color={COLORS.white}
                fontSize={14}
                fontFamily={Fonts.heading}
                letterSpacing={1}
              />
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#008243', '#8dc63f']} // 🌈 Gradient: light to dark green
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[styles.gradientContainer, {marginTop: 10}]}>
            <TouchableOpacity style={styles.button}>
              <TextField
                text={'DOKUMENT 2'}
                color={COLORS.white}
                fontSize={14}
                fontFamily={Fonts.heading}
                letterSpacing={1}
              />
            </TouchableOpacity>
          </LinearGradient> */}

          <TextField
            text={"WETTER"}
            color={COLORS.green}
            fontSize={18}
            fontFamily={Fonts.heading}
            marginTop={10}
            marginBottom={10}
            letterSpacing={1.5}
          />

          <LinearGradient
            colors={["#004200", "#8dc63f"]} // 🌈 Gradient: dark to light green
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.weatherGradientContainer}
          >
            <View
              style={{
                flex: 1,
                alignItems: "center",
                padding: 14,
                paddingVertical: 44,
              }}
            >
              {currentWeather?.condition?.icon && (
                <Image
                  source={{ uri: `https:${currentWeather?.condition?.icon}` }}
                  style={{ width: 40, height: 40 }}
                />
              )}

              <TextField
                textAlign="center"
                text={`${Math.round(currentWeather?.temp_c)}°`}
                color={COLORS.white}
                fontSize={48}
                fontFamily={Fonts.heading}
              />
              <TextField
                fontSize={16}
                text={currentWeather?.condition?.text}
                color={COLORS.white}
                fontFamily={Fonts.comfortaaRegular}
                marginBottom={10}
              />

              {forecastDay && (
                <TextField
                  text={`Max: ${forecastDay.maxtemp_c}°  Min: ${forecastDay.mintemp_c}°`}
                  color={COLORS.white}
                  fontFamily={Fonts.comfortaaRegular}
                  marginBottom={10}
                  marginLeft={10}
                />
              )}

              {/* <TextField
                fontSize={16}
                text={`Preceptations`}
                color={COLORS.white}
                fontFamily={Fonts.comfortaaRegular}
                marginBottom={10}
                marginLeft={10}
              /> */}
              {/* <TextField
                text={`Max: 38° Min: 18°`}
                color={COLORS.white}
                fontFamily={Fonts.comfortaaRegular}
                marginBottom={10}
                marginLeft={10}
              /> */}
              <View
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  paddingHorizontal: 10,
                }}
              >
                <TextField
                  text={`Today`}
                  color={COLORS.white}
                  fontFamily={Fonts.comfortaaRegular}
                  marginBottom={10}
                />

                <TextField
                  text={formattedDate}
                  color={COLORS.white}
                  fontFamily={Fonts.comfortaaRegular}
                  marginBottom={10}
                  marginLeft={10}
                />
              </View>

              <FlatList
                style={{
                  // width: '100%',
                  alignSelf: "flex-start",
                  paddingHorizontal: 10,
                }}
                data={weatherData}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <WeatherItem
                    temp={item.temp}
                    time={item.time}
                    icon={item.icon}
                  />
                )}
              />
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default EventDetailScreen;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 50,
  },
  button: {
    padding: 10,
    width: "100%",
    alignItems: "center",
    alignSelf: "center",
  },
  gradientContainer: {
    borderRadius: 20, // Optional: add rounded corners
    alignItems: "center",
    justifyContent: "center",
    width: "60%",
    alignSelf: "center",
    marginBottom: 6,
  },
  weatherGradientContainer: {
    borderRadius: 20, // Optional: add rounded corners
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    alignSelf: "center",
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
