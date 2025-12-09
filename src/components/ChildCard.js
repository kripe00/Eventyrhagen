import { Image, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';


export const ChildCard = ({ item, onPress, t }) => {
  const isDark = useColorScheme() === 'dark';

  const translate = (key, fallback) => (t ? t(key) : fallback);

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        isDark && styles.cardDark,
        item.status === 'home' && !item.isSick && styles.dimmed, 
        item.isSick && (isDark ? styles.sickCardDark : styles.sickCard)
      ]} 
      onPress={() => onPress(item)}
    >
      <Image 
        source={{ uri: item.image }} 
        style={[styles.image, isDark && styles.imageDark, item.isSick && {opacity: 0.6}]} 
      />
      
      {item.allergy && (
        <View style={[styles.allergyBadge, isDark && styles.badgeBorderDark]}>
          <Text style={styles.allergyText}>!</Text>
        </View>
      )}

      {item.isSick && (
        <View style={styles.sickBadge}>
            
            <Text style={styles.sickText}>{translate('sickShort', 'SYK')}</Text>
        </View>
      )}
      
      {item.status === 'present' && (
        <View style={[styles.onlineIndicator, isDark && styles.badgeBorderDark]} />
      )}
      
      <Text style={[
        styles.name, 
        isDark && styles.textLight, 
        item.isSick && {color: isDark ? '#fca5a5' : '#991b1b'} 
      ]}>
        {item.name}
      </Text>

      <Text style={[styles.info, isDark && styles.infoDark]}>{item.avdeling}</Text>
      
      {item.status === 'present' && item.checkInTime && (
          <Text style={[styles.timeText, isDark && styles.timeTextDark]}>
            
            {translate('checkIn', 'Inn')}: {item.checkInTime}
          </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  
  card: { flex: 1, margin: 6, backgroundColor: 'white', borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  dimmed: { opacity: 0.5 },
  sickCard: { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1 },
  image: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f9fafb', marginBottom: 8 },
  
  sickBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 4, borderRadius: 4, backgroundColor: '#dc2626' },
  sickText: { color:'white', fontWeight:'bold', fontSize:8 },
  
  allergyBadge: { position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'white', zIndex: 10 },
  allergyText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  onlineIndicator: { position: 'absolute', top: 8, right: 8, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e', borderWidth: 2, borderColor: 'white' },
  name: { fontWeight: 'bold', color: '#1f2937', textAlign: 'center' },
  info: { fontSize: 10, color: '#6b7280' },
  timeText: { fontSize: 10, color: '#15803d', fontWeight: 'bold', marginTop: 4 },

  
  cardDark: {
    backgroundColor: '#1f2937', 
    shadowOpacity: 0.3, 
  },
  sickCardDark: {
    backgroundColor: '#450a0a', 
    borderColor: '#7f1d1d',     
    borderWidth: 1,
  },
  imageDark: {
    backgroundColor: '#374151', 
  },
  textLight: {
    color: '#f3f4f6', 
  },
  infoDark: {
    color: '#9ca3af', 
  },
  timeTextDark: {
    color: '#4ade80', 
  },
  badgeBorderDark: {
    borderColor: '#1f2937', 
  }
});