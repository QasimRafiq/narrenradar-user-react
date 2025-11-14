import React, {useState, useMemo} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Text,
  Dimensions,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {COLORS} from '../constants/theme';
import {Fonts} from '../../assets/fonts/fonts';
import {termsHtmlContent} from '../constants/termsContent';

interface TermsAndConditionsModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  visible,
  onAccept,
  onDecline,
}) => {
  const [checked, setChecked] = useState(false);

  // Reset checkbox when modal opens
  React.useEffect(() => {
    if (visible) {
      setChecked(false);
    }
  }, [visible]);

  // Create styled HTML with the terms content
  const styledHtml = useMemo(() => {
    const backgroundColor = '#FFFFFF';
    const textColor = '#1C1C1C';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <style>
            body { 
              padding: 16px; 
              font-family: system-ui, -apple-system, sans-serif; 
              line-height: 1.5; 
              color: ${textColor};
              background-color: ${backgroundColor};
              font-size: 14px;
              margin: 0;
            }
            h1, h2, h3 { 
              color: ${textColor};
              margin: 1.2em 0 0.4em 0;
              font-weight: 500;
            }
            h1 { font-size: 1.1em; }
            h2 { font-size: 1.05em; }
            h3 { font-size: 1em; }
            p { 
              margin: 0 0 0.8em 0; 
            }
            ul, ol { 
              padding-left: 20px; 
              margin: 0 0 0.8em 0;
            }
            li { margin-bottom: 0.2em; }
            strong, b { font-weight: 500; }
            .MsoNormal { margin: 0 0 0.8em 0; }
          </style>
        </head>
        <body>${termsHtmlContent}</body>
      </html>
    `;
  }, []);

  const handleAccept = () => {
    if (checked) {
      onAccept();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Geschäftsbedingungen</Text>
          </View>

          {/* WebView Content */}
          <View style={styles.webViewContainer}>
            <WebView
              source={{html: styledHtml}}
              style={styles.webView}
              javaScriptEnabled={false}
              showsVerticalScrollIndicator={true}
              showsHorizontalScrollIndicator={false}
              scalesPageToFit={true}
              startInLoadingState={true}
            />
          </View>

          {/* Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setChecked(!checked)}>
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
              {checked && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Ich stimme den Bedingungen zu
            </Text>
          </TouchableOpacity>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={onDecline}
              activeOpacity={0.7}>
              <Text style={styles.declineButtonText}>Ablehnen</Text>
            </TouchableOpacity>

            <View style={{width: 12}} />

            <TouchableOpacity
              style={[
                styles.acceptButton,
                !checked && styles.acceptButtonDisabled,
              ]}
              onPress={handleAccept}
              disabled={!checked}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.acceptButtonText,
                  !checked && styles.acceptButtonTextDisabled,
                ]}>
                Akzeptieren
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'ios' ? 20 : 16,
  },
  modalContainer: {
    width: screenWidth * 0.95,
    height: screenHeight * 0.9,
    maxWidth: 600,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerText: {
    fontSize: 18,
    fontFamily: Fonts.heading,
    color: COLORS.black,
    fontWeight: '500',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  webView: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.green,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: Fonts.comfortaaRegular,
    color: COLORS.black,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  declineButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  declineButtonText: {
    fontSize: 14,
    fontFamily: Fonts.comfortaaMedium,
    color: COLORS.green,
  },
  acceptButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    backgroundColor: COLORS.green,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  acceptButtonText: {
    fontSize: 14,
    fontFamily: Fonts.comfortaaMedium,
    color: COLORS.white,
  },
  acceptButtonTextDisabled: {
    color: '#999999',
  },
});

export default TermsAndConditionsModal;
