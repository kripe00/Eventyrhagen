import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
  
  // state for hvilken fane som er aktiv
  const [activeTab, setActiveTab] = useState('child'); 
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null); 

  // state for custom alert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: [] 
  });

  
  const [childrenList, setChildrenList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);

  
  const [childName, setChildName] = useState('');
  const [childDept, setChildDept] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [guardianEmails, setGuardianEmails] = useState([]); 

  const [empName, setEmpName] = useState('');
  const [empDept, setEmpDept] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empEmail, setEmpEmail] = useState('');

  const [deptName, setDeptName] = useState('');

  
  useEffect(() => {
    const unsubChild = onSnapshot(query(collection(db, "children"), orderBy("name")), snap => 
      setChildrenList(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubEmp = onSnapshot(query(collection(db, "employees"), orderBy("name")), snap => 
      setEmployeeList(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubDept = onSnapshot(query(collection(db, "departments"), orderBy("name")), snap => 
      setDepartmentList(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubChild(); unsubEmp(); unsubDept(); };
  }, []);

  
  const showAlert = (title, message, buttons = []) => {
    
    if (buttons.length === 0) {
      buttons = [{ text: "OK", onPress: () => setAlertVisible(false) }];
    }
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  
  const resetForm = () => {
    setChildName(''); setChildDept(''); setGuardianEmails([]); setEmailInput('');
    setEmpName(''); setEmpDept(''); setEmpPhone(''); setEmpEmail('');
    setDeptName('');
    setEditId(null); 
    setShowForm(false);
  };

  
  const handleEdit = (item, type) => {
    setEditId(item.id);
    setActiveTab(type);
    if (type === 'child') {
      setChildName(item.name); setChildDept(item.avdeling); setGuardianEmails(item.guardianEmails || []);
    } else if (type === 'employee') {
      setEmpName(item.name); setEmpDept(item.department); setEmpEmail(item.email); setEmpPhone(item.phone);
    } else if (type === 'department') {
      setDeptName(item.name);
    }
    setShowForm(true);
  };


  const handleDelete = (collectionName, id, name) => {
    showAlert(
      "Slett oppføring",
      `Er du sikker på at du vil slette ${name}?`,
      [
        { text: "Avbryt", style: "cancel", onPress: () => setAlertVisible(false) },
        { 
          text: "Slett", 
          style: "destructive", 
          onPress: async () => {
            try { 
                await deleteDoc(doc(db, collectionName, id)); 
                setAlertVisible(false);
                
            } catch(e) { 
                setAlertVisible(false);
                showAlert("Feil", "Kunne ikke slette: " + e.message);
            }
          }
        }
      ]
    );
  };

  // fjern person fra avdeling
  const removeFromDept = async (type, id, name) => {
    showAlert(
        "Fjern fra avdeling", 
        `Vil du fjerne ${name} fra ${deptName}? (Personen blir ikke slettet fra systemet)`,
        [
            { text: "Avbryt", style: "cancel", onPress: () => setAlertVisible(false) },
            { text: "Fjern", style: "destructive", onPress: async () => {
                try {
                    const collectionName = type === 'child' ? 'children' : 'employees';
                    const fieldName = type === 'child' ? 'avdeling' : 'department';
                    await updateDoc(doc(db, collectionName, id), { [fieldName]: "" });
                    setAlertVisible(false);
                } catch(e) {
                    setAlertVisible(false);
                    showAlert("Feil", "Kunne ikke fjerne: " + e.message);
                }
            }}
        ]
    );
  };

  //lagre barn
  const handleSaveChild = async () => {
    if (!childName || guardianEmails.length === 0) return showAlert('Mangler info', 'Navn og foresatt må fylles ut.');
    setLoading(true);
    try {
      const data = {
        name: childName, avdeling: childDept, guardianEmails, 
        image: `https://api.dicebear.com/7.x/avataaars/png?seed=${childName}`
      };
      
      if (editId) {
        await updateDoc(doc(db, "children", editId), data);
        showAlert('Oppdatert', `${childName} er endret!`, [{ text: "OK", onPress: () => { setAlertVisible(false); resetForm(); }}]);
      } else {
        await addDoc(collection(db, "children"), { ...data, status: 'home', isSick: false, checkInTime: null, createdAt: new Date() });
        showAlert('Suksess', `${childName} lagret!`, [{ text: "OK", onPress: () => { setAlertVisible(false); resetForm(); }}]);
      }
    } catch (e) { showAlert('Feil', 'Kunne ikke lagre.'); } finally { setLoading(false); }
  };

  // lagre ansatt
  const handleSaveEmployee = async () => {
    if (!empName || !empEmail) return showAlert('Mangler info', 'Navn og e-post må fylles ut.');
    setLoading(true);
    try {
      const data = {
        name: empName, department: empDept, email: empEmail.toLowerCase(), phone: empPhone,
        image: `https://api.dicebear.com/7.x/avataaars/png?seed=${empName}`
      };
      if (editId) {
        await updateDoc(doc(db, "employees", editId), data);
        showAlert('Oppdatert', `${empName} er endret!`, [{ text: "OK", onPress: () => { setAlertVisible(false); resetForm(); }}]);
      } else {
        await addDoc(collection(db, "employees"), { ...data, createdAt: new Date() });
        showAlert('Suksess', `${empName} lagret!`, [{ text: "OK", onPress: () => { setAlertVisible(false); resetForm(); }}]);
      }
    } catch (e) { showAlert('Feil', 'Kunne ikke lagre.'); } finally { setLoading(false); }
  };

  // lagre avdeling
  const handleSaveDepartment = async () => {
    if (!deptName) return showAlert('Mangler info', 'Skriv navn.');
    setLoading(true);
    try {
      if (editId) {
        await updateDoc(doc(db, "departments", editId), { name: deptName });
        showAlert('Oppdatert', `Avdeling endret til ${deptName}`, [{ text: "OK", onPress: () => { setAlertVisible(false); resetForm(); }}]);
      } else {
        await addDoc(collection(db, "departments"), { name: deptName, createdAt: new Date() });
        showAlert('Suksess', `Avdeling ${deptName} opprettet!`, [{ text: "OK", onPress: () => { setAlertVisible(false); resetForm(); }}]);
      }
    } catch (e) { showAlert('Feil', 'Kunne ikke lagre.'); } finally { setLoading(false); }
  };

  // legg til foresatt e-post
  const addGuardianEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (email.includes('@') && !guardianEmails.includes(email)) {
      setGuardianEmails([...guardianEmails, email]); setEmailInput('');
    } else { showAlert('Ugyldig', 'Sjekk e-post.'); }
  };
  const removeGuardianEmail = (e) => setGuardianEmails(guardianEmails.filter(x => x !== e));

  // visning av custom alert
  const renderCustomAlert = () => (
    <Modal visible={alertVisible} transparent={true} animationType="fade" onRequestClose={() => setAlertVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>{alertConfig.title}</Text>
                <Text style={styles.modalMessage}>{alertConfig.message}</Text>
                <View style={styles.modalButtons}>
                    {alertConfig.buttons.map((btn, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={[
                                styles.modalBtn, 
                                btn.style === 'cancel' ? styles.modalBtnCancel : 
                                btn.style === 'destructive' ? styles.modalBtnDestructive : styles.modalBtnOk
                            ]}
                            onPress={btn.onPress}
                        >
                            <Text style={[
                                styles.modalBtnText,
                                btn.style === 'cancel' ? {color: '#374151'} : {color: 'white'}
                            ]}>
                                {btn.text}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    </Modal>
  );

  
  const renderListItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={{flex: 1}}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemSub}>{item.avdeling || item.department}</Text>
        {item.email && <Text style={styles.itemDetail}>{item.email}</Text>}
      </View>
      <View style={styles.actionIcons}>
        <TouchableOpacity onPress={() => handleEdit(item, activeTab)} style={{marginRight: 15}}>
            <Ionicons name="pencil" size={24} color="#4f46e5" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(activeTab === 'child' ? 'children' : 'employees', item.id, item.name)}>
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDepartmentItem = ({ item }) => {
    const deptChildren = childrenList.filter(c => c.avdeling?.toLowerCase() === item.name.toLowerCase());
    const deptEmployees = employeeList.filter(e => e.department?.toLowerCase() === item.name.toLowerCase());

    return (
      <View style={styles.deptCard}>
        <View style={styles.deptHeader}>
            <Text style={styles.deptTitle}>{item.name}</Text>
            <View style={styles.actionIcons}>
                <TouchableOpacity onPress={() => handleEdit(item, 'department')} style={{marginRight: 15}}>
                    <Ionicons name="pencil" size={20} color="#4f46e5" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete('departments', item.id, item.name)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
        <Text style={styles.sectionHeaderSmall}>Ansatte ({deptEmployees.length})</Text>
        {deptEmployees.length > 0 ? deptEmployees.map(e => <Text key={e.id} style={styles.subItem}>• {e.name}</Text>) : <Text style={styles.emptySub}>Ingen ansatte</Text>}
        <Text style={[styles.sectionHeaderSmall, {marginTop: 10}]}>Barn ({deptChildren.length})</Text>
        {deptChildren.length > 0 ? deptChildren.map(c => <Text key={c.id} style={styles.subItem}>• {c.name}</Text>) : <Text style={styles.emptySub}>Ingen barn</Text>}
      </View>
    );
  };

  const renderMembersInEdit = () => {
    const linkedChildren = childrenList.filter(c => c.avdeling?.toLowerCase() === deptName.toLowerCase());
    const linkedEmployees = employeeList.filter(e => e.department?.toLowerCase() === deptName.toLowerCase());
    return (
        <View style={{marginTop: 20}}>
            <Text style={[styles.label, {marginBottom: 10}]}>Ansatte i avdelingen:</Text>
            {linkedEmployees.length > 0 ? linkedEmployees.map(e => (
                <View key={e.id} style={styles.linkedItemRow}>
                    <Text style={styles.linkedItemText}>{e.name}</Text>
                    <TouchableOpacity onPress={() => removeFromDept('employee', e.id, e.name)}>
                        <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            )) : <Text style={styles.emptySub}>Ingen</Text>}
            <Text style={[styles.label, {marginTop: 20, marginBottom: 10}]}>Barn i avdelingen:</Text>
            {linkedChildren.length > 0 ? linkedChildren.map(c => (
                <View key={c.id} style={styles.linkedItemRow}>
                    <Text style={styles.linkedItemText}>{c.name}</Text>
                    <TouchableOpacity onPress={() => removeFromDept('child', c.id, c.name)}>
                        <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            )) : <Text style={styles.emptySub}>Ingen</Text>}
        </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <TouchableOpacity onPress={logout}><Ionicons name="log-out-outline" size={24} color="white" /></TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {['child', 'employee', 'department'].map(tab => (
            <TouchableOpacity key={tab} style={[styles.tabButton, activeTab === tab && styles.activeTab]} onPress={() => { setActiveTab(tab); resetForm(); }}>
                <Ionicons name={tab === 'child' ? "happy-outline" : tab === 'employee' ? "people-outline" : "business-outline"} size={20} color={activeTab === tab ? '#4f46e5' : '#6b7280'} />
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab === 'child' ? 'Barn' : tab === 'employee' ? 'Ansatte' : 'Avd.'}</Text>
            </TouchableOpacity>
        ))}
      </View>

      <View style={{flex: 1, paddingHorizontal: 20}}>
        {!showForm ? (
          <>
            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>
                    {activeTab === 'department' ? 'Avdelinger' : activeTab === 'child' ? `Barn (${childrenList.length})` : `Ansatte (${employeeList.length})`}
                </Text>
            </View>
            <FlatList
              data={activeTab === 'child' ? childrenList : activeTab === 'employee' ? employeeList : departmentList}
              renderItem={activeTab === 'department' ? renderDepartmentItem : renderListItem}
              keyExtractor={item => item.id}
              contentContainerStyle={{paddingBottom: 80}}
              ListEmptyComponent={<Text style={styles.emptyText}>Ingen data funnet.</Text>}
            />
            <TouchableOpacity style={styles.fab} onPress={() => { setEditId(null); setShowForm(true); }}>
                <Ionicons name="add" size={30} color="white" />
                <Text style={styles.fabText}>{activeTab === 'department' ? 'Ny Avdeling' : activeTab === 'child' ? 'Nytt Barn' : 'Ny Ansatt'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
            <ScrollView contentContainerStyle={{paddingBottom: 40}}>
              <View style={styles.formHeader}>
                 <TouchableOpacity onPress={resetForm} style={{padding: 10}}>
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                 </TouchableOpacity>
                 <Text style={styles.title}>
                    {editId ? 'Rediger' : 'Ny'} {activeTab === 'child' ? 'Barn' : activeTab === 'employee' ? 'Ansatt' : 'Avdeling'}
                 </Text>
              </View>

              {activeTab === 'department' && (
                <>
                    <View style={styles.formGroup}><Text style={styles.label}>Navn</Text><TextInput style={styles.input} value={deptName} onChangeText={setDeptName} /></View>
                    {editId && renderMembersInEdit()}
                    <TouchableOpacity style={[styles.saveBtn, {backgroundColor: '#7c3aed', marginTop: 30}]} onPress={handleSaveDepartment} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editId ? 'OPPDATER' : 'OPPRETT'} AVDELING</Text>}
                    </TouchableOpacity>
                </>
              )}

              {activeTab === 'child' && (
                <>
                  <View style={styles.formGroup}><Text style={styles.label}>Navn</Text><TextInput style={styles.input} value={childName} onChangeText={setChildName} /></View>
                  <View style={styles.formGroup}><Text style={styles.label}>Avdeling</Text><TextInput style={styles.input} value={childDept} onChangeText={setChildDept} /></View>
                  <View style={styles.divider} />
                  <Text style={styles.label}>Foresatte (E-post)</Text>
                  <View style={styles.row}>
                    <TextInput style={[styles.input, {flex: 1, marginBottom: 0}]} value={emailInput} onChangeText={setEmailInput} autoCapitalize="none" keyboardType="email-address"/>
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
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveChild} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editId ? 'OPPDATER' : 'OPPRETT'} BARN</Text>}
                  </TouchableOpacity>
                </>
              )}

              {activeTab === 'employee' && (
                <>
                  <View style={styles.formGroup}><Text style={styles.label}>Navn</Text><TextInput style={styles.input} value={empName} onChangeText={setEmpName} /></View>
                  <View style={styles.formGroup}><Text style={styles.label}>Avdeling</Text><TextInput style={styles.input} value={empDept} onChangeText={setEmpDept} /></View>
                  <View style={styles.formGroup}><Text style={styles.label}>E-post</Text><TextInput style={styles.input} value={empEmail} onChangeText={setEmpEmail} autoCapitalize="none" keyboardType="email-address" /></View>
                  <View style={styles.formGroup}><Text style={styles.label}>Telefon</Text><TextInput style={styles.input} value={empPhone} onChangeText={setEmpPhone} keyboardType="phone-pad" /></View>
                  <TouchableOpacity style={[styles.saveBtn, {backgroundColor: '#4338ca'}]} onPress={handleSaveEmployee} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editId ? 'OPPDATER' : 'OPPRETT'} ANSATT</Text>}
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>
      
     
      {renderCustomAlert()}

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
  actionIcons: { flexDirection: 'row' },
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
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  linkedItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f3f4f6', padding: 10, borderRadius: 8, marginBottom: 6 },
  linkedItemText: { color: '#374151', fontWeight: '500' },

  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#111827', textAlign: 'center' },
  modalMessage: { fontSize: 16, color: '#4b5563', marginBottom: 20, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'center' },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginHorizontal: 5, minWidth: 100, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#f3f4f6' },
  modalBtnDestructive: { backgroundColor: '#dc2626' },
  modalBtnOk: { backgroundColor: '#4f46e5' },
  modalBtnText: { fontWeight: 'bold' }
});