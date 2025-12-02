import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/Authcontext';

export default function ParentScreen() {
  const { logout } = useAuth(); 

  return (
    <SafeAreaView style={styles.container}>
      
      {/* HEADER MED LOGG UT KNAPP */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Min Side</Text>
        
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logg ut</Text>
          <Ionicons name="log-out-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* MIDLERTIDIG INNHOLD */}
      <View style={styles.content}>
        <Ionicons name="construct-outline" size={80} color="#cbd5e1" />
        <Text style={styles.infoText}>Foreldre-visning kommer snart!</Text>
        <Text style={styles.subText}>Her vil du se dine barn når funksjonaliteten er ferdig.</Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  
  // Header stiler
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center' },
  logoutText: { marginRight: 8, color: '#374151', fontSize: 14, fontWeight: '500' },

  // Innhold stiler
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  infoText: { fontSize: 18, fontWeight: 'bold', color: '#64748b', marginTop: 20 },
  subText: { textAlign: 'center', color: '#94a3b8', marginTop: 10 }
});