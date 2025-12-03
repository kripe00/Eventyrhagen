import { Ionicons } from '@expo/vector-icons';
import { FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/Authcontext';
import { useAdminLogic } from '../hooks/useAdminLogic';


import AdminDashboard from '../components/admin/AdminDashboard';
import { ChildForm, DepartmentForm, EmployeeForm } from '../components/admin/AdminForms';
import { DepartmentItem, ListItem } from '../components/admin/AdminListItems';

const Colors = {
  light: { 
    background: '#f3f4f6', 
    headerBg: '#1e293b', 
    card: 'white', 
    text: '#1f2937', 
    subText: '#6b7280', 
    borderColor: '#e5e7eb', 
    inputBg: 'white', 
    tabActive: '#e0e7ff', 
    tabText: '#4b5563', 
    linkedItem: '#f3f4f6',
    
    
    statBlue: '#e0e7ff', statBlueText: '#4338ca',
    statGreen: '#dcfce7', statGreenText: '#15803d',
    statRed: '#fee2e2', statRedText: '#991b1b',
    statOrange: '#ffedd5', statOrangeText: '#c2410c',
  },
  dark: { 
    background: '#111827', 
    headerBg: '#0f172a', 
    card: '#1f2937', 
    text: '#f3f4f6', 
    subText: '#9ca3af', 
    borderColor: '#374151', 
    inputBg: '#374151', 
    tabActive: '#374151', 
    tabText: '#d1d5db', 
    linkedItem: '#374151',
    
    
    statBlue: '#1e3a8a', statBlueText: '#bfdbfe',
    statGreen: '#064e3b', statGreenText: '#86efac',
    statRed: '#7f1d1d', statRedText: '#fca5a5',
    statOrange: '#7c2d12', statOrangeText: '#fdba74',
  }
};

export default function AdminScreen() {
  const { logout } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] || Colors.light;

  const {
    childrenList, employeeList, departmentList, loading,
    activeTab, setActiveTab, showForm, setShowForm, editId, setEditId,
    forms, getStats, handleEdit, handleDelete, resetForm,
    handleSaveChild, handleSaveEmployee, handleSaveDepartment,
    addGuardianEmail, removeGuardianEmail, alert
  } = useAdminLogic();

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.headerBg}]} edges={['top']}>
      <StatusBar style="light" />
      
      {/* --- HEADER --- */}
      <View style={[styles.header, {backgroundColor: theme.headerBg}]}>
        <View>
          <Text style={styles.headerTitle}>Barnehage Admin</Text>
          <Text style={styles.headerSubtitle}>Administrasjonspanel</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* --- CONTENT CONTAINER --- */}
      <View style={[styles.contentContainer, {backgroundColor: theme.background}]}>
        
        {/* --- TABS --- */}
        {!showForm && (
          <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 15}}>
              {['dashboard', 'child', 'employee', 'department'].map(tab => {
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity 
                    key={tab} 
                    onPress={() => setActiveTab(tab)} 
                    style={[
                        styles.tab, 
                        { 
                          backgroundColor: isActive ? theme.tabActive : 'transparent',
                          borderColor: isActive ? theme.tabActive : theme.borderColor,
                          borderWidth: 1
                        }
                    ]}
                  >
                    <Text style={[
                        styles.tabText, 
                        { 
                            color: isActive ? (colorScheme === 'dark' ? '#fff' : '#4f46e5') : theme.tabText, 
                            fontWeight: isActive ? '700' : '500' 
                        }
                    ]}>
                      {tab === 'dashboard' ? 'Oversikt' : tab === 'child' ? 'Barn' : tab === 'employee' ? 'Ansatte' : 'Avdelinger'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* --- MAIN CONTENT AREA --- */}
        <View style={{flex: 1, paddingHorizontal: 20}}>
          
          {/* VIEW 1: Dashboard */}
          {activeTab === 'dashboard' && !showForm ? (
            <AdminDashboard stats={getStats()} theme={theme} />
          
          // VIEW 2: Lister
          ) : !showForm ? (
            <>
              <View style={styles.listHeader}>
                  <Text style={[styles.listTitle, {color: theme.text}]}>
                      {activeTab === 'department' ? 'Avdelinger' : activeTab === 'child' ? `Registrerte Barn (${childrenList.length})` : `Ansatte (${employeeList.length})`}
                  </Text>
              </View>

              <FlatList
                data={activeTab === 'child' ? childrenList : activeTab === 'employee' ? employeeList : departmentList}
                renderItem={({ item }) => activeTab === 'department' ? (
                    <DepartmentItem item={item} theme={theme} onEdit={handleEdit} onDelete={handleDelete} childrenList={childrenList} employeeList={employeeList} />
                  ) : (
                    <ListItem item={item} theme={theme} onEdit={handleEdit} onDelete={handleDelete} type={activeTab} />
                  )
                }
                keyExtractor={item => item.id}
                contentContainerStyle={{paddingBottom: 100}}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="file-tray-outline" size={48} color={theme.subText} />
                        <Text style={[styles.emptyText, {color: theme.subText}]}>Ingen oppføringer funnet.</Text>
                    </View>
                }
              />
              
              <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setShowForm(true); setEditId(null); if(activeTab === 'dashboard') setActiveTab('child'); }}>
                  <Ionicons name="add" size={32} color="white" />
              </TouchableOpacity>
            </>
          
          // VIEW 3: Skjemaer
          ) : (
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <View style={[styles.formHeader, { borderBottomColor: theme.borderColor }]}>
                  <TouchableOpacity onPress={resetForm} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                  </TouchableOpacity>
                  <Text style={[styles.formTitle, {color: theme.text}]}>
                    {editId ? 'Rediger' : 'Ny'} {activeTab === 'child' ? 'Barn' : activeTab === 'employee' ? 'Ansatt' : 'Avdeling'}
                  </Text>
                </View>

                {activeTab === 'child' && (
                  <ChildForm 
                    theme={theme} loading={loading} deptList={departmentList} onSubmit={handleSaveChild}
                    name={forms.child.name} setName={forms.child.setName}
                    dept={forms.child.dept} setDept={forms.child.setDept}
                    allergy={forms.child.allergy} setAllergy={forms.child.setAllergy}
                    emailInput={forms.child.emailInput} setEmailInput={forms.child.setEmailInput}
                    emails={forms.child.emails} addEmail={addGuardianEmail} removeEmail={removeGuardianEmail}
                  />
                )}
                {activeTab === 'employee' && (
                  <EmployeeForm 
                    theme={theme} loading={loading} deptList={departmentList} onSubmit={handleSaveEmployee}
                    name={forms.employee.name} setName={forms.employee.setName}
                    dept={forms.employee.dept} setDept={forms.employee.setDept}
                    email={forms.employee.email} setEmail={forms.employee.setEmail}
                    phone={forms.employee.phone} setPhone={forms.employee.setPhone}
                  />
                )}
                {activeTab === 'department' && (
                  <DepartmentForm 
                    theme={theme} loading={loading} onSubmit={handleSaveDepartment}
                    name={forms.department.name} setName={forms.department.setName}
                  />
                )}
              </ScrollView>
            </KeyboardAvoidingView>
          )}
        </View>
      </View>

      {/* --- ALERT MODAL --- */}
      <Modal visible={alert.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={[styles.alertBox, {backgroundColor: theme.card}]}>
                <Text style={[styles.alertTitle, {color: theme.text}]}>{alert.config.title}</Text>
                <Text style={[styles.alertMessage, {color: theme.subText}]}>{alert.config.message}</Text>
                <View style={styles.alertButtonRow}>
                    {alert.config.buttons.map((btn, i) => (
                        <TouchableOpacity key={i} onPress={btn.onPress} style={[styles.alertButton, btn.style === 'destructive' ? styles.btnDestructive : styles.btnNormal]}>
                            <Text style={[styles.alertBtnText, btn.style === 'destructive' ? {color:'white'} : {color: theme.text}]}>{btn.text}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: 'white', letterSpacing: 0.5 },
  headerSubtitle: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },
  logoutButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
  
  contentContainer: { flex: 1, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },

  tabContainer: { paddingVertical: 15, paddingBottom: 5 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10 },
  tabText: { fontSize: 13 },
  
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  listTitle: { fontSize: 18, fontWeight: '700' },
  
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { marginTop: 10, fontSize: 16 },
  
  fab: { position: 'absolute', bottom: 30, right: 10, backgroundColor: '#4f46e5', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: '#4f46e5', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: {width: 0, height: 4}, elevation: 8 },
  
  formHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1 },
  backButton: { marginRight: 15, padding: 5 },
  formTitle: { fontSize: 20, fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { width: '85%', padding: 24, borderRadius: 20, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  alertTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  alertMessage: { fontSize: 15, marginBottom: 24, lineHeight: 22 },
  alertButtonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  alertButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  btnDestructive: { backgroundColor: '#ef4444' },
  btnNormal: { backgroundColor: '#f3f4f6' },
  alertBtnText: { fontWeight: '600', fontSize: 15 }
});