import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppInput } from '../ui/AppInput';   // <--- Gjenbruk
import { AppButton } from '../ui/AppButton'; // <--- Gjenbruk

const styles = StyleSheet.create({
  messageContainer: { marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginLeft: 4 },
  messageCard: { padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1 },
  msgHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  msgTitle: { fontSize: 16, fontWeight: 'bold' },
  msgContent: { fontSize: 14, lineHeight: 20 },
  msgDate: { fontSize: 12, color: '#9ca3af', marginTop: 8, textAlign: 'right', fontStyle: 'italic' },
  
  card: { borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#e5e7eb' },
  childName: { fontSize: 24, fontWeight: 'bold' },
  dept: { fontSize: 16 },
  statusBadge: { padding: 10, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  statusText: { fontWeight: 'bold', fontSize: 16 },
  
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  bigBtn: { flex: 1, flexDirection: 'row', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10, shadowColor: '#000', shadowOpacity: 0.1, elevation: 2 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  sickBtn: { padding: 15, borderWidth: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  
  messageBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 }, // Litt mer padding
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }
});

export const MessagesSection = ({ messages, theme }) => {
    if (messages.length === 0) return null;
    return (
      <View style={styles.messageContainer}>
        <Text style={[styles.sectionHeader, { color: theme.text }]}>Beskjeder fra Barnehagen</Text>
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageCard, { backgroundColor: theme.messageCardBg, borderColor: theme.messageCardBorder }]}>
            <View style={styles.msgHeaderRow}>
                <Ionicons name="information-circle" size={20} color="#d97706" style={{marginRight: 8}} />
                <Text style={[styles.msgTitle, { color: theme.messageTitle }]}>{msg.title}</Text>
            </View>
            <Text style={[styles.msgContent, { color: theme.messageContent }]}>{msg.content}</Text>
            {msg.date && <Text style={styles.msgDate}>{msg.date}</Text>}
          </View>
        ))}
      </View>
    );
};

export const ChildCard = ({ item, theme, onToggleStatus, onReportSickness, onOpenMessageModal }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.cardHeader}>
            <Image source={{ uri: item.image }} style={styles.avatar} />
            <View style={{marginLeft: 12}}>
                <Text style={[styles.childName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.dept, { color: theme.subText }]}>{item.avdeling}</Text>
            </View>
        </View>

        <View style={[styles.statusBadge, item.isSick ? {backgroundColor: '#fee2e2'} : item.status === 'present' ? {backgroundColor: '#dcfce7'} : {backgroundColor: '#f3f4f6'}, item.status === 'home' && !item.isSick && {backgroundColor: theme.background}]}>
            <Text style={[styles.statusText, item.isSick && {color:'#991b1b'}, !item.isSick && item.status === 'home' && {color: theme.subText}]}>
                {item.isSick ? 'Meldt fravær' : item.status === 'present' ? 'I Barnehagen' : 'Hjemme'}
            </Text>
        </View>

        <View style={styles.actions}>
            <TouchableOpacity style={[styles.bigBtn, item.isSick ? {backgroundColor: '#d97706'} : item.status === 'home' ? {backgroundColor: '#16a34a'} : {backgroundColor: '#2563eb'}]} onPress={() => onToggleStatus(item)}>
                <Ionicons name={item.status === 'home' ? "log-in-outline" : "log-out-outline"} size={24} color="white" style={{marginRight:8}} />
                <Text style={styles.btnText}>{item.isSick ? 'Friskmeld' : item.status === 'home' ? 'LEVER' : 'HENT'}</Text>
            </TouchableOpacity>
            
            {!item.isSick && item.status === 'home' && (
                <TouchableOpacity style={[styles.sickBtn, { backgroundColor: theme.sickBtn, borderColor: theme.sickBorder }]} onPress={() => onReportSickness(item)}>
                    <Text style={{color: '#dc2626', fontWeight: 'bold'}}>Meld fravær</Text>
                </TouchableOpacity>
            )}
        </View>

        <TouchableOpacity 
            style={[styles.messageBtn, { backgroundColor: theme.msgBtn }]} 
            onPress={() => onOpenMessageModal(item)}
        >
            <Ionicons name="chatbox-ellipses-outline" size={20} color={theme.msgBtnIcon} style={{marginRight: 8}} />
            <Text style={{color: theme.msgBtnText, fontWeight: '600'}}>Send melding til {item.avdeling}</Text>
        </TouchableOpacity>
    </View>
);

export const SendMessageModal = ({ visible, theme, child, content, setContent, onClose, onSend }) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.modalBg }]}>
                
                <View style={styles.modalHeaderRow}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>Melding til {child?.avdeling}</Text>
                    <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={theme.text} /></TouchableOpacity>
                </View>
                
                <Text style={{marginBottom: 15, color: theme.subText}}>Gjelder: {child?.name}</Text>
                
                {/* --- BRUKER NYE KOMPONENTER HER --- */}
                <AppInput 
                    placeholder="Skriv beskjeden din her (f.eks. 'Bestemor henter i dag')..." 
                    multiline 
                    value={content}
                    onChangeText={setContent}
                />
                
                <AppButton 
                    title="SEND MELDING" 
                    onPress={onSend} 
                />
                
            </View>
        </KeyboardAvoidingView>
    </Modal>
);