import {Dimensions} from 'react-native';
const {width, height} = Dimensions.get('screen');

export const COLORS = {
  black: '#000000',
  primary: '#f90', //"#00BA87",
  primaryLight: 'rgba(0,186,135,.15)',
  secondary: '#000',
  success: 'gold', //"#0ecb81",
  danger: '#ff4a5c',
  info: '#627EEA',
  warning: '#ffb02c',
  yellow: '#fff346',
  white: '#fff',
  dark: '#2f2f2f',
  light: '#E6E6E6',
  green: '#008243',
  light_green: '#e2f0d9',
  // Buttons Gradient: #008243 to #8dc63f

  // light
  title: '#20212D',
  text: '#909090',
  background: '#FCFBFC',
  card: '#fff',
  border: '#eee',
  textGrey: '#3333',

  // dark
  darkTitle: '#fff',
  darkText: 'rgba(255,255,255,.6)',
  darkBackground: '#080912',
  darkCard: '#161724',
  darkBorder: '#252739',
  marketHeader: '#191C1B',
  marketCards: '#101010',
};

export const SIZES = {
  font: 14,
  fontSm: 13,
  fontXs: 12,
  radius: 10,
  radius_lg: 20,
  radius_sm: 6,

  //space
  padding: 15,
  margin: 15,

  //Font Sizes
  h1: 40,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,

  //App dimensions
  width,
  height,
  contentArea: {
    paddingTop: 70,
    paddingBottom: 150,
  },
};
export const FONTS = {
  font: {fontSize: SIZES.font, lineHeight: 20, fontFamily: 'Poppins-Regular'},
  fontSm: {
    fontSize: SIZES.fontSm,
    lineHeight: 18,
    fontFamily: 'Poppins-Regular',
  },
  fontXs: {
    fontSize: SIZES.fontXs,
    lineHeight: 14,
    fontFamily: 'Poppins-Regular',
  },
  h1: {
    fontSize: SIZES.h1,
    lineHeight: 48,
    color: COLORS.title,
    fontFamily: 'Poppins-SemiBold',
  },
  h2: {
    fontSize: SIZES.h2,
    lineHeight: 34,
    color: COLORS.title,
    fontFamily: 'Poppins-SemiBold',
  },
  h3: {
    fontSize: SIZES.h3,
    lineHeight: 28,
    color: COLORS.title,
    fontFamily: 'Poppins-SemiBold',
  },
  h4: {
    fontSize: SIZES.h4,
    lineHeight: 26,
    color: COLORS.title,
    fontFamily: 'Poppins-SemiBold',
  },
  h5: {
    fontSize: SIZES.h5,
    lineHeight: 24,
    color: COLORS.title,
    fontFamily: 'Poppins-SemiBold',
  },
  h6: {
    fontSize: SIZES.h6,
    lineHeight: 20,
    color: COLORS.title,
    fontFamily: 'Poppins-SemiBold',
  },

  fontMedium: {fontFamily: 'Poppins-Medium'},
  fontBold: {fontFamily: 'Poppins-SemiBold'},
};

const appTheme = {COLORS, SIZES, FONTS};

export default appTheme;
