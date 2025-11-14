import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import TextField from '../customText/TextField';
import {COLORS} from '../../constants/theme';
import {Fonts} from '../../../assets/fonts/fonts';

const {width} = Dimensions.get('window');
const CARD_SIZE = width / 2 - 30;

interface CustomRegionGridProps {
  data: any[];
  titleKey?: string;
  imageKey?: string;
  onPress?: (item: any) => void;
  numColumns?: number;
  columnGap?: number;
}

const CustomRegionGrid: React.FC<CustomRegionGridProps> = ({
  data,
  titleKey = 'name',
  imageKey = 'imageUrl',
  onPress,
  numColumns = 2,
  columnGap = 20,
}) => {
  // Move "Keinem Verband angehörig" to the top if it exists
  const sortedData = React.useMemo(() => {
    if (!data) return [];
    const special = data.find(
      item => item?.[titleKey] === 'Keinem Verband angehörig',
    );
    const others = data.filter(
      item => item?.[titleKey] !== 'Keinem Verband angehörig',
    );
    return special ? [special, ...others] : others;
  }, [data]);

  const GridItem = ({item}: {item: any}) => (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(item)}>
      <LinearGradient
        colors={['#BBBBBB', '#F6F6F6']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.cardGradient}>
        {item?.[imageKey] && (
          <Image
            source={{uri: item?.[imageKey]}}
            style={styles.image}
            resizeMode="contain"
          />
        )}
      </LinearGradient>
      <TextField
        width={'90%'}
        textAlign="center"
        fontSize={14}
        text={item?.[titleKey]}
        color={COLORS.green}
        fontFamily={Fonts.heading}
        marginTop={6}
        lineHeight={18}
        uppercase
      />
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={sortedData}
      renderItem={({item}) => <GridItem item={item} />}
      keyExtractor={(item, index) => index.toString()}
      numColumns={numColumns}
      columnWrapperStyle={{
        justifyContent: 'space-between',
        marginBottom: columnGap,
      }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default CustomRegionGrid;

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    alignItems: 'center',
  },
  cardGradient: {
    alignItems: 'center',
    borderRadius: 20,
    width: CARD_SIZE,
    height: CARD_SIZE,
    justifyContent: 'center',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
});
