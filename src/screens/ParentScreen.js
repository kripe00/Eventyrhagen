import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView as SafeAreaContext } from 'react-native-safe-area-context';

import { db } from '../config/firebaseconfig';
import { useAuth } from '../context/Authcontext';

export default function ParentScreen() {
  const { user, logout } = useAuth();
  const [children, setChildren] = useState([]);
  const [messages, setMessages] = useState([]); 
  const [loading, setLoading] = useState(true);

  // state for meldinger
  const [msgModalVisible, setMsgModalVisible] = useState(false);
  const [msgContent, setMsgContent] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);

  // hent barn tilknyttet forelder
  useEffect(() => {
    if (!user?.email) return;
    const q = query(collection(db, "children"), where("guardianEmails", "array-contains", user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChildren(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  // hent felles beskjeder
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  // send melding til avdeling
  const handleSendMessage = async () => {
      if (!msgContent.trim()) return Alert.alert("Tom melding", "Du må skrive noe.");
      
      try {
          await addDoc(collection(db, "departmentMessages"), {
              content: msgContent,
              childName: selectedChild.name,
              childId: selectedChild.id,
              department: selectedChild.avdeling, 
              fromEmail: user.email,
              createdAt: new Date(),
              read: false 
          });
          Alert.alert("Sendt", "Meldingen er sendt til avdelingen.");
          setMsgContent('');
          setMsgModalVisible(false);
      } catch (e) {
          Alert.alert("Feil", "Kunne ikke sende melding: " + e.message);
      }
  };

  const toggleStatus = async (child) => {
    try {
        const childRef = doc(db, "children", child.id);
        const newStatus = child.status === 'home' ? 'present' : 'home';
        const updates = { status: newStatus, isSick: false };
        if (newStatus === 'present') {
          const now = new Date();
          updates.checkInTime = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
        } else { updates.checkInTime = null; }
        await updateDoc(childRef, updates);
    } catch (error) { Alert.alert("Feil", "Kunne ikke oppdatere status."); }
  };

  const reportSickness = async (child) => {
      Alert.alert("Meld fravær", `Melde ${child.name} syk/fri i dag?`, [
          { text: "Avbryt", style: "cancel" },
          { text: "Bekreft", style: "destructive", onPress: async () => {
              try {
                  const childRef = doc(db, "children", child.id);
                  await updateDoc(childRef, { status: 'home', isSick: true, checkInTime: null });
              } catch (error) { Alert.alert("Feil", "Kunne ikke registrere fravær."); }
          }}
      ]);
  };

  const MessagesSection = () => {
    if (messages.length === 0) return null;
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.sectionHeader}>Beskjeder fra Barnehagen</Text>
        {messages.map((msg) => (
          <View key={msg.id} style={styles.messageCard}>
            <View style={styles.msgHeaderRow}>
                <Ionicons name="information-circle" size={20} color="#d97706" style={{marginRight: 8}} />
                <Text style={styles.msgTitle}>{msg.title}</Text>
            </View>
            <Text style={styles.msgContent}>{msg.content}</Text>
            {msg.date && <Text style={styles.msgDate}>{msg.date}</Text>}
          </View>
        ))}
      </View>
    );
  };

  const renderChild = ({ item }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Image source={{ uri: item.image }} style={styles.avatar} />
            <View style={{marginLeft: 12}}>
                <Text style={styles.childName}>{item.name}</Text>
                <Text style={styles.dept}>{item.avdeling}</Text>
            </View>
        </View>

        <View style={[styles.statusBadge, item.isSick ? styles.bgRed : item.status === 'present' ? styles.bgGreen : styles.bgGray]}>
            <Text style={[styles.statusText, item.isSick && {color:'#991b1b'}]}>
                {item.isSick ? 'Meldt fravær' : item.status === 'present' ? 'I Barnehagen' : 'Hjemme'}
            </Text>
        </View>

        <View style={styles.actions}>
            <TouchableOpacity style={[styles.bigBtn, item.isSick ? styles.btnOrange : item.status === 'home' ? styles.btnGreen : styles.btnBlue]} onPress={() => toggleStatus(item)}>
                <Ionicons name={item.status === 'home' ? "log-in-outline" : "log-out-outline"} size={24} color="white" style={{marginRight:8}} />
                <Text style={styles.btnText}>{item.isSick ? 'Friskmeld' : item.status === 'home' ? 'LEVER' : 'HENT'}</Text>
            </TouchableOpacity>
            
           
            {!item.isSick && item.status === 'home' && (
                <TouchableOpacity style={styles.sickBtn} onPress={() => reportSickness(item)}>
                    <Text style={{color: '#dc2626', fontWeight: 'bold'}}>Meld fravær</Text>
                </TouchableOpacity>
            )}
        </View>

        
        <TouchableOpacity 
            style={styles.messageBtn} 
            onPress={() => { setSelectedChild(item); setMsgModalVisible(true); }}
        >
            <Ionicons name="chatbox-ellipses-outline" size={20} color="#4f46e5" style={{marginRight: 8}} />
            <Text style={{color: '#4f46e5', fontWeight: '600'}}>Send melding til {item.avdeling}</Text>
        </TouchableOpacity>
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4f46e5" /></View>;

  return (
    <SafeAreaContext style={[styles.container, { backgroundColor: 'white' }]} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Min Side</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={{marginRight:5, color:'#374151', fontWeight:'500'}}>Logg ut</Text><Ionicons name="log-out-outline" size={24} color="#374151" /></TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <FlatList 
            data={children}
            renderItem={renderChild}
            keyExtractor={item => item.id}
            contentContainerStyle={{padding: 20}}
            ListHeaderComponent={<><MessagesSection />{children.length === 0 && (<View style={styles.center}><Ionicons name="people-outline" size={60} color="#cbd5e1" /><Text style={{color: '#64748b', fontSize: 16, marginTop: 10}}>Ingen barn funnet</Text></View>)}</>}
        />
      </View>

     
      <Modal visible={msgModalVisible} transparent animationType="slide" onRequestClose={() => setMsgModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15}}>
                    <Text style={styles.modalTitle}>Melding til {selectedChild?.avdeling}</Text>
                    <TouchableOpacity onPress={() => setMsgModalVisible(false)}><Ionicons name="close" size={24} color="#374151" /></TouchableOpacity>
                </View>
                <Text style={{marginBottom: 10, color: '#6b7280'}}>Gjelder: {selectedChild?.name}</Text>
                <TextInput 
                    style={styles.msgInput} 
                    placeholder="Skriv beskjeden din her (f.eks. 'Bestemor henter i dag')..." 
                    multiline 
                    value={msgContent}
                    onChangeText={setMsgContent}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
                    <Text style={styles.sendBtnText}>SEND MELDING</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaContext>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainContent: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { alignItems: 'center', padding: 20, marginTop: 50 },
  header: { padding: 20, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', padding: 5 },
  messageContainer: { marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 10, marginLeft: 4 },
  messageCard: { backgroundColor: '#fff7ed', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#fed7aa' },
  msgHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  msgTitle: { fontSize: 16, fontWeight: 'bold', color: '#9a3412' },
  msgContent: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
  msgDate: { fontSize: 12, color: '#9ca3af', marginTop: 8, textAlign: 'right', fontStyle: 'italic' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#e5e7eb' },
  childName: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  dept: { color: '#6b7280', fontSize: 16 },
  statusBadge: { padding: 10, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  bgGreen: { backgroundColor: '#dcfce7' },
  bgGray: { backgroundColor: '#f3f4f6' },
  bgRed: { backgroundColor: '#fee2e2' },
  statusText: { fontWeight: 'bold', color: '#374151', fontSize: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  bigBtn: { flex: 1, flexDirection: 'row', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10, shadowColor: '#000', shadowOpacity: 0.1, elevation: 2 },
  btnGreen: { backgroundColor: '#16a34a' },
  btnBlue: { backgroundColor: '#2563eb' },
  btnOrange: { backgroundColor: '#d97706' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  sickBtn: { padding: 15, borderWidth: 1, borderColor: '#fecaca', borderRadius: 12, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center' },
  

  messageBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, backgroundColor: '#e0e7ff', borderRadius: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  msgInput: { backgroundColor: '#f9fafb', height: 120, borderRadius: 12, padding: 15, textAlignVertical: 'top', fontSize: 16, marginBottom: 15 },
  sendBtn: { backgroundColor: '#4f46e5', padding: 15, borderRadius: 12, alignItems: 'center' },
  sendBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});