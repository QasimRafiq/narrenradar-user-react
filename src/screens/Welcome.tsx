import {
  Image,
  ImageBackground,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CustomHeader from '../shared/components/customHeader/CusstomHeader';
import {GlobalStyleSheet} from '../shared/constants/GlobalStyleSheet';
import RoundedButton from '../shared/components/customButton/RoundedButton';
import {IMAGES} from '../assets/images';
import {COLORS} from '../shared/constants/theme';
import TextField from '../shared/components/customText/TextField';
import {Fonts} from '../assets/fonts/fonts';
import ROUTE_NAMES from '../routes/routesName';
import {useNavigation} from '@react-navigation/native';
import de from '../shared/constants/de.json';
import database from '@react-native-firebase/database';

const Welcome = () => {
  const navigation = useNavigation<any>();
  const [sponsors, setSponsors] = useState<any[]>([]);

  useEffect(() => {
    const sponsorRef = database().ref('footersponsor');
    sponsorRef.once('value').then(snapshot => {
      const data = snapshot.val();
      if (data) {
        // Ensure order: sponsor_0 → sponsor_1 → sponsor_2
        const orderedSponsors = Object.keys(data)
          .sort((a, b) => {
            const numA = parseInt(a.split('_')[1]);
            const numB = parseInt(b.split('_')[1]);
            return numA - numB;
          })
          .map(key => data[key])
          .filter(s => s?.imageUrl && s?.websiteUrl);

        setSponsors(orderedSponsors);
      }
    });
  }, []);

  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}>
      <CustomHeader />

      <View style={{flex: 1, justifyContent: 'center'}}>
        <RoundedButton
          title={de.event}
          onPress={() => navigation.navigate(ROUTE_NAMES.EVENT_HOME_SCREEN)}
        />
        <RoundedButton
          title={de.club_new_name}
          onPress={() => navigation.navigate(ROUTE_NAMES.CLUB_HOME)}
        />

        {/* Text with link */}
        <Text
          style={{
            lineHeight: 24,
            fontSize: 16,
            color: COLORS.green,
            fontFamily: Fonts.comfortaaMedium,
            marginTop: 20,
            marginLeft: 20,
            marginRight: 20,
          }}>
          Du möchtest Deinen Verein registrieren?{'\n'}Na dann los:{' '}
          <Text
            style={{
              lineHeight: 24,
              fontSize: 16,
              color: COLORS.green,
              fontFamily: Fonts.comfortaaMedium,
              textDecorationLine: 'underline',
            }}
            onPress={() =>
              Linking.openURL('https://narrenradar.de/registrierung/')
            }>
            www.narrenradar.de
          </Text>
        </Text>
      </View>

      {/* Footer Sponsors */}
      <View
        style={{
          backgroundColor: COLORS.light_green,

          paddingTop: 10,
        }}>
        <TextField
          textAlign="center"
          text={de.our_partners}
          color={COLORS.green}
          fontSize={16}
          fontFamily={Fonts.heading}
          marginTop={8}
          marginBottom={10}
          uppercase={true}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 4,
          }}>
          {[0, 1, 2].map(index => {
            const sponsor = sponsors[index];
            return (
              <TouchableOpacity
                key={index}
                style={styles.sponsorContainer}
                onPress={() => {
                  if (sponsor?.websiteUrl) {
                    Linking.openURL(
                      sponsor.websiteUrl.startsWith('http')
                        ? sponsor.websiteUrl
                        : `https://${sponsor.websiteUrl}`,
                    );
                  }
                }}
                disabled={!sponsor}>
                {sponsor?.imageUrl && (
                  <Image
                    source={{uri: sponsor.imageUrl}}
                    resizeMode="contain"
                    style={styles.homeLogo}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ImageBackground>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  sponsorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeLogo: {
    height: 80,
    width: '100%',
    maxWidth: 120,
  },
});
