import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { COLORS } from "../../constants/theme";

const Bullet = () => {
  return (
    <View>
      <Text style={styles.bullet}>{"\u2022"}</Text>
    </View>
  );
};

export default Bullet;

const styles = StyleSheet.create({
  bullet: {
    fontSize: 22,
    color: COLORS.green,
    marginRight: 8,
    marginTop: -2,
  },
});
