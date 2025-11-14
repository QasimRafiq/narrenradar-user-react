import React, {useEffect, useState} from 'react';
import {Alert, BackHandler, Platform, SafeAreaView, LogBox} from 'react-native';
import RNExitApp from 'react-native-exit-app';
import {NavigationContainer} from '@react-navigation/native';
import 'react-native-gesture-handler';
import RootNavigator from './src/routes/Stacks/RootNavigator';
import {COLORS} from './src/shared/constants/theme';
import ScreenWrapper from './src/shared/screenWrapper/ScreenWrapper';
import TermsAndConditionsModal from './src/shared/components/TermsAndConditionsModal';
import {
  isTermsAccepted,
  setTermsAccepted,
  checkAndRequestLocationPermission,
} from './src/shared/utils/permissionService';

LogBox.ignoreAllLogs();

const App = () => {
  const [termsAccepted, setTermsAcceptedState] = useState<boolean | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    checkTermsAndPermissions();
  }, []);

  const checkTermsAndPermissions = async () => {
    try {
      // First, check terms acceptance - this is the main thing we care about
      const accepted = await isTermsAccepted();
      console.log('Terms accepted status:', accepted);
      setTermsAcceptedState(accepted);

      // Only show modal if terms have NOT been accepted
      if (!accepted) {
        console.log('Terms not accepted, showing modal');
        // Show terms modal after a short delay to allow app to render
        setTimeout(() => {
          setShowTermsModal(true);
        }, 1000);
      } else {
        console.log('Terms already accepted, not showing modal');
        setShowTermsModal(false);
      }

      // Request location permission on app start (regardless of terms status)
      // This happens silently in the background and errors should not affect terms modal
      // Wrap in try-catch so location permission errors don't affect terms logic
      try {
        await checkAndRequestLocationPermission(false); // Don't show alert on startup
      } catch (locationError) {
        console.error(
          'Error with location permission (non-blocking):',
          locationError,
        );
        // Don't throw - location permission errors should not affect terms modal
      }
    } catch (error) {
      console.error('Error checking terms:', error);
      // Only set terms state if there was an actual error checking terms
      // Don't show modal if we can't determine status - assume not accepted to be safe
      const accepted = await isTermsAccepted().catch(() => false);
      setTermsAcceptedState(accepted);
      if (!accepted) {
        setShowTermsModal(true);
      }
    }
  };

  const handleAcceptTerms = async () => {
    try {
      console.log('✅ User accepted terms, saving to AsyncStorage...');

      // Save acceptance first
      await setTermsAccepted(true);

      // Verify it was saved
      const verifyAccepted = await isTermsAccepted();
      console.log('🔍 Verification after save:', verifyAccepted);

      if (verifyAccepted) {
        setTermsAcceptedState(true);
        setShowTermsModal(false);
        console.log(
          '✅ Terms accepted and saved successfully - modal will not show again',
        );
      } else {
        console.error('⚠️ Warning: Terms acceptance was not saved correctly!');
        // Still close modal to prevent blocking, but log the error
        setShowTermsModal(false);
      }

      // Location permission was already requested on app start, but request again to ensure it's granted
      // Wrap in try-catch so location permission errors don't affect terms acceptance
      try {
        await checkAndRequestLocationPermission(false);
      } catch (locationError) {
        console.error(
          'Error with location permission (non-blocking):',
          locationError,
        );
        // Don't throw - location permission errors should not affect terms acceptance
      }
    } catch (error) {
      console.error('❌ Error accepting terms:', error);
      // Even if there's an error, close the modal to prevent blocking the app
      setShowTermsModal(false);
    }
  };

  const exitApp = () => {
    if (RNExitApp && typeof RNExitApp.exitApp === 'function') {
      RNExitApp.exitApp();
      return;
    }

    if (Platform.OS === 'android') {
      BackHandler.exitApp();
      return;
    }

    Alert.alert(
      'Terms Required',
      'To use the app, you must accept the terms and conditions. Please close the app manually.',
      [
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => BackHandler.exitApp(),
        },
      ],
      {cancelable: false},
    );
  };

  const handleDeclineTerms = async () => {
    console.log('🚪 User declined terms - exiting app');
    setShowTermsModal(false);
    exitApp();
  };

  // Don't render app until terms status is checked
  if (termsAccepted === null) {
    return null; // or a loading screen
  }

  return (
    <ScreenWrapper>
      <NavigationContainer>
        <SafeAreaView style={{backgroundColor: COLORS.white, flex: 1}}>
          <RootNavigator />
          <TermsAndConditionsModal
            visible={showTermsModal}
            onAccept={handleAcceptTerms}
            onDecline={handleDeclineTerms}
          />
        </SafeAreaView>
      </NavigationContainer>
    </ScreenWrapper>
  );
};

export default App;
