import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';

import { t, translateText } from '../../utils/translationService';
import { AppButton } from '../ui/AppButton';
import { AppInput } from '../ui/AppInput';

const styles = StyleSheet.create({
  messageContainer: { marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginLeft: 4 },
  messageCard: { padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1 },
  msgHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, justifyContent: 'space-between' },
  msgTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 }, 
  msgTitle: { fontSize: 16, fontWeight: 'bold' },
  msgContent: { fontSize: 14, lineHeight: 20 },
  msgDate: { fontSize: 12, color: '#9ca3af', marginTop: 8, textAlign: 'right', fontStyle: 'italic' },
  
  newBadge: { backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 8 },
  newBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  markReadBtn: { marginTop: 10, alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#e0e7ff', borderRadius: 8 },
  markReadText: { color: '#4f46e5', fontSize: 12, fontWeight: '600' },

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

// --- MESSAGES SECTION  ---
export const MessagesSection = ({ messages, theme, currentUser, onMarkAsRead, onDelete }) => {
    const { language } = useLanguage(); 
    const [expanded, setExpanded] = useState(false);
    const [translatedMessages, setTranslatedMessages] = useState([]);

    useEffect(() => {
        const performTranslation = async () => {
            if (language === 'no') {
                setTranslatedMessages(messages);
                return;
            }
            const translated = await Promise.all(messages.map(async (msg) => {
                const newTitle = await translateText(msg.title, language);
                const newContent = await translateText(msg.content, language);
                return {
                    ...msg,
                    title: newTitle.text || msg.title,    
                    content: newContent.text || msg.content
                };
            }));
            setTranslatedMessages(translated);
        };
        performTranslation();
    }, [messages, language]); 

    if (!messages || messages.length === 0) return null;

    const displayList = translatedMessages.length > 0 ? translatedMessages : messages;
    const sortedMessages = [...displayList].sort((a, b) => {
        const aRead = a.readBy?.includes(currentUser?.email);
        const bRead = b.readBy?.includes(currentUser?.email);
        if (!!aRead !== !!bRead) return aRead ? 1 : -1;
        return 0;
    });

    const messagesToShow = expanded ? sortedMessages : sortedMessages.slice(0, 1);
    const unreadCount = messages.filter(m => !m.readBy?.includes(currentUser?.email)).length;

    return (
      <View style={styles.messageContainer}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
             <View style={{flexDirection:'row', alignItems:'center'}}>
                 <Text style={[styles.sectionHeader, { color: theme.text, marginBottom: 0 }]}>
                    {t(language, 'messagesTitle')}
                 </Text>
                 {unreadCount > 0 && (
                     <View style={[styles.newBadge, {marginLeft: 10, backgroundColor: '#d97706'}]}>
                         <Text style={styles.newBadgeText}>{unreadCount} {t(language, 'newBadge')}</Text>
                     </View>
                 )}
             </View>
             
             {messages.length > 1 && (
                 <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{padding: 5}}>
                     <Text style={{color: '#4f46e5', fontWeight: '600'}}>
                        {expanded ? t(language, 'showLess') : t(language, 'showMore')}
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
                    opacity: isRead ? 0.7 : 1
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
                          <Text style={styles.newBadgeText}>{t(language, 'newBadge')}</Text>
                      </View>
                  )}
               </View>

              <Text style={[styles.msgContent, { color: theme.messageContent }]}>{msg.content}</Text>
               
              <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end'}}>
                   <View style={{flexDirection: 'row', alignItems: 'center'}}>
                       {!isRead ? (
                           <TouchableOpacity onPress={() => onMarkAsRead(msg.id)} style={styles.markReadBtn}>
                               <Text style={styles.markReadText}>{t(language, 'markRead')}</Text>
                           </TouchableOpacity>
                       ) : (
                          
                           <View style={{height: 30}} /> 
                       )}

                       
                       <TouchableOpacity onPress={() => onDelete(msg.id)} style={{marginLeft: 15, padding: 5}}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                       </TouchableOpacity>
                   </View>
                   
                   {msg.date && <Text style={styles.msgDate}>{msg.date}</Text>}
              </View>
             </View>
           );
        })}
      </View>
    );
};

// --- CHILD CARD  ---
export const ChildCard = ({ item, theme, onToggleStatus, onReportSickness, onOpenMessageModal }) => {
    const { language } = useLanguage(); 

    const isHome = item.status === 'home';
    const isPresent = item.status === 'present';
    const isSick = item.isSick;

    let statusLabel = t(language, 'statusHome');
    if (isSick) statusLabel = t(language, 'statusSick');
    else if (isPresent) statusLabel = t(language, 'statusPresent');

    let mainBtnLabel = t(language, 'deliver');
    if (isSick) mainBtnLabel = t(language, 'markRecovered');
    else if (!isHome) mainBtnLabel = t(language, 'pickUp');

    return (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.cardHeader}>
            <Image source={{ uri: item.image }} style={styles.avatar} />
            <View style={{marginLeft: 12}}>
                <Text style={[styles.childName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.dept, { color: theme.subText }]}>{item.avdeling}</Text>
            </View>
            </View>

        <View style={[styles.statusBadge, isSick ? {backgroundColor: '#fee2e2'} : isPresent ? {backgroundColor: '#dcfce7'} : {backgroundColor: '#f3f4f6'}, isHome && !isSick && {backgroundColor: theme.background}]}>
            <Text style={[styles.statusText, isSick && {color:'#991b1b'}, !isSick && isHome && {color: theme.subText}]}>
                {statusLabel}
            </Text>
        </View>

        <View style={styles.actions}>
            <TouchableOpacity style={[styles.bigBtn, isSick ? {backgroundColor: '#d97706'} : isHome ? {backgroundColor: '#16a34a'} : {backgroundColor: '#2563eb'}]} onPress={() => onToggleStatus(item)}>
                <Ionicons name={isHome ? "log-in-outline" : "log-out-outline"} size={24} color="white" style={{marginRight:8}} />
                <Text style={styles.btnText}>{mainBtnLabel}</Text>
            </TouchableOpacity>
            
            {!isSick && isHome && (
                <TouchableOpacity style={[styles.sickBtn, { backgroundColor: theme.sickBtn, borderColor: theme.sickBorder }]} onPress={() => onReportSickness(item)}>
                    <Text style={{color: '#dc2626', fontWeight: 'bold'}}>{t(language, 'reportAbsence')}</Text>
                </TouchableOpacity>
            )}
        </View>

        <TouchableOpacity 
            style={[styles.messageBtn, { backgroundColor: theme.msgBtn }]} 
            onPress={() => onOpenMessageModal(item)}
        >
            <Ionicons name="chatbox-ellipses-outline" size={20} color={theme.msgBtnIcon} style={{marginRight: 8}} />
            <Text style={{color: theme.msgBtnText, fontWeight: '600'}}>{t(language, 'sendMsgToDepartment')} {item.avdeling}</Text>
        </TouchableOpacity>
        </View>
    );
};

// --- SEND MESSAGE MODAL ---
export const SendMessageModal = ({ visible, theme, child, content, setContent, onClose, onSend }) => {
  const { language } = useLanguage(); 

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.modalBg }]}>
                
                <View style={styles.modalHeaderRow}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>
                      {t(language, 'modalTitle')} {child?.avdeling}
                    </Text>
                    <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={theme.text} /></TouchableOpacity>
                </View>
                
                <Text style={{marginBottom: 15, color: theme.subText}}>
                  {t(language, 'appliesTo')}: {child?.name}
                </Text>
                
                <AppInput 
                    placeholder={t(language, 'modalPlaceholder')}
                    multiline 
                    value={content}
                    onChangeText={setContent}
                />
                
                <AppButton 
                    title={t(language, 'modalSend')}
                    onPress={onSend} 
                />
                
            </View>
        </KeyboardAvoidingView>
    </Modal>
  );
};