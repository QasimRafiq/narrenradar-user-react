import {
  ImageBackground,
  StyleSheet,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
} from 'react-native';
import React, {useState} from 'react';
import {IMAGES} from '../../assets/images';
import {GlobalStyleSheet} from '../../shared/constants/GlobalStyleSheet';
import CustomHeader from '../../shared/components/customHeader/CusstomHeader';
import de from '../../shared/constants/de.json';
import TextField from '../../shared/components/customText/TextField';
import {COLORS} from '../../shared/constants/theme';
import {Fonts} from '../../assets/fonts/fonts';
import {
  useClubUsers,
  useEvents,
  useRegions,
} from '../../shared/utills/firebaseUtils';
import {formatTimestamp} from '../../shared/constants/dummyData';
import ROUTE_NAMES from '../../routes/routesName';
import {useNavigation} from '@react-navigation/native';
import CustomRegionGrid from '../../shared/components/customRenderItems/CustomRegionGrid';
import ClubUserList from '../../shared/components/customRenderItems/ClubUserList';
import CustomLoader from '../../shared/components/CustomLoader';

const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const {regions, loading: regionsLoading} = useRegions();
  const {events, loading: eventsLoading} = useEvents();
  const {clubUsers, loading} = useClubUsers();

  const [activeFilter, setActiveFilter] = useState(de.event);
  const [searchText, setSearchText] = useState('');

  const filters = [de.event, 'Verband', 'Verein'];

  // Clear search when switching filters (matching Android behavior)
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setSearchText('');
  };

  // Filter events matching Android behavior: search by name, eventLocation, and description
  const filteredEvents = searchText
    ? events?.filter((e: any) => {
        // Skip header items if any (shouldn't be in flat events list)
        if (e.type === 'header') return false;

        const searchLower = searchText.toLowerCase();
        return (
          e.name?.toLowerCase().includes(searchLower) ||
          e.eventLocation?.toLowerCase().includes(searchLower) ||
          e.description?.toLowerCase().includes(searchLower)
        );
      })
    : events?.filter((e: any) => e.type !== 'header'); // Filter out any header items

  // Filter regions matching Android behavior: search by name (title)
  const filteredRegion = searchText
    ? regions?.filter((e: any) =>
        e?.name?.toLowerCase().includes(searchText.toLowerCase()),
      )
    : regions;

  // Filter club users matching Android behavior: search by clubName, regionTitles, and ort
  const filteredClubUsers = searchText
    ? clubUsers?.filter((e: any) => {
        const searchLower = searchText.toLowerCase();
        const clubNameMatch =
          e?.clubName?.toLowerCase().includes(searchLower) || false;
        // Handle regionTitles - could be array or object
        const regionTitles = Array.isArray(e?.regionTitles)
          ? e.regionTitles
          : e?.regionTitles
          ? Object.values(e.regionTitles)
          : [];
        const regionMatch = regionTitles.some((region: string) =>
          region?.toLowerCase().includes(searchLower),
        );
        const ortMatch = e?.ort?.toLowerCase().includes(searchLower) || false;
        return clubNameMatch || regionMatch || ortMatch;
      })
    : clubUsers;
  return (
    <ImageBackground
      source={IMAGES.backgroundImg}
      resizeMode="cover"
      style={GlobalStyleSheet.bgImage}>
      <CustomHeader />

      {/* Title */}
      <TextField
        uppercase
        textAlign="center"
        text={
          activeFilter === de.event
            ? de.event
            : activeFilter === 'Verband'
            ? 'Verband'
            : 'Verein'
        }
        color={COLORS.green}
        fontSize={22}
        fontFamily={Fonts.heading}
        marginTop={10}
        marginBottom={20}
        letterSpacing={1.5}
      />

      {/* Filter Buttons */}
      <View style={styles.filterRow}>
        {filters.map(item => (
          <TouchableOpacity
            key={item}
            style={[
              styles.filterBtn,
              activeFilter === item && styles.filterBtnActive,
            ]}
            onPress={() => handleFilterChange(item)}>
            <TextField
              textAlign="center"
              text={item}
              fontSize={14}
              fontFamily={Fonts.regular}
              color={activeFilter === item ? 'white' : COLORS.green}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Box */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder={
            activeFilter === de.event
              ? 'Veranstaltung suchen'
              : activeFilter === 'Verband'
              ? 'Verband suchen'
              : 'Verein suchen'
          }
          placeholderTextColor={COLORS.title}
          style={styles.input}
          value={searchText}
          onChangeText={setSearchText}
        />
        <Image
          source={IMAGES.search}
          resizeMode="contain"
          style={{width: 24, height: 24}}
        />
      </View>

      {/* Event List */}
      {activeFilter === de.event && (
        <>
          {eventsLoading ? (
            <CustomLoader message="DATEN ABRUFEN..." />
          ) : filteredEvents && filteredEvents.length > 0 ? (
            <FlatList
              data={filteredEvents}
              keyExtractor={(item, index) => item?.id || index?.toString()}
              contentContainerStyle={{padding: 15}}
              renderItem={({item}) => {
                // Skip rendering header items
                if (item.type === 'header') return null;

                return (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate(ROUTE_NAMES.EVENT_DETAIL_SCREEN, {
                        eventDetails: item,
                      })
                    }
                    style={{marginBottom: 18}}>
                    <TextField
                      text={`${formatTimestamp(item.eventDate)}- ${
                        item.name || ''
                      }`}
                      fontSize={16}
                      color={COLORS.green}
                      fontFamily={Fonts.comfortaaSemiBold}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <Text
              style={{
                textAlign: 'center',
                marginTop: 20,
                color: COLORS.green,
                fontFamily: Fonts.regular,
              }}>
              Keine Veranstaltungen gefunden.
            </Text>
          )}
        </>
      )}

      {/* Region List */}
      {activeFilter === 'Verband' && (
        <View style={GlobalStyleSheet.componentContainer}>
          {regionsLoading ? (
            <CustomLoader message="DATEN ABRUFEN..." />
          ) : filteredRegion && filteredRegion.length > 0 ? (
            <CustomRegionGrid
              data={filteredRegion}
              titleKey="name"
              imageKey="imageUrl"
              onPress={item =>
                navigation.navigate(ROUTE_NAMES.CLUB_DETAIL, {regionData: item})
              }
            />
          ) : (
            <Text
              style={{
                textAlign: 'center',
                marginTop: 20,
                color: COLORS.green,
                fontFamily: Fonts.regular,
              }}>
              Keine Verbände gefunden.
            </Text>
          )}
        </View>
      )}

      {/* Club Users List */}
      {activeFilter === 'Verein' && (
        <View style={{paddingHorizontal: 15}}>
          {loading ? (
            <CustomLoader message="DATEN ABRUFEN..." />
          ) : filteredClubUsers && filteredClubUsers.length > 0 ? (
            <ClubUserList data={filteredClubUsers} regionDetail={null} />
          ) : (
            <Text
              style={{
                textAlign: 'center',
                marginTop: 20,
                color: COLORS.green,
                fontFamily: Fonts.regular,
              }}>
              Keine Vereine gefunden.
            </Text>
          )}
        </View>
      )}
    </ImageBackground>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  filterBtn: {
    borderWidth: 1,
    borderColor: COLORS.green,
    borderRadius: 16,
    paddingVertical: 12,
    marginHorizontal: 5,
    backgroundColor: 'white',
    width: '30%',
    marginBottom: 10,
  },
  filterBtnActive: {
    backgroundColor: COLORS.green,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.green,
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontFamily: Fonts.comfortaaRegular,
    color: COLORS.secondary,
    fontSize: 16,
    letterSpacing: 1,
  },
});
