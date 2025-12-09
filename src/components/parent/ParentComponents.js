import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { translateText } from '../../utils/translationService';
import { useLanguage } from '../../context/LanguageContext'; 
import { AppInput } from '../ui/AppInput';   
import { AppButton } from '../ui/AppButton'; 


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
  bgGreen: { backgroundColor: '#dcfce7' },
  bgGray: { backgroundColor: '#f3f4f6' },
  bgRed: { backgroundColor: '#fee2e2' },
  statusText: { fontWeight: 'bold', fontSize: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  bigBtn: { flex: 1, flexDirection: 'row', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10, shadowColor: '#000', shadowOpacity: 0.1, elevation: 2 },
  btnGreen: { backgroundColor: '#16a34a' },
  btnBlue: { backgroundColor: '#2563eb' },
  btnOrange: { backgroundColor: '#d97706' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  sickBtn: { padding: 15, borderWidth: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  messageBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }
});


export const MessagesSection = ({ messages, theme }) => {
  const { language, t } = useLanguage(); 
  const [translations, setTranslations] = useState({});
  const [errorShownByLang, setErrorShownByLang] = useState({});

  useEffect(() => {
    setTranslations({});
    setErrorShownByLang({});
  }, [messages]);

  const triggerTranslate = (msg) => {
    if (language === 'no') return;
    const langMap = translations[language] || {};
    if (langMap[msg.id]) return;

    (async () => {
      const [titleRes, contentRes] = await Promise.all([
        translateText(msg.title, language),
        translateText(msg.content, language),
      ]);

      if ((!titleRes.ok || !contentRes.ok) && !errorShownByLang[language]) {
        setErrorShownByLang((prev) => ({ ...prev, [language]: true }));
      }

      setTranslations((prev) => ({
        ...prev,
        [language]: {
          ...(prev[language] || {}),
          [msg.id]: {
            title: titleRes.text,
            content: contentRes.text,
          },
        },
      }));
    })();
  };

  if (!messages || messages.length === 0) return null;
  const langMap = translations[language] || {};

  return (
    <View style={styles.messageContainer}>
      {/* Bruk t() for overskrifter */}
      <Text style={[styles.sectionHeader, { color: theme.text }]}>
        {t('messagesTitle')}
      </Text>

      {messages.map((msg) => {
        if (language !== 'no' && !langMap[msg.id]) {
          triggerTranslate(msg);
        }
        const tr = langMap[msg.id];
        const titleToShow = language === 'no' || !tr ? msg.title : tr.title;
        const contentToShow = language === 'no' || !tr ? msg.content : tr.content;

        return (
          <View key={msg.id} style={[styles.messageCard, { backgroundColor: theme.messageCardBg, borderColor: theme.messageCardBorder }]}>
            <View style={styles.msgHeaderRow}>
              <Ionicons name="information-circle" size={20} color="#d97706" style={{ marginRight: 8 }} />
              <Text style={[styles.msgTitle, { color: theme.messageTitle }]}>{titleToShow}</Text>
            </View>
            <Text style={[styles.msgContent, { color: theme.messageContent }]}>{contentToShow}</Text>
            {msg.date && <Text style={styles.msgDate}>{msg.date}</Text>}
          </View>
        );
      })}
    </View>
  );
};

export const ChildCard = ({ item, theme, onToggleStatus, onReportSickness, onOpenMessageModal }) => {
  const { t } = useLanguage(); // <--- Hent språk fra context

  const isHome = item.status === 'home';
  const isPresent = item.status === 'present';
  const isSick = item.isSick;

  let statusLabel = t('statusHome');
  if (isSick) statusLabel = t('statusSick');
  else if (isPresent) statusLabel = t('statusPresent');

  let mainBtnLabel = t('deliver');
  if (isSick) mainBtnLabel = t('markRecovered');
  else if (!isHome) mainBtnLabel = t('pickUp');

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.image }} style={styles.avatar} />
        <View style={{ marginLeft: 12 }}>
          <Text style={[styles.childName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.dept, { color: theme.subText }]}>{item.avdeling}</Text>
        </View>
      </View>

      <View style={[styles.statusBadge, isSick ? styles.bgRed : isPresent ? styles.bgGreen : styles.bgGray, isHome && !isSick && { backgroundColor: theme.background }]}>
        <Text style={[styles.statusText, isSick && { color: '#991b1b' }, !isSick && isHome && { color: theme.subText }]}>
          {statusLabel}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.bigBtn, isSick ? styles.btnOrange : isHome ? styles.btnGreen : styles.btnBlue]} onPress={() => onToggleStatus(item)}>
          <Ionicons name={isHome ? 'log-in-outline' : 'log-out-outline'} size={24} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>{mainBtnLabel}</Text>
        </TouchableOpacity>

        {!isSick && isHome && (
          <TouchableOpacity style={[styles.sickBtn, { backgroundColor: theme.sickBtn, borderColor: theme.sickBorder }]} onPress={() => onReportSickness(item)}>
            <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>{t('reportAbsence')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={[styles.messageBtn, { backgroundColor: theme.msgBtn }]} onPress={() => onOpenMessageModal(item)}>
        <Ionicons name="chatbox-ellipses-outline" size={20} color={theme.msgBtnIcon} style={{ marginRight: 8 }} />
        <Text style={{ color: theme.msgBtnText, fontWeight: '600' }}>
          {t('sendMsgToDepartment')} {item.avdeling}
        </Text>
      </TouchableOpacity>
    </View>
  );
};


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