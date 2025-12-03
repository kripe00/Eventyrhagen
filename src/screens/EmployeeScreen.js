import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet, Text, TextInput, TouchableOpacity,
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

  // meldinger state
  const [msgModalVisible, setMsgModalVisible] = useState(false); 
  const [inboxVisible, setInboxVisible] = useState(false); 
  const [inboxMessages, setInboxMessages] = useState([]); 
  
  const [msgTitle, setMsgTitle] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [loading, setLoading] = useState(false);

  // hent barn
  useEffect(() => {
    let q = userData?.department 
        ? query(collection(db, "children"), where("avdeling", "==", userData.department))
        : collection(db, "children");

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChildren(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [userData]);

  // hent innboks (meldinger fra foreldre)
  useEffect(() => {
      if (!userData?.department) return;

      // hent meldinger som er sendt til MIN avdeling
      const q = query(
          collection(db, "departmentMessages"), 
          where("department", "==", userData.department),
          orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
          setInboxMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return unsubscribe;
  }, [userData]);

  // sjekk inn/ut
  const toggleCheckIn = async (child) => {
    const childRef = doc(db, "children", child.id);
    const newStatus = child.status === 'home' ? 'present' : 'home';
    const updates = { status: newStatus, 
        checkInTime: newStatus === 'present' 
        ? `${new Date().getHours().toString().padStart(2,'0')}:${new Date().getMinutes().toString().padStart(2,'0')}` 
        : null 
    };
    await updateDoc(childRef, updates);
    setSelectedChild(null);
  };

  // publiser fellesbeskjed
  const handlePublishMessage = async () => {
      if (!msgTitle || !msgContent) return Alert.alert("Mangler info", "Skriv tittel og innhold.");
      setLoading(true);
      try {
          const dateStr = new Date().toLocaleDateString('no-NO', { day: 'numeric', month: 'long' });
          await addDoc(collection(db, "messages"), { 
              title: msgTitle, content: msgContent, date: dateStr,
              author: userData?.department || "Ansatt", createdAt: new Date() 
          });
          Alert.alert("Suksess", "Beskjed sendt!");
          setMsgTitle(''); setMsgContent(''); setMsgModalVisible(false);
      } catch (error) { Alert.alert("Feil", error.message); } finally { setLoading(false); }
  };

  // filtrering av barn
  const filteredData = children.filter(c => {
    if (filter === 'present') return c.status === 'present';
    if (filter === 'home') return c.status === 'home';
    return true;
  });
  const presentCount = children.filter(c => c.status === 'present').length;

  return (
    <SafeAreaContext style={[styles.container, { backgroundColor: '#312e81' }]} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor="#312e81" />

      <View style={styles.header}>
        <View>
            <Text style={styles.headerTitle}>Oversikt</Text>
            <Text style={styles.deptHeader}>{userData?.department || "Alle avdelinger"}</Text>
            <Text style={styles.subHeader}>Til stede: {presentCount} / {children.length}</Text>
        </View>
        <View style={{flexDirection: 'row'}}>
            
            <TouchableOpacity onPress={() => setInboxVisible(true)} style={styles.headerBtn}>
               
                {inboxMessages.length > 0 && <View style={styles.notificationDot} />}
                <Ionicons name="mail-outline" size={26} color="white" />
            </TouchableOpacity>

           
            <TouchableOpacity onPress={() => setMsgModalVisible(true)} style={[styles.headerBtn, {marginLeft: 10}]}>
                <Ionicons name="megaphone-outline" size={26} color="white" />
            </TouchableOpacity>
            
            
            <TouchableOpacity onPress={logout} style={[styles.headerBtn, {marginLeft: 10}]}>
                <Ionicons name="log-out-outline" size={28} color="white" />
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.filters}>
            {['all', 'present', 'home'].map(f => (
                <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.activeChip]}>
                    <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>{f === 'all' ? 'Alle' : f === 'present' ? 'Til stede' : 'Hjemme'}</Text>
                </TouchableOpacity>
            ))}
        </View>
        <FlatList
            data={filteredData}
            renderItem={({ item }) => <ChildCard item={item} onPress={setSelectedChild} />}
            keyExtractor={item => item.id}
            numColumns={3} contentContainerStyle={{ padding: 10 }}
        />
      </View>

     
      <Modal visible={!!selectedChild} transparent animationType="fade" onRequestClose={() => setSelectedChild(null)}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedChild?.name}</Text>
                {selectedChild?.allergy && (<View style={styles.warningBox}><Ionicons name="alert-circle" size={24} color="#dc2626" /><Text style={styles.warningText}>OBS: HAR ALLERGI!</Text></View>)}
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: selectedChild?.status === 'home' ? '#dcfce7' : '#fee2e2'}]} onPress={() => toggleCheckIn(selectedChild)}>
                    <Ionicons name={selectedChild?.status === 'home' ? "log-in-outline" : "log-out-outline"} size={24} color={selectedChild?.status === 'home' ? '#166534' : '#991b1b'} style={{marginRight: 8}}/>
                    <Text style={[styles.actionText, {color: selectedChild?.status === 'home' ? '#166534' : '#991b1b'}]}>{selectedChild?.status === 'home' ? 'Sjekk INN' : 'Sjekk UT'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedChild(null)} style={{marginTop: 20, alignSelf: 'center'}}><Text style={{color: '#6b7280'}}>Lukk</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>

      
      <Modal visible={msgModalVisible} transparent animationType="slide" onRequestClose={() => setMsgModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={[styles.modalContent, {width: '90%'}]}>
                <Text style={styles.modalTitle}>Ny fellesbeskjed</Text>
                <Text style={styles.label}>Tittel</Text><TextInput style={styles.input} value={msgTitle} onChangeText={setMsgTitle} />
                <Text style={styles.label}>Innhold</Text><TextInput style={[styles.input, {height: 120}]} value={msgContent} onChangeText={setMsgContent} multiline textAlignVertical="top" />
                <View style={{flexDirection:'row', justifyContent:'space-between', marginTop: 10}}>
                    <TouchableOpacity onPress={() => setMsgModalVisible(false)} style={{padding:10}}><Text style={{color:'gray'}}>Avbryt</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#4338ca', paddingHorizontal: 20}]} onPress={handlePublishMessage} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{color: 'white', fontWeight:'bold'}}>Publiser</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      
      <Modal visible={inboxVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setInboxVisible(false)}>
          <View style={styles.inboxContainer}>
              <View style={styles.inboxHeader}>
                  <Text style={styles.inboxTitle}>Meldinger til {userData?.department}</Text>
                  <TouchableOpacity onPress={() => setInboxVisible(false)}><Ionicons name="close-circle" size={30} color="#374151" /></TouchableOpacity>
              </View>
              <FlatList 
                  data={inboxMessages}
                  keyExtractor={item => item.id}
                  contentContainerStyle={{padding: 20}}
                  ListEmptyComponent={<Text style={{textAlign:'center', marginTop:50, color:'gray'}}>Ingen nye meldinger.</Text>}
                  renderItem={({item}) => (
                      <View style={styles.inboxCard}>
                          <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                              <Text style={styles.inboxChildName}>{item.childName}</Text>
                              <Text style={styles.inboxDate}>{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Nylig'}</Text>
                          </View>
                          <Text style={styles.inboxContent}>{item.content}</Text>
                          <Text style={styles.inboxFrom}>Fra: {item.fromEmail}</Text>
                      </View>
                  )}
              />
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
  deptHeader: { color: '#fbbf24', fontSize: 16, fontWeight: '600' },
  subHeader: { color: '#a5b4fc', fontSize: 12 },
  headerBtn: { padding: 5, position: 'relative' },
  notificationDot: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444', zIndex: 10 },
  
  filters: { flexDirection: 'row', padding: 10, backgroundColor: 'white' },
  filterChip: { padding: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#f3f4f6', marginRight: 10 },
  activeChip: { backgroundColor: '#312e81' },
  filterText: { color: '#6b7280', fontWeight: 'bold' },
  activeFilterText: { color: 'white' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20, alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 24, borderRadius: 20, width: '100%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  warningBox: { backgroundColor: '#fee2e2', padding: 10, borderRadius: 8, marginBottom: 15, flexDirection:'row', alignItems:'center' },
  warningText: { color: '#991b1b', fontWeight: 'bold', marginLeft: 10 },
  actionBtn: { padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  actionText: { fontWeight: 'bold', fontSize: 18 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#f3f4f6', padding: 14, borderRadius: 10, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb' },

  
  inboxContainer: { flex: 1, backgroundColor: '#f9fafb', paddingTop: 50 }, // Padding top for iOS
  inboxHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  inboxTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  inboxCard: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, elevation: 1 },
  inboxChildName: { fontSize: 16, fontWeight: 'bold', color: '#4f46e5' },
  inboxContent: { fontSize: 16, color: '#374151', marginVertical: 8, lineHeight: 22 },
  inboxFrom: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic' },
  inboxDate: { fontSize: 12, color: '#6b7280' }
});