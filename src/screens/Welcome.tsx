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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const sponsorRef = database().ref('footersponsor');
    sponsorRef
      .once('value')
      .then(snapshot => {
        try {
          const data = snapshot.val();
          const sponsorsList: any[] = [];

          // Load sponsors in order: sponsor_0, sponsor_1, sponsor_2
          // Always maintain exactly 3 positions (including empty ones)
          for (let i = 0; i < 3; i++) {
            const sponsorKey = `sponsor_${i}`;
            const sponsor = data?.[sponsorKey] || null;
            sponsorsList.push(sponsor || {}); // Add empty sponsor if not found
          }

          setSponsors(sponsorsList);
          setIsLoading(false);
          setHasError(false);
        } catch (error) {
          console.error('Error loading footer sponsors:', error);
          // Initialize with 3 empty sponsors to maintain structure
          setSponsors([{}, {}, {}]);
          setIsLoading(false);
          setHasError(true);
        }
      })
      .catch(error => {
        console.error('Error loading footer sponsors:', error);
        // Initialize with 3 empty sponsors to maintain structure
        setSponsors([{}, {}, {}]);
        setIsLoading(false);
        setHasError(true);
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
          paddingBottom: 8,
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
            justifyContent: 'space-evenly',
            paddingHorizontal: 4,
          }}>
          {isLoading ? (
            // Loading state - show placeholder boxes
            [0, 1, 2].map(index => (
              <View
                key={index}
                style={[
                  styles.sponsorContainer,
                  {
                    backgroundColor: 'rgba(128, 128, 128, 0.3)',
                    borderRadius: 8,
                    height: 80,
                  },
                ]}
              />
            ))
          ) : (
            // Show all 3 sponsor positions (always exactly 3)
            sponsors.slice(0, 3).map((sponsor, index) => {
              if (sponsor?.imageUrl) {
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.sponsorContainer}
                    onPress={() => {
                      if (sponsor?.websiteUrl) {
                        const rawUrl = sponsor.websiteUrl.trim();
                        if (rawUrl) {
                          const normalizedUrl =
                            rawUrl.startsWith('http://') ||
                            rawUrl.startsWith('https://')
                              ? rawUrl
                              : `http://${rawUrl}`;
                          Linking.openURL(normalizedUrl).catch(err => {
                            console.error('Failed to open URL:', err);
                          });
                        }
                      }
                    }}
                    disabled={!sponsor?.websiteUrl}
                    activeOpacity={0.7}>
                    <Image
                      source={{uri: sponsor.imageUrl}}
                      resizeMode="contain"
                      style={styles.homeLogo}
                    />
                  </TouchableOpacity>
                );
              } else {
                // Empty sponsor slot - maintain position
                return (
                  <View key={index} style={styles.sponsorContainer} />
                );
              }
            })
          )}
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
    paddingHorizontal: 12,
    height: 80,
  },
  homeLogo: {
    height: 80,
    width: '100%',
    maxWidth: 120,
  },
});
