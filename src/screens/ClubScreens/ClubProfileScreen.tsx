import {
  Alert,
  Dimensions,
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
import React from "react";
import { IMAGES } from "../../assets/images";
import { GlobalStyleSheet } from "../../shared/constants/GlobalStyleSheet";
import CustomHeader from "../../shared/components/customHeader/CusstomHeader";
import { COLORS } from "../../shared/constants/theme";
import TextField from "../../shared/components/customText/TextField";
import { Fonts } from "../../assets/fonts/fonts";
import de from "../../shared/constants/de.json";
import {
  contactInfo,
  formatTimestamp,
  itemData,
} from "../../shared/constants/dummyData";
import CustomGradientButton from "../../shared/components/customButton/CustomGradientButton";
import { useNavigation, useRoute } from "@react-navigation/native";
import ROUTE_NAMES from "../../routes/routesName";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useRegions } from "../../shared/utills/firebaseUtils";

const { width } = Dimensions.get("window");

const ClubProfileScreen = () => {
  const navigation = useNavigation<any>();
  const routes = useRoute<any>();
  const { clubData, regionDetail } = routes?.params;
  const { regions } = useRegions();
  const handleWeb = async () => {
    await Linking.openURL(clubData?.websiteUrl);
  };
  const routeLink = async () => {
    await Linking.openURL(clubData?.locationUrl);
  };
  const clubLink = async (url) => {
    try {
      if (!url) {
        Alert.alert("Fehler", "Keine Website-URL angegeben");
        return;
      }

      // ensure proper format
      const validUrl = url.startsWith("http") ? url : `https://${url}`;

      const supported = await Linking.canOpenURL(validUrl);
      if (supported) {
        await Linking.openURL(validUrl);
      } else {
        Alert.alert("Fehler", "Dieser Link konnte nicht geöffnet werden");
      }
    } catch (err) {
      console.error("Error opening link:", err);
      Alert.alert("Fehler", "Beim Öffnen des Links ist ein Fehler aufgetreten");
    }
  };

  const shareClub = async () => {
    if (!clubData || !clubData.id) {
      return;
    }

    const shareUrl = `https://go.narrenradar.de/vereine/club/profile?clubId=${clubData.id}`;

    const shareText = `Schau dir dieses Profil an: ${clubData.clubName}\n\n${
      clubData.foundingHistory || ""
    }\n\n${shareUrl}`;

    try {
      const result = await Share.share({
        message: shareText,
        title: clubData.clubName,
      });
    } catch (error) {
      console.log("Error sharing club:", error);
    }
  };
  const InfoItemRow = ({ label, value }) => {
    const isArray = Array.isArray(value);
    // Check if array contains strings (for Verbände) or objects (for Narrenfiguren)
    const isStringArray =
      isArray && value.length > 0 && typeof value[0] === "string";

    return (
      <View style={{ marginBottom: isArray ? 10 : 6 }}>
        {isArray ? (
          <View>
            <TextField
              text={label}
              color={COLORS.green}
              fontFamily={Fonts.comfortaaBold}
              fontSize={18}
              marginBottom={6}
            />
            {isStringArray
              ? // Handle string arrays (Verbände) - matching Android: item.replace("-", "-\n")
                value.map((item, index) => (
                  <View key={index} style={{ marginBottom: 6 }}>
                    <TextField
                      text={item.replace(/-/g, "-\n")} // Match Android: replace "-" with "-\n"
                      color={COLORS.green}
                      fontFamily={Fonts.comfortaaMedium}
                      fontSize={18}
                    />
                  </View>
                ))
              : // Handle object arrays (Narrenfiguren)
                value.map((item, index) => (
                  <View key={index} style={{ marginBottom: 6 }}>
                    <TextField
                      text={
                        item.foundingYear
                          ? `${item.title} (seit ${item.foundingYear})`
                          : item.title
                      }
                      color={COLORS.green}
                      fontFamily={Fonts.comfortaaMedium}
                      fontSize={18}
                    />
                    {item.narrenruf ? (
                      <TextField
                        text={`"${item.narrenruf}"`}
                        color={COLORS.green}
                        fontFamily={Fonts.comfortaaRegular}
                        fontSize={18}
                      />
                    ) : null}
                  </View>
                ))}
          </View>
        ) : (
          <View>
            {value && (
              <>
                <TextField
                  text={label}
                  color={COLORS.green}
                  fontFamily={Fonts.comfortaaBold}
                  fontSize={18}
                />
                <TextField
                  text={value}
                  color={COLORS.green}
                  fontFamily={Fonts.comfortaaRegular}
                  fontSize={18}
                />
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  const ItemCard = ({ item }) => (
    <View style={styles.card}>
      {item.title && (
        <TextField
          text={item.title}
          fontSize={18}
          fontFamily={Fonts.comfortaaMedium}
          color={COLORS.green}
          marginBottom={8}
        />
      )}
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          resizeMode="cover"
          style={{
            height: 280,
            borderRadius: 16,
            width: "80%",
            marginBottom: 10,
          }}
        />
      )}
      {item.narrenruf && (
        <TextField
          text={item.narrenruf}
          fontSize={18}
          color={COLORS.green}
          fontFamily={Fonts.comfortaaMedium}
          marginTop={16}
          lineHeight={22}
        />
      )}
      {item.foundingYear && (
        <TextField
          text={"Erscheinungsjahr: " + item.foundingYear}
          fontSize={18}
          color={COLORS.green}
          fontFamily={Fonts.comfortaaMedium}
          marginTop={16}
          lineHeight={22}
        />
      )}
      {item.description && (
        <TextField
          text={item?.description}
          fontSize={18}
          color={COLORS.green}
          fontFamily={Fonts.comfortaaMedium}
          marginTop={16}
          lineHeight={22}
        />
      )}
    </View>
  );

  const profileData = [
    { label: "Vereinsname", value: clubData?.clubName },
    { label: "Gründungsjahr", value: clubData?.grundungsjahr },
    { label: "Eintragung ins Vereinsregister", value: clubData?.eintrag },
    { label: "Mitgliederzahl", value: clubData?.mitgliederzahl },
    {
      label: "Mitgliederzahl Stand (Datum)",
      value: formatTimestamp(clubData?.createdAt),
    },
    {
      label: "Narrenfiguren mit Narrenruf",
      value: clubData?.characters, // array
    },
    {
      label: "Verbände",
      value: (() => {
        // Handle regionTitles from clubData (matching Android: club.regionTitles)
        // First, try to get regionTitles from clubData (if it exists)
        let regionTitles: string[] = [];

        if (clubData?.regionTitles) {
          if (Array.isArray(clubData.regionTitles)) {
            regionTitles = clubData.regionTitles.filter(
              (title: any) => title && typeof title === "string"
            ) as string[];
          } else if (typeof clubData.regionTitles === "object") {
            regionTitles = Object.values(clubData.regionTitles).filter(
              (title: any) => title && typeof title === "string"
            ) as string[];
          }
        }

        // If regionTitles is empty, try to map regionIds to region names
        if (
          regionTitles.length === 0 &&
          clubData?.regionIds &&
          regions.length > 0
        ) {
          const regionIds = Array.isArray(clubData.regionIds)
            ? clubData.regionIds
            : clubData.regionIds
            ? Object.values(clubData.regionIds)
            : [];

          regionTitles = regionIds
            .map((regionId: any) => {
              const region = regions.find((r: any) => r.id === regionId);
              return region?.name;
            })
            .filter(
              (name: any) => name && typeof name === "string"
            ) as string[];
        }

        // If regionTitles is still empty and we have regionDetail (from ClubHome flow), use it as fallback
        if (regionTitles.length === 0 && regionDetail) {
          if (regionDetail.regionTitles) {
            if (Array.isArray(regionDetail.regionTitles)) {
              regionTitles = regionDetail.regionTitles.filter(
                (title: any) => title && typeof title === "string"
              ) as string[];
            } else if (typeof regionDetail.regionTitles === "object") {
              regionTitles = Object.values(regionDetail.regionTitles).filter(
                (title: any) => title && typeof title === "string"
              ) as string[];
            }
          } else if (regionDetail.name) {
            regionTitles = [regionDetail.name];
          }
        }

        // If still empty, show fallback message
        if (regionTitles.length === 0) {
          return "Keinem Verband angehörig";
        }

        // Return array for InfoItemRow to handle
        return regionTitles;
      })(),
    },
  ];

  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}
    >
      <CustomHeader />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }} // add bottom padding for spacing
        showsVerticalScrollIndicator={false}
      >
        <Image
          resizeMode="cover"
          source={{ uri: clubData?.clubCoverUrl }}
          style={styles.image}
        />
        <View style={styles.bottomContainer}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Image
              resizeMode="contain"
              source={{ uri: clubData?.clubImageUrl }}
              style={{ height: 120, width: 120 }}
            />
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={shareClub}>
              <AntDesign name="sharealt" size={24} color={COLORS.green} />
            </TouchableOpacity>
          </View>
          <TextField
            text={de.profile}
            color={COLORS.green}
            fontSize={22}
            fontFamily={Fonts.heading}
            marginTop={10}
            letterSpacing={1.5}
            uppercase={true}
          />
          {/* Profile Info List */}
          <View style={{ marginTop: 16 }}>
            {profileData.map((item, index) => (
              <InfoItemRow key={index} label={item.label} value={item.value} />
            ))}
          </View>
          <View
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: 10,
            }}
          >
            <TextField
              text="Website"
              color={COLORS.green}
              fontFamily={Fonts.comfortaaBold}
              fontSize={18}
            />
            <CustomGradientButton
              text={clubData.clubName}
              onPress={() => clubLink(clubData.websiteUrl)}
            />

            {/* <TextField
              textAlign="center"
              text={clubData?.websiteName}
              color={COLORS.green}
              fontFamily={Fonts.comfortaaBold}
              fontSize={14}
              textDecorationLine="underline"
            /> */}
          </View>

          <TextField
            text={"KONTAKT (Vereinsanschrift)"}
            color={COLORS.green}
            fontSize={22}
            fontFamily={Fonts.heading}
            marginTop={10}
            marginBottom={10}
            letterSpacing={1.5}
            uppercase={true}
          />
          {/* Contact Info Section */}
          <View>
            {[
              { label: "Straße", value: clubData?.masterAddress },
              { label: "Hausnummer", value: clubData?.houseNo },
              { label: "Postleitzahl", value: clubData?.postcode },
              { label: "Ort", value: clubData?.ort },
              { label: "E-Mail", value: clubData?.masterEmail },
              { label: "Telefonnummer", value: clubData?.masterPhone },
            ].map((item, index) =>
              item.value ? (
                <View key={index} style={{ marginBottom: 12 }}>
                  <TextField
                    text={item.label}
                    color={COLORS.green}
                    fontFamily={Fonts.comfortaaBold}
                    fontSize={18}
                  />
                  <TextField
                    text={item.value}
                    color={COLORS.green}
                    fontFamily={Fonts.comfortaaMedium}
                    fontSize={18}
                  />
                </View>
              ) : null
            )}
          </View>
          {/* <Image
            resizeMode="contain"
            source={{uri: clubData?.locationImageUrl}}
            style={{
              height: 250,
              alignSelf: 'center',
              borderRadius: 16,
              width: 250,
            }}
          /> */}

          <CustomGradientButton text={de.route} onPress={routeLink} />

          {clubData?.foundingHistory && (
            <>
              <TextField
                uppercase={true}
                text={"GRÜNDUNGSGESCHICHTE"}
                color={COLORS.green}
                fontSize={22}
                fontFamily={Fonts.heading}
                marginTop={10}
                marginBottom={10}
                letterSpacing={1.5}
              />
              <TextField
                text={clubData?.foundingHistory}
                color={COLORS.green}
                fontSize={18}
                fontFamily={Fonts.comfortaaMedium}
              />
            </>
          )}

          {/* <Image
            resizeMode="contain"
            source={{uri: clubData?.masterImageUrl}}
            style={{
              height: 250,
              alignSelf: 'center',
              borderRadius: 16,
              width: 250,
            }}
          /> */}

          <TextField
            uppercase={true}
            text={de.narrenfiguren}
            color={COLORS.green}
            fontSize={21}
            fontFamily={Fonts.heading}
            marginTop={10}
            // marginBottom={10}
            letterSpacing={1.5}
          />

          <FlatList
            data={clubData?.characters}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <ItemCard item={item} />}
          />

          {/* FUNKTIONÄRE SECTION */}
          {/* FUNKTIONÄRE SECTION */}
          {(clubData?.vorstandMembers?.length > 0 ||
            clubData?.funktionaereMembers?.length > 0) && (
            <>
              <TextField
                uppercase={true}
                text={"FUNKTIONÄRE"}
                color={COLORS.green}
                fontSize={22}
                fontFamily={Fonts.heading}
                marginTop={10}
                marginBottom={10}
                letterSpacing={1.5}
              />

              {/* Vorstand Members */}
              {clubData?.vorstandMembers?.length > 0 && (
                <>
                  {clubData.vorstandMembers.map((member, index) => (
                    <View
                      key={`vorstand-${index}`}
                      style={{ marginBottom: 20 }}
                    >
                      {/* 🔢 Index number */}
                      <TextField
                        text={`${index + 1}. Vorstand`}
                        color={COLORS.green}
                        fontFamily={Fonts.comfortaaMedium}
                        fontSize={18}
                      />

                      {member.imageUrl ? (
                        <Image
                          source={{ uri: member.imageUrl }}
                          style={{
                            height: 250,
                            width: width * 0.8,
                            borderRadius: 16,
                            backgroundColor: "#fff",
                          }}
                          resizeMode="cover"
                          onError={(e) =>
                            console.log(
                              "Vorstand image load error:",
                              e.nativeEvent.error
                            )
                          }
                        />
                      ) : null}

                      {member.name ? (
                        <TextField
                          text={member.name}
                          color={COLORS.green}
                          fontFamily={Fonts.comfortaaMedium}
                          fontSize={18}
                        />
                      ) : null}
                      {/* {member.email ? (
                        <TextField
                          text={member.email}
                          color={COLORS.green}
                          fontFamily={Fonts.comfortaaMedium}
                          fontSize={18}
                        />
                      ) : null} */}
                    </View>
                  ))}
                </>
              )}

              {/* Funktionaere Members */}
              {clubData?.funktionaereMembers?.length > 0 && (
                <>
                  {clubData.funktionaereMembers.map((member, index) => (
                    <View
                      key={`funktionaere-${index}`}
                      style={{ marginBottom: 20 }}
                    >
                      {member.imageUrl ? (
                        <Image
                          source={{ uri: member.imageUrl }}
                          style={{
                            height: 250,
                            width: width * 0.8,
                            borderRadius: 16,
                            backgroundColor: "#fff",
                          }}
                          resizeMode="cover"
                          onError={(e) =>
                            console.log(
                              "Funktionaere image load error:",
                              e.nativeEvent.error
                            )
                          }
                        />
                      ) : null}
                      {member.functionInClub ? (
                        <TextField
                          text={member.functionInClub}
                          color={COLORS.green}
                          fontFamily={Fonts.comfortaaMedium}
                          fontSize={18}
                        />
                      ) : null}

                      {member.name ? (
                        <TextField
                          text={member.name}
                          color={COLORS.green}
                          fontFamily={Fonts.comfortaaMedium}
                          fontSize={18}
                        />
                      ) : null}

                      {/* {member.email ? (
                        <TextField
                          text={member.email}
                          color={COLORS.green}
                          fontFamily={Fonts.comfortaaMedium}
                          fontSize={18}
                        />
                      ) : null} */}
                    </View>
                  ))}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default ClubProfileScreen;

const styles = StyleSheet.create({
  image: {
    height: 200,
    width: "100%",
  },
  bottomContainer: {
    marginTop: 20,
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    paddingTop: 16,
    flex: 1,
  },
});
