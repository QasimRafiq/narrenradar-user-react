// components/ClubUserList.tsx
import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Bullet from '../../../shared/components/customText/Bullet';
import {COLORS} from '../../../shared/constants/theme';
import {Fonts} from '../../../assets/fonts/fonts';
import ROUTE_NAMES from '../../../routes/routesName';
import {useNavigation} from '@react-navigation/native';

type ClubUserListProps = {
  data: any[];
  regionDetail: any;
};

const ClubUserList: React.FC<ClubUserListProps> = ({data, regionDetail}) => {
  const navigation = useNavigation<any>();

  // Sort clubs alphabetically (locale-aware, Android-like)
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      const nameA = (a?.clubName || '').toLowerCase();
      const nameB = (b?.clubName || '').toLowerCase();
      return nameA.localeCompare(nameB, 'de', {sensitivity: 'base'});
    });
  }, [data]);

  const renderClub = ({item}: any) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        navigation.navigate(ROUTE_NAMES.CLUB_SELECTED, {
          clubData: item,
          regionDetail: regionDetail,
        })
      }>
      <View style={styles.textImageContainer}>
        <Text style={styles.clubText}>
          {/* {`${item?.city ? item?.city : ''} - ${item?.clubName}`} */}
          {`${item?.clubName}`}
        </Text>
        {item?.clubImageUrl ? (
          <Image
            source={{uri: item?.clubImageUrl}}
            style={styles.clubLogo}
            resizeMode="contain"
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      style={{marginTop: 10}}
      data={sortedData}
      renderItem={renderClub}
      keyExtractor={item => item?.id}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  textImageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  clubText: {
    fontSize: 14,
    color: COLORS.green,
    fontFamily: Fonts.bold,
    flex: 1,
    marginTop: 4,
  },
  clubLogo: {
    width: 44,
    height: 44,
    marginLeft: 10,
  },
});

export default ClubUserList;
