import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const ChildCard = ({ item, onPress }) => (
  <TouchableOpacity 
    style={[
      styles.card, 
      item.status === 'home' && !item.isSick && styles.dimmed, 
      item.isSick && styles.sickCard 
    ]} 
    onPress={() => onPress(item)}
  >
    <Image source={{ uri: item.image }} style={[styles.image, item.isSick && {opacity: 0.6}]} />
    
    
    {item.allergy && (
      <View style={styles.allergyBadge}>
        <Text style={styles.allergyText}>!</Text>
      </View>
    )}

   
    {item.isSick && (
      <View style={styles.sickBadge}><Text style={styles.sickText}>SYK</Text></View>
    )}
    
    
    {item.status === 'present' && <View style={styles.onlineIndicator} />}
    
    <Text style={[styles.name, item.isSick && {color: '#991b1b'}]}>{item.name}</Text>
    <Text style={styles.info}>{item.avdeling}</Text>
    
    {item.status === 'present' && item.checkInTime && (
        <Text style={styles.timeText}>Inn: {item.checkInTime}</Text>
    )}
  </TouchableOpacity>
);

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
  timeText: { fontSize: 10, color: '#15803d', fontWeight: 'bold', marginTop: 4 }
});