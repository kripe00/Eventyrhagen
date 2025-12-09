import React from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppInput } from '../ui/AppInput';   
import { AppButton } from '../ui/AppButton'; 


const styles = StyleSheet.create({
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  deptHeader: { color: '#fbbf24', fontSize: 16, fontWeight: '600' }, 
  subHeader: { color: '#a5b4fc', fontSize: 12 }, 
  headerBtn: { padding: 5, position: 'relative' },
  notificationDot: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444', zIndex: 10 },
  
  
  filters: { flexDirection: 'row', padding: 10 }, 
  filterChip: { padding: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10 },
  filterText: { fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20, alignItems: 'center' },
  modalContent: { 
    width: '100%', 
    borderRadius: 20, 
    padding: 24, 
    borderWidth: 1,
    shadowColor: '#000', 
    shadowOpacity: 0.25, 
    shadowRadius: 4, 
    elevation: 5 
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  warningBox: { backgroundColor: '#fee2e2', padding: 10, borderRadius: 8, marginBottom: 15, flexDirection:'row', alignItems:'center' },
  warningText: { color: '#991b1b', fontWeight: 'bold', marginLeft: 10 },
  actionBtn: { padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  actionText: { fontWeight: 'bold', fontSize: 18 },

  inboxContainer: { flex: 1, paddingTop: 50 }, 
  inboxHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, alignItems: 'center' },
  inboxTitle: { fontSize: 24, fontWeight: 'bold' },
  inboxCard: { padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, elevation: 1 },
  inboxChildName: { fontSize: 16, fontWeight: 'bold', color: '#4f46e5' },
  inboxContent: { fontSize: 16, marginVertical: 8, lineHeight: 22 },
  inboxFrom: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic' },
  inboxDate: { fontSize: 12, color: '#6b7280' }
});

// DASHBOARD HEADER
export const DashboardHeader = ({ theme, department, presentCount, totalCount, unreadCount, onOpenInbox, onOpenMsg, onLogout }) => (
  <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
      <View>
          <Text style={styles.headerTitle}>Oversikt</Text>
          <Text style={styles.deptHeader}>{department || "Alle avdelinger"}</Text>
          <Text style={styles.subHeader}>Til stede: {presentCount} / {totalCount}</Text>
      </View>
      <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={onOpenInbox} style={styles.headerBtn}>
              {unreadCount > 0 && <View style={styles.notificationDot} />}
              <Ionicons name="mail-outline" size={26} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onOpenMsg} style={[styles.headerBtn, {marginLeft: 10}]}>
              <Ionicons name="megaphone-outline" size={26} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onLogout} style={[styles.headerBtn, {marginLeft: 10}]}>
              <Ionicons name="log-out-outline" size={28} color="white" />
          </TouchableOpacity>
      </View>
  </View>
);

// FILTER BAR 
export const FilterBar = ({ theme, filter, setFilter, sickCount }) => (
  <View style={[styles.filters, { backgroundColor: theme.card }]}>
      {['all', 'present', 'home', 'absence'].map(f => (
          <TouchableOpacity 
            key={f} 
            onPress={() => setFilter(f)} 
            style={[
                styles.filterChip, 
                { backgroundColor: filter === f ? theme.headerBg : theme.filterChip }
            ]}
          >
              <Text style={[
                  styles.filterText, 
                  { color: filter === f ? 'white' : theme.filterText }
              ]}>
                  {f === 'all' ? 'Alle' : 
                   f === 'present' ? 'Til stede' : 
                   f === 'home' ? 'Hjemme' : 
                   `Fravær (${sickCount || 0})`} 
              </Text>
          </TouchableOpacity>
      ))}
  </View>
);

// 3. CHECK-IN MODAL 
export const CheckInModal = ({ theme, visible, child, onClose, onToggle }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.borderColor }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{child?.name}</Text>
              
              {child?.allergy && (
                <View style={styles.warningBox}>
                  <Ionicons name="alert-circle" size={24} color="#dc2626" />
                  <Text style={styles.warningText}>OBS: HAR ALLERGI!</Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={[styles.actionBtn, {backgroundColor: child?.status === 'home' ? '#dcfce7' : '#fee2e2'}]} 
                onPress={() => onToggle(child)}
              >
                  <Ionicons name={child?.status === 'home' ? "log-in-outline" : "log-out-outline"} size={24} color={child?.status === 'home' ? '#166534' : '#991b1b'} style={{marginRight: 8}}/>
                  <Text style={[styles.actionText, {color: child?.status === 'home' ? '#166534' : '#991b1b'}]}>
                    {child?.status === 'home' ? 'Sjekk INN' : 'Sjekk UT'}
                  </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={onClose} style={{marginTop: 20, alignSelf: 'center'}}>
                <Text style={{color: theme.subText}}>Lukk</Text>
              </TouchableOpacity>
          </View>
      </View>
  </Modal>
);

// 4. MESSAGE MODAL
export const MessageModal = ({ theme, visible, loading, title, setTitle, content, setContent, onClose, onPublish }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, {width: '90%', backgroundColor: theme.card, borderColor: theme.borderColor }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Ny fellesbeskjed</Text>
              <AppInput label="Tittel" value={title} onChangeText={setTitle} />
              <AppInput label="Innhold" value={content} onChangeText={setContent} multiline placeholder="Skriv melding her..."/>
              
              <View style={{flexDirection:'row', justifyContent:'space-between', alignItems: 'center', marginTop: 10}}>
                  <TouchableOpacity onPress={onClose} style={{padding:10, marginRight: 10}}>
                    <Text style={{color: theme.subText}}>Avbryt</Text>
                  </TouchableOpacity>
                  <View style={{flex: 1}}>
                    <AppButton title="Publiser" onPress={onPublish} loading={loading} style={{marginTop: 0}} />
                  </View>
              </View>
          </View>
      </KeyboardAvoidingView>
  </Modal>
);

// 5. INBOX MODAL 
export const InboxModal = ({ theme, visible, messages, department, onClose }) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.inboxContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.inboxHeader, { borderColor: theme.borderColor }]}>
              <Text style={[styles.inboxTitle, { color: theme.text }]}>Meldinger til {department}</Text>
              <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={30} color={theme.text} /></TouchableOpacity>
          </View>
          <FlatList 
              data={messages}
              keyExtractor={item => item.id}
              contentContainerStyle={{padding: 20}}
              ListEmptyComponent={<Text style={{textAlign:'center', marginTop:50, color: theme.subText}}>Ingen nye meldinger.</Text>}
              renderItem={({item}) => (
                  <View style={[styles.inboxCard, { backgroundColor: theme.card }]}>
                      <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                          <Text style={styles.inboxChildName}>{item.childName}</Text>
                          <Text style={styles.inboxDate}>{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Nylig'}</Text>
                      </View>
                      <Text style={[styles.inboxContent, { color: theme.text }]}>{item.content}</Text>
                      <Text style={styles.inboxFrom}>Fra: {item.fromEmail}</Text>
                  </View>
              )}
          />
      </View>
  </Modal>
);