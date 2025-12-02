import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView as SafeAreaContext } from 'react-native-safe-area-context';

import { ChildCard } from '../components/ChildCard';
import { db } from '../config/firebaseconfig';
import { useAuth } from '../context/Authcontext';

export default function EmployeeScreen() {
  const { logout, userData } = useAuth(); 
  const [children, setChildren] = useState([]);
  const [filter, setFilter] = useState('all'); 
  const [selectedChild, setSelectedChild] = useState(null);

  // hent barn
  useEffect(() => {
    let q;

    // Hvis den ansatte har en registrert avdeling, filtrer på den
    if (userData?.department) {
        console.log("Henter barn for avdeling:", userData.department);
        q = query(
            collection(db, "children"), 
            where("avdeling", "==", userData.department) 
        );
    } else {
        // Hvis ingen avdeling er satt på brukeren, hent alle (eller vis ingen)
        console.log("Ingen avdeling funnet på bruker, henter alle.");
        q = collection(db, "children");
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChildren(list);
    });
    return unsubscribe;
  }, [userData]); 

  // sjekk inn/ut
  const toggleCheckIn = async (child) => {
    const childRef = doc(db, "children", child.id);
    const newStatus = child.status === 'home' ? 'present' : 'home';
    const updates = { status: newStatus };
    
    if (newStatus === 'present') {
      const now = new Date();
      updates.checkInTime = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    } else {
        updates.checkInTime = null;
    }
    await updateDoc(childRef, updates);
    setSelectedChild(null);
  };

  const filteredData = children.filter(c => {
    if (filter === 'present') return c.status === 'present';
    if (filter === 'home') return c.status === 'home';
    return true;
  });

  const presentCount = children.filter(c => c.status === 'present').length;

  return (
    <SafeAreaContext 
      style={[styles.container, { backgroundColor: '#312e81' }]} 
      edges={['top', 'left', 'right']}
    >
      <StatusBar style="light" backgroundColor="#312e81" />

     
      <View style={styles.header}>
        <View>
            <Text style={styles.headerTitle}>Oversikt</Text>
            
            <Text style={styles.deptHeader}>{userData?.department || "Alle avdelinger"}</Text>
            <Text style={styles.subHeader}>Til stede: {presentCount} / {children.length}</Text>
        </View>
        <TouchableOpacity onPress={logout}><Ionicons name="log-out-outline" size={28} color="white" /></TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.filters}>
            {['all', 'present', 'home'].map(f => (
                <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.activeChip]}>
                    <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>
                        {f === 'all' ? 'Alle' : f === 'present' ? 'Til stede' : 'Hjemme'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        {children.length === 0 && (
            <View style={{padding: 20, alignItems: 'center'}}>
                <Text style={{color: '#6b7280'}}>Fant ingen barn i avdeling: "{userData?.department}"</Text>
                <Text style={{color: '#9ca3af', fontSize: 12, marginTop: 5}}>Sjekk at stavingen er nøyaktig lik.</Text>
            </View>
        )}

        <FlatList
            data={filteredData}
            renderItem={({ item }) => <ChildCard item={item} onPress={setSelectedChild} />}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={{ padding: 10 }}
        />
      </View>

      <Modal visible={!!selectedChild} transparent animationType="fade" onRequestClose={() => setSelectedChild(null)}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                {selectedChild?.allergy && (
    <View style={{backgroundColor: '#fee2e2', padding: 10, borderRadius: 8, marginBottom: 20, flexDirection:'row', alignItems:'center'}}>
        <Ionicons name="alert-circle" size={24} color="#dc2626" />
        <Text style={{color: '#991b1b', fontWeight: 'bold', marginLeft: 10}}>OBS: HAR ALLERGI!</Text>
    </View>
)}
                <Text style={styles.modalTitle}>{selectedChild?.name}</Text>
                
                {selectedChild?.guardianEmails?.length > 0 && (
                    <View style={{marginBottom: 20}}>
                        <Text style={{fontWeight: 'bold', marginBottom: 5}}>Foresatte:</Text>
                        {selectedChild.guardianEmails.map((email, index) => (
                            <Text key={index} style={{color: '#4b5563'}}>{email}</Text>
                        ))}
                    </View>
                )}

                <TouchableOpacity 
                    style={[styles.actionBtn, {backgroundColor: selectedChild?.status === 'home' ? '#dcfce7' : '#dbeafe'}]}
                    onPress={() => toggleCheckIn(selectedChild)}
                >
                    <Text style={[styles.actionText, {color: selectedChild?.status === 'home' ? '#166534' : '#1e40af'}]}>
                        {selectedChild?.status === 'home' ? 'Sjekk INN' : 'Sjekk UT'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setSelectedChild(null)} style={{marginTop: 15, alignSelf: 'center'}}>
                    <Text style={{color: '#6b7280'}}>Lukk</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </SafeAreaContext>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainContent: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { padding: 16, backgroundColor: '#312e81', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  deptHeader: { color: '#fbbf24', fontSize: 16, fontWeight: '600' }, // Gul farge for avdelingsnavn
  subHeader: { color: '#a5b4fc', fontSize: 12 },
  filters: { flexDirection: 'row', padding: 10, backgroundColor: 'white' },
  filterChip: { padding: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#f3f4f6', marginRight: 10 },
  activeChip: { backgroundColor: '#312e81' },
  filterText: { color: '#6b7280', fontWeight: 'bold' },
  activeFilterText: { color: 'white' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 24, borderRadius: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  actionBtn: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  actionText: { fontWeight: 'bold', fontSize: 18 }
});