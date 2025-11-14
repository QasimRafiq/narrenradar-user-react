import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import {Alert, Linking, Platform} from 'react-native';

const TERMS_ACCEPTED_KEY = '@narrenradar:terms_accepted';
const LOCATION_PERMISSION_KEY = '@narrenradar:location_permission_requested';

/**
 * Check if terms and conditions have been accepted
 * Returns true only if the stored value is exactly 'true'
 */
export const isTermsAccepted = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(TERMS_ACCEPTED_KEY);
    console.log('🔍 Checking terms acceptance - AsyncStorage value:', value);

    // Only return true if value is exactly 'true'
    // null, undefined, 'false', or any other value will return false
    const isAccepted = value === 'true';
    console.log('🔍 Terms accepted result:', isAccepted);

    return isAccepted;
  } catch (error) {
    console.error('❌ Error checking terms acceptance:', error);
    // On error, assume not accepted to be safe
    return false;
  }
};

/**
 * Save terms and conditions acceptance
 * Only saves when accepted is true. When declined, we don't save anything
 * so the modal will show again on next launch.
 */
export const setTermsAccepted = async (accepted: boolean): Promise<void> => {
  try {
    if (accepted) {
      console.log('💾 Saving terms acceptance: true');
      await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, 'true');

      // Verify it was saved correctly
      const verifyValue = await AsyncStorage.getItem(TERMS_ACCEPTED_KEY);
      console.log('✅ Verified saved value:', verifyValue);

      if (verifyValue !== 'true') {
        console.error('⚠️ Warning: Saved value does not match expected value!');
        throw new Error('Failed to save terms acceptance');
      }
    } else {
      // When declined, remove the key so modal shows again next time
      console.log('💾 User declined terms, removing acceptance key');
      await AsyncStorage.removeItem(TERMS_ACCEPTED_KEY);
    }
  } catch (error) {
    console.error('❌ Error saving terms acceptance:', error);
    throw error; // Re-throw to let caller know it failed
  }
};

/**
 * Check location permission status
 */
export const checkLocationPermission = async (): Promise<string> => {
  try {
    if (!Platform || !Platform.OS) {
      console.error('Platform is not available');
      return RESULTS.DENIED;
    }

    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const result = await check(permission);
    return result;
  } catch (error) {
    console.error('Error checking location permission:', error);
    return RESULTS.DENIED;
  }
};

/**
 * Request location permission
 */
export const requestLocationPermission = async (): Promise<string> => {
  try {
    if (!Platform || !Platform.OS) {
      console.error('Platform is not available');
      return RESULTS.DENIED;
    }

    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const result = await request(permission);
    return result;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return RESULTS.DENIED;
  }
};

/**
 * Check and request location permission with user feedback
 */
export const checkAndRequestLocationPermission = async (
  showDeniedAlert: boolean = true,
): Promise<boolean> => {
  try {
    if (!Platform || !Platform.OS) {
      console.error('Platform is not available, skipping location permission');
      return false;
    }

    const currentStatus = await checkLocationPermission();

    if (currentStatus === RESULTS.GRANTED) {
      return true;
    }

    if (currentStatus === RESULTS.DENIED) {
      const requestResult = await requestLocationPermission();
      if (requestResult === RESULTS.GRANTED) {
        return true;
      }
      if (requestResult === RESULTS.BLOCKED && showDeniedAlert) {
        showLocationPermissionDeniedAlert();
      }
      return false;
    }

    if (currentStatus === RESULTS.BLOCKED && showDeniedAlert) {
      showLocationPermissionDeniedAlert();
    }

    return false;
  } catch (error) {
    console.error('Error in checkAndRequestLocationPermission:', error);
    return false;
  }
};

/**
 * Show alert when location permission is denied
 */
export const showLocationPermissionDeniedAlert = (): void => {
  try {
    if (!Platform || !Platform.OS) {
      console.error('Platform is not available');
      return;
    }

    Alert.alert(
      'Standortberechtigung verweigert',
      'Standortzugriff ist erforderlich, damit diese App ordnungsgemäß funktioniert. Sie können ihn in Einstellungen > Apps > NARRENRADAR > Berechtigungen aktivieren.',
      [
        {
          text: 'Ohne Standort fortfahren',
          style: 'cancel',
          onPress: () => {
            console.log('User chose to continue without location');
          },
        },
        {
          text: 'Einstellungen öffnen',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              openSettings();
            }
          },
        },
      ],
      {cancelable: true},
    );
  } catch (error) {
    console.error('Error showing location permission alert:', error);
  }
};

/**
 * Open app settings
 */
export const openAppSettings = (): void => {
  try {
    if (!Platform || !Platform.OS) {
      console.error('Platform is not available');
      return;
    }

    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      openSettings();
    }
  } catch (error) {
    console.error('Error opening app settings:', error);
  }
};

/**
 * Check if location permission was previously requested
 */
export const wasLocationPermissionRequested = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(LOCATION_PERMISSION_KEY);
    return value === 'true';
  } catch (error) {
    return false;
  }
};

/**
 * Mark location permission as requested
 */
export const setLocationPermissionRequested = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, 'true');
  } catch (error) {
    console.error('Error saving location permission requested:', error);
  }
};
