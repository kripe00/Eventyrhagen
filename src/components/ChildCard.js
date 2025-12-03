import { Image, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

export const ChildCard = ({ item, onPress }) => {
  // 1. Hent nåværende fargetema
  const isDark = useColorScheme() === 'dark';

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        isDark && styles.cardDark, // Mørk bakgrunn
        item.status === 'home' && !item.isSick && styles.dimmed, 
        // Håndter lys/mørk variant av "Syk"-kort
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
        <View style={styles.sickBadge}><Text style={styles.sickText}>SYK</Text></View>
      )}
      
      {item.status === 'present' && (
        <View style={[styles.onlineIndicator, isDark && styles.badgeBorderDark]} />
      )}
      
      <Text style={[
        styles.name, 
        isDark && styles.textLight, // Lys tekst som standard i darkmode
        // Juster farge for syke barn (Lys rød i darkmode, mørk rød i lightmode)
        item.isSick && {color: isDark ? '#fca5a5' : '#991b1b'} 
      ]}>
        {item.name}
      </Text>

      <Text style={[styles.info, isDark && styles.infoDark]}>{item.avdeling}</Text>
      
      {item.status === 'present' && item.checkInTime && (
          <Text style={[styles.timeText, isDark && styles.timeTextDark]}>
            Inn: {item.checkInTime}
          </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // --- GRUNNOPPSETT (LIGHT MODE) ---
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

  // --- DARK MODE TILPASNINGER ---
  cardDark: {
    backgroundColor: '#1f2937', // Mørk grå (Slate-800)
    shadowOpacity: 0.3, // Litt sterkere skygge for å skille fra svart bakgrunn
  },
  sickCardDark: {
    backgroundColor: '#450a0a', // Veldig mørk rød
    borderColor: '#7f1d1d',     // Mørkere rød kant
    borderWidth: 1,
  },
  imageDark: {
    backgroundColor: '#374151', // Mørkere placeholder bak bilde
  },
  textLight: {
    color: '#f3f4f6', // Nesten hvit
  },
  infoDark: {
    color: '#9ca3af', // Lysere grå for sekundær tekst
  },
  timeTextDark: {
    color: '#4ade80', // Lysere grønn (lettere å lese på mørk bakgrunn)
  },
  badgeBorderDark: {
    borderColor: '#1f2937', // Må matche cardDark bakgrunnsfargen for å se "usynlig" ut
  }
});