import React, {FC} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ROUTE_NAMES from '../routesName';
import Welcome from '../../screens/Welcome';
import EventHome from '../../screens/EventScreens/EventHome';
import EventDetailScreen from '../../screens/EventScreens/EventDetailScreen';
import Splash from '../../screens/Splash';
import ClubHome from '../../screens/ClubScreens/ClubHome';
import ClubDetailScreen from '../../screens/ClubScreens/ClubDetailScreen';
import ClubSelected from '../../screens/ClubScreens/ClubSelected';
import ClubProfileScreen from '../../screens/ClubScreens/ClubProfileScreen';
import ClubEventScreen from '../../screens/ClubScreens/ClubEventScreen';
import ClubEventDetailScreen from '../../screens/ClubScreens/ClubEventDetailScreen';
import AwayDateScreen from '../../screens/ClubScreens/AwayDateScreen';
import {createDrawerNavigator} from '@react-navigation/drawer';
import CustomDrawerContent from '../../shared/components/customDrawer/CustomDrawerContent';
import PdfViewer from '../../screens/EventScreens/PdfViewer';
import GroundViewer from '../../screens/EventScreens/GroundViewer';
import SearchScreen from '../../screens/SearchScreen/SearchScreen';
import SearchByRadius from '../../screens/SearchScreen/SearchByRadius';
import IsPublishEventDetails from '../../screens/EventScreens/IsPublishEventDetails';

const Stack = createNativeStackNavigator<any>();
const Drawer = createDrawerNavigator();

// Event Stack Component
const EventStackScreen: FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name={ROUTE_NAMES.EVENT_HOME_SCREEN} component={EventHome} />
    <Stack.Screen
      name={ROUTE_NAMES.EVENT_DETAIL_SCREEN}
      component={EventDetailScreen}
    />

    <Stack.Screen name={ROUTE_NAMES.PDF_VIEWER_SCREEN} component={PdfViewer} />
    <Stack.Screen
      name={ROUTE_NAMES.Ground_VIEWER_SCREEN}
      component={GroundViewer}
    />
    <Stack.Screen
      name={ROUTE_NAMES.Search_By_Radius}
      component={SearchByRadius}
    />
  </Stack.Navigator>
);
// Club Stack Component
const ClubStackScreen: FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name={ROUTE_NAMES.CLUB_HOME} component={ClubHome} />
    <Stack.Screen name={ROUTE_NAMES.CLUB_DETAIL} component={ClubDetailScreen} />
    <Stack.Screen name={ROUTE_NAMES.CLUB_SELECTED} component={ClubSelected} />
    <Stack.Screen
      name={ROUTE_NAMES.Is_Publish_Event_Details}
      component={IsPublishEventDetails}
    />
    <Stack.Screen
      name={ROUTE_NAMES.CLUB_PROFILE}
      component={ClubProfileScreen}
    />
    <Stack.Screen name={ROUTE_NAMES.CLUB_EVENT} component={ClubEventScreen} />
    <Stack.Screen
      name={ROUTE_NAMES.EVENT_DETAIL_SCREEN}
      component={EventDetailScreen}
    />
    <Stack.Screen
      name={ROUTE_NAMES.CLUB_EVENT_DETAIL}
      component={ClubEventDetailScreen}
    />
    <Stack.Screen name={ROUTE_NAMES.AWAY_DATE} component={AwayDateScreen} />
    <Stack.Screen name={ROUTE_NAMES.PDF_VIEWER_SCREEN} component={PdfViewer} />
    <Stack.Screen
      name={ROUTE_NAMES.Ground_VIEWER_SCREEN}
      component={GroundViewer}
    />
    <Stack.Screen name={ROUTE_NAMES.Search_Screen} component={SearchScreen} />
  </Stack.Navigator>
);

const SearchStackScreen: FC = () => (
  <Stack.Navigator
    initialRouteName={ROUTE_NAMES.Search_Screen}
    screenOptions={{headerShown: false}}>
    <Stack.Screen name={ROUTE_NAMES.Search_Screen} component={SearchScreen} />

    <Stack.Screen
      name={ROUTE_NAMES.EVENT_DETAIL_SCREEN}
      component={EventDetailScreen}
    />
    <Stack.Screen name={ROUTE_NAMES.CLUB_DETAIL} component={ClubDetailScreen} />
    <Stack.Screen name={ROUTE_NAMES.CLUB_SELECTED} component={ClubSelected} />

    <Stack.Screen
      name={ROUTE_NAMES.CLUB_PROFILE}
      component={ClubProfileScreen}
    />
    <Stack.Screen name={ROUTE_NAMES.CLUB_EVENT} component={ClubEventScreen} />

    <Stack.Screen
      name={ROUTE_NAMES.CLUB_EVENT_DETAIL}
      component={ClubEventDetailScreen}
    />
    <Stack.Screen name={ROUTE_NAMES.AWAY_DATE} component={AwayDateScreen} />
    <Stack.Screen name={ROUTE_NAMES.PDF_VIEWER_SCREEN} component={PdfViewer} />
    <Stack.Screen
      name={ROUTE_NAMES.Ground_VIEWER_SCREEN}
      component={GroundViewer}
    />
    <Stack.Screen
      name={ROUTE_NAMES.Is_Publish_Event_Details}
      component={IsPublishEventDetails}
    />
  </Stack.Navigator>
);

const RootNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent />}
      screenOptions={{
        headerShown: false,
      }}>
      {/* <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
        // statusBarStyle: 'light', // or 'dark' depending on your design
      }}
    > */}
      <Stack.Screen name={ROUTE_NAMES.SPLASH_SCREEN} component={Splash} />
      <Stack.Screen name={ROUTE_NAMES.WELCOME_SCREEN} component={Welcome} />
      <Stack.Screen
        name={ROUTE_NAMES.EVENT_HOME_SCREEN}
        component={EventStackScreen}
      />
      <Stack.Screen name={ROUTE_NAMES.CLUB_HOME} component={ClubStackScreen} />
      <Stack.Screen
        name={ROUTE_NAMES.Search_Screen}
        component={SearchStackScreen}
      />

      {/* </Stack.Navigator> */}
    </Drawer.Navigator>
  );
};

export default RootNavigator;
