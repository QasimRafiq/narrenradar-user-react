import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { COLORS } from "../../constants/theme";
import { Fonts } from "../../../assets/fonts/fonts";
import { IMAGES } from "../../../assets/images";
import { GlobalStyleSheet } from "../../constants/GlobalStyleSheet";
import RoundedButton from "../customButton/RoundedButton";
import { useNavigation } from "@react-navigation/native";
import ROUTE_NAMES from "../../../routes/routesName";
import de from "../../../shared/constants/de.json";

const CustomDrawerContent = () => {
  const navigation = useNavigation<any>();
  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}
    >
      <Text style={styles.title}>{de.app_name}</Text>

      <View
        style={{
          flex: 1,
          marginTop: "5%",
        }}
      >
        <RoundedButton
          title="Veranstaltungen"
          onPress={() => navigation.navigate(ROUTE_NAMES.EVENT_HOME_SCREEN)}
          titleSize={16}
        />
        <RoundedButton
          title={de.club_new_name}
          onPress={() => navigation.navigate(ROUTE_NAMES.CLUB_HOME)}
          titleSize={16}
        />
      </View>
    </ImageBackground>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    letterSpacing: 1.5,
    color: COLORS.green,
    textAlign: "center",
    marginHorizontal: 10,
    fontFamily: Fonts.heading,
    marginTop: "5%",
  },
});
