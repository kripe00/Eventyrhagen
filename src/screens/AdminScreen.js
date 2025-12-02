import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView, Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { db } from '../config/firebaseconfig';
import { useAuth } from '../context/Authcontext';

export default function AdminScreen() {
  const { logout } = useAuth();
  
  // State for visning
  const [activeTab, setActiveTab] = useState('child'); // 'child', 'employee', 'department'
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data lister
  const [childrenList, setChildrenList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);

  // Skjema-felter
  const [childName, setChildName] = useState('');
  const [childDept, setChildDept] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [guardianEmails, setGuardianEmails] = useState([]); 

  const [empName, setEmpName] = useState('');
  const [empDept, setEmpDept] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empEmail, setEmpEmail] = useState('');

  const [deptName, setDeptName] = useState(''); // For ny avdeling

  // --- HENT DATA (Realtime) ---
  useEffect(() => {
    // 1. Barn
    const unsubChild = onSnapshot(query(collection(db, "children"), orderBy("name")), (snapshot) => {
      setChildrenList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    // 2. Ansatte
    const unsubEmp = onSnapshot(query(collection(db, "employees"), orderBy("name")), (snapshot) => {
      setEmployeeList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    // 3. Avdelinger
    const unsubDept = onSnapshot(query(collection(db, "departments"), orderBy("name")), (snapshot) => {
      setDepartmentList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubChild(); unsubEmp(); unsubDept(); };
  }, []);


  const handleDelete = (collectionName, id, name) => {
    Alert.alert("Slett", `Slette ${name}?`, [
        { text: "Avbryt", style: "cancel" },
        { text: "Slett", style: "destructive", onPress: async () => {
            try { await deleteDoc(doc(db, collectionName, id)); } catch(e) { Alert.alert("Feil", "Kunne ikke slette"); }
        }}
    ]);
  };

  const addGuardianEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (email.includes('@') && !guardianEmails.includes(email)) {
      setGuardianEmails([...guardianEmails, email]); setEmailInput('');
    } else { Alert.alert('Ugyldig', 'Sjekk e-post.'); }
  };
  const removeGuardianEmail = (e) => setGuardianEmails(guardianEmails.filter(x => x !== e));

  // lagre data
  const handleCreateChild = async () => {
    if (!childName || !childDept || guardianEmails.length === 0) return Alert.alert('Mangler info', 'Fyll ut alt.');
    setLoading(true);
    try {
      await addDoc(collection(db, "children"), {
        name: childName, avdeling: childDept, guardianEmails, status: 'home', isSick: false, checkInTime: null, createdAt: new Date(),
        image: `https://api.dicebear.com/7.x/avataaars/png?seed=${childName}` 
      });
      Alert.alert('Suksess', `${childName} lagret!`);
      setChildName(''); setChildDept(''); setGuardianEmails([]); setShowForm(false);
    } catch (e) { Alert.alert('Feil', 'Kunne ikke lagre.'); } finally { setLoading(false); }
  };

  const handleCreateEmployee = async () => {
    if (!empName || !empDept || !empEmail) return Alert.alert('Mangler info', 'Fyll ut alt.');
    setLoading(true);
    try {
      await addDoc(collection(db, "employees"), {
        name: empName, department: empDept, email: empEmail.toLowerCase(), phone: empPhone, createdAt: new Date(),
        image: `https://api.dicebear.com/7.x/avataaars/png?seed=${empName}`
      });
      Alert.alert('Suksess', `${empName} lagret!`);
      setEmpName(''); setEmpDept(''); setEmpPhone(''); setEmpEmail(''); setShowForm(false);
    } catch (e) { Alert.alert('Feil', 'Kunne ikke lagre.'); } finally { setLoading(false); }
  };

  const handleCreateDepartment = async () => {
    if (!deptName) return Alert.alert('Mangler info', 'Skriv navnet på avdelingen.');
    setLoading(true);
    try {
      await addDoc(collection(db, "departments"), { name: deptName, createdAt: new Date() });
      Alert.alert('Suksess', `Avdeling ${deptName} opprettet!`);
      setDeptName(''); setShowForm(false);
    } catch (e) { Alert.alert('Feil', 'Kunne ikke lagre.'); } finally { setLoading(false); }
  };

  // listelementer
  const renderListItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={{flex: 1}}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemSub}>{item.avdeling || item.department}</Text>
        {item.email && <Text style={styles.itemDetail}>{item.email}</Text>}
      </View>
      <TouchableOpacity onPress={() => handleDelete(activeTab === 'child' ? 'children' : 'employees', item.id, item.name)}>
        <Ionicons name="trash-outline" size={24} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  // Avdelingsliste med barn og ansatte
  const renderDepartmentItem = ({ item }) => {
    // Filtrer barn og ansatte i denne avdelingen
    const deptChildren = childrenList.filter(c => c.avdeling?.toLowerCase() === item.name.toLowerCase());
    const deptEmployees = employeeList.filter(e => e.department?.toLowerCase() === item.name.toLowerCase());

    return (
      <View style={styles.deptCard}>
        <View style={styles.deptHeader}>
            <Text style={styles.deptTitle}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleDelete('departments', item.id, item.name)}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>

        {/* Ansatte i avdelingen */}
        <Text style={styles.sectionHeaderSmall}>Ansatte ({deptEmployees.length})</Text>
        {deptEmployees.length > 0 ? (
            deptEmployees.map(e => (
                <Text key={e.id} style={styles.subItem}>• {e.name}</Text>
            ))
        ) : <Text style={styles.emptySub}>Ingen ansatte registrert</Text>}

        {/* Barn i avdelingen */}
        <Text style={[styles.sectionHeaderSmall, {marginTop: 10}]}>Barn ({deptChildren.length})</Text>
        {deptChildren.length > 0 ? (
            deptChildren.map(c => (
                <Text key={c.id} style={styles.subItem}>• {c.name}</Text>
            ))
        ) : <Text style={styles.emptySub}>Ingen barn registrert</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <TouchableOpacity onPress={logout}><Ionicons name="log-out-outline" size={24} color="white" /></TouchableOpacity>
      </View>

      {/* faner */}
      <View style={styles.tabContainer}>
        {['child', 'employee', 'department'].map(tab => (
            <TouchableOpacity 
                key={tab} 
                style={[styles.tabButton, activeTab === tab && styles.activeTab]} 
                onPress={() => { setActiveTab(tab); setShowForm(false); }}
            >
                <Ionicons 
                    name={tab === 'child' ? "happy-outline" : tab === 'employee' ? "people-outline" : "business-outline"} 
                    size={20} 
                    color={activeTab === tab ? '#4f46e5' : '#6b7280'} 
                />
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                    {tab === 'child' ? 'Barn' : tab === 'employee' ? 'Ansatte' : 'Avd.'}
                </Text>
            </TouchableOpacity>
        ))}
      </View>

      <View style={{flex: 1, paddingHorizontal: 20}}>
        {!showForm ? (
          <>
            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>
                    {activeTab === 'department' ? 'Avdelingsoversikt' : 
                     activeTab === 'child' ? `Barn (${childrenList.length})` : `Ansatte (${employeeList.length})`}
                </Text>
            </View>
            
            <FlatList
              data={activeTab === 'child' ? childrenList : activeTab === 'employee' ? employeeList : departmentList}
              renderItem={activeTab === 'department' ? renderDepartmentItem : renderListItem}
              keyExtractor={item => item.id}
              contentContainerStyle={{paddingBottom: 80}}
              ListEmptyComponent={<Text style={styles.emptyText}>Ingen data funnet.</Text>}
            />

            <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)}>
                <Ionicons name="add" size={30} color="white" />
                <Text style={styles.fabText}>
                    {activeTab === 'department' ? 'Ny Avdeling' : activeTab === 'child' ? 'Nytt Barn' : 'Ny Ansatt'}
                </Text>
            </TouchableOpacity>
          </>
        ) : (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
            <ScrollView contentContainerStyle={{paddingBottom: 40}}>
              <View style={styles.formHeader}>
                 <TouchableOpacity onPress={() => setShowForm(false)} style={{padding: 10}}>
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                 </TouchableOpacity>
                 <Text style={styles.title}>
                    {activeTab === 'child' ? 'Nytt Barn' : activeTab === 'employee' ? 'Ny Ansatt' : 'Ny Avdeling'}
                 </Text>
              </View>

              {/* skjema avdeling */}
              {activeTab === 'department' && (
                <>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Navn på avdeling</Text>
                        <TextInput style={styles.input} value={deptName} onChangeText={setDeptName} placeholder="F.eks. Måne" />
                    </View>
                    <TouchableOpacity style={[styles.saveBtn, {backgroundColor: '#7c3aed'}]} onPress={handleCreateDepartment} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>OPPRETT AVDELING</Text>}
                    </TouchableOpacity>
                </>
              )}

              {/* skjema barn */}
              {activeTab === 'child' && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Navn</Text>
                    <TextInput style={styles.input} value={childName} onChangeText={setChildName} placeholder="Navn" />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Avdeling</Text>
                    <TextInput style={styles.input} value={childDept} onChangeText={setChildDept} placeholder="Skriv nøyaktig avdelingsnavn" />
                  </View>
                  <View style={styles.divider} />
                  <Text style={styles.label}>Foresatte (E-post)</Text>
                  <View style={styles.row}>
                    <TextInput style={[styles.input, {flex: 1, marginBottom: 0}]} value={emailInput} onChangeText={setEmailInput} placeholder="epost@..." autoCapitalize="none" keyboardType="email-address"/>
                    <TouchableOpacity style={styles.addBtn} onPress={addGuardianEmail}><Ionicons name="add" size={24} color="white" /></TouchableOpacity>
                  </View>
                  <View style={styles.chipContainer}>
                    {guardianEmails.map((e, i) => (
                      <View key={i} style={styles.chip}>
                        <Text style={styles.chipText}>{e}</Text>
                        <TouchableOpacity onPress={() => removeGuardianEmail(e)}><Ionicons name="close-circle" size={18} color="#ef4444" /></TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleCreateChild} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>LAGRE BARN</Text>}
                  </TouchableOpacity>
                </>
              )}

              {/* skjema ansatt */}
              {activeTab === 'employee' && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Navn</Text>
                    <TextInput style={styles.input} value={empName} onChangeText={setEmpName} placeholder="Navn" />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Avdeling</Text>
                    <TextInput style={styles.input} value={empDept} onChangeText={setEmpDept} placeholder="Avdeling" />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>E-post</Text>
                    <TextInput style={styles.input} value={empEmail} onChangeText={setEmpEmail} placeholder="E-post" autoCapitalize="none" keyboardType="email-address" />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Telefon</Text>
                    <TextInput style={styles.input} value={empPhone} onChangeText={setEmpPhone} placeholder="Tlf" keyboardType="phone-pad" />
                  </View>
                  <TouchableOpacity style={[styles.saveBtn, {backgroundColor: '#4338ca'}]} onPress={handleCreateEmployee} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>LAGRE ANSATT</Text>}
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#111827', padding: 20, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  
  tabContainer: { flexDirection: 'row', backgroundColor: 'white', padding: 5, margin: 15, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8 },
  activeTab: { backgroundColor: '#e0e7ff' },
  tabText: { marginLeft: 6, fontWeight: '600', color: '#6b7280', fontSize: 12 },
  activeTabText: { color: '#4f46e5' },

  listHeader: { marginBottom: 10 },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#9ca3af' },
  
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, elevation: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  itemSub: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  itemDetail: { fontSize: 12, color: '#4b5563' },


  deptCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  deptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 8 },
  deptTitle: { fontSize: 18, fontWeight: 'bold', color: '#7c3aed' },
  sectionHeaderSmall: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 },
  subItem: { fontSize: 14, color: '#374151', marginLeft: 8, marginBottom: 2 },
  emptySub: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic', marginLeft: 8 },

  fab: { position: 'absolute', bottom: 30, right: 0, left: 0, backgroundColor: '#4f46e5', marginHorizontal: 60, padding: 16, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, elevation: 5 },
  fabText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },

  formHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginLeft: 10 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  addBtn: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, marginBottom: 24 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  chipText: { color: '#1e40af', marginRight: 6, fontWeight: '500' },
  saveBtn: { backgroundColor: '#059669', padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, elevation: 2 },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});