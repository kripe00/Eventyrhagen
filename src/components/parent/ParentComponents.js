import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext'; 
import { AppInput } from '../ui/AppInput';   
import { AppButton } from '../ui/AppButton'; 

const styles = StyleSheet.create({
  messageContainer: { marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginLeft: 4 },
  messageCard: { padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1 },
  
  // Endret HeaderRow til space-between for å skille tittel og badge
  msgHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, justifyContent: 'space-between' },
  msgTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 }, // Ny wrapper for ikon+tittel
  
  msgTitle: { fontSize: 16, fontWeight: 'bold' },
  msgContent: { fontSize: 14, lineHeight: 20 },
  msgDate: { fontSize: 12, color: '#9ca3af', marginTop: 8, textAlign: 'right', fontStyle: 'italic' },
  
  // --- NYE STILER FOR LEST/ULEST ---
  newBadge: { backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
  newBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  markReadBtn: { marginTop: 10, alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#e0e7ff', borderRadius: 8 },
  markReadText: { color: '#4f46e5', fontSize: 12, fontWeight: '600' },
  // -------------------------------

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
  modalContent: { padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 }, 
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }
});

// --- MESSAGES SECTION ---
export const MessagesSection = ({ messages, theme, currentUser, onMarkAsRead }) => {
    const [expanded, setExpanded] = useState(false);

    if (!messages || messages.length === 0) return null;

    // FORBEDRET SORTERING
    const sortedMessages = [...messages].sort((a, b) => {
        const aRead = a.readBy?.includes(currentUser?.email);
        const bRead = b.readBy?.includes(currentUser?.email);
        
        // 1. Sorter først på Lest vs Ulest
        if (aRead !== bRead) {
            return aRead ? 1 : -1; // Ulest først
        }

        // 2. Hvis begge er lest (eller begge ulest), behold original rekkefølge (Dato)
        // Original rekkefølge kommer fra Firestore 'orderBy', så vi returnerer 0 for å bevare den.
        return 0; 
    });

    const messagesToShow = expanded ? sortedMessages : sortedMessages.slice(0, 1);
    
    // Tell uleste for headeren
    const unreadCount = messages.filter(m => !m.readBy?.includes(currentUser?.email)).length;

    return (
      <View style={styles.messageContainer}>
        {/* Header */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
             <View style={{flexDirection:'row', alignItems:'center'}}>
                 <Text style={[styles.sectionHeader, { color: theme.text, marginBottom: 0 }]}>
                    Beskjeder
                 </Text>
                 {unreadCount > 0 && (
                     <View style={[styles.newBadge, {marginLeft: 10, backgroundColor: '#d97706'}]}>
                         <Text style={styles.newBadgeText}>{unreadCount} NYE</Text>
                     </View>
                 )}
             </View>
             
             {messages.length > 1 && (
                 <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{padding: 5}}>
                     <Text style={{color: '#4f46e5', fontWeight: '600'}}>
                        {expanded ? 'Vis færre' : 'Vis alle'}
                     </Text>
                 </TouchableOpacity>
             )}
        </View>

        {messagesToShow.map((msg) => {
           const isRead = msg.readBy && msg.readBy.includes(currentUser?.email);

           return (
             <View key={msg.id} style={[
                 styles.messageCard, 
                 { 
                    backgroundColor: isRead ? theme.card : theme.messageCardBg, 
                    borderColor: isRead ? theme.borderColor : theme.messageCardBorder,
                    opacity: isRead ? 0.8 : 1
                 }
             ]}>
               <View style={styles.msgHeaderRow}>
                  <View style={styles.msgTitleRow}>
                    <Ionicons 
                        name={isRead ? "checkmark-circle-outline" : "information-circle"} 
                        size={20} 
                        color={isRead ? theme.subText : "#d97706"} 
                        style={{marginRight: 8}} 
                    />
                    <Text style={[styles.msgTitle, { color: isRead ? theme.subText : theme.messageTitle }]}>
                        {msg.title}
                    </Text>
                  </View>

                  {!isRead && (
                      <View style={styles.newBadge}>
                          <Text style={styles.newBadgeText}>NY</Text>
                      </View>
                  )}
               </View>

              <Text style={[styles.msgContent, { color: theme.messageContent }]}>{msg.content}</Text>
               
              <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end'}}>
                   {!isRead ? (
                       <TouchableOpacity onPress={() => onMarkAsRead(msg.id)} style={styles.markReadBtn}>
                           <Text style={styles.markReadText}>Marker som lest</Text>
                       </TouchableOpacity>
                   ) : (
                       // Bruk en tom View med samme høyde for å unngå hopping i layout
                       <View style={{height: 30}} /> 
                   )}
                   {msg.date && <Text style={styles.msgDate}>{msg.date}</Text>}
              </View>
             </View>
           );
        })}
      </View>
    );
};
// --- CHILD CARD (Uendret) ---
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

// --- SEND MESSAGE MODAL (Uendret) ---
export const SendMessageModal = ({ visible, theme, child, content, setContent, onClose, onSend }) => {
  const { t } = useLanguage();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.modalBg }]}>
                
                <View style={styles.modalHeaderRow}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>
                      {t('modalTitle')} {child?.avdeling}
                    </Text>
                    <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={theme.text} /></TouchableOpacity>
                </View>
                
                <Text style={{marginBottom: 15, color: theme.subText}}>
                  {t('appliesTo')}: {child?.name}
                </Text>
                
                <AppInput 
                    placeholder={t('modalPlaceholder')}
                    multiline 
                    value={content}
                    onChangeText={setContent}
                />
                
                <AppButton 
                    title={t('modalSend')}
                    onPress={onSend} 
                />
                
            </View>
        </KeyboardAvoidingView>
    </Modal>
  );
};