import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/Authcontext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { AppButton } from './AppButton';
import { AppInput } from './AppInput';


import { LANGUAGE_OPTIONS } from '../../utils/uiTranslations';

export const SettingsModal = ({ visible, onClose }) => {
  const { user, updateUserEmail } = useAuth();
  const { theme, mode, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage(); 
  
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSaveEmail = async () => {
    if (!newEmail.includes('@')) { Alert.alert("Feil", "Ugyldig e-post"); return; }
    setLoading(true);
    try {
        await updateUserEmail(newEmail);
        Alert.alert("Suksess", "E-post oppdatert!", [{ text: "OK", onPress: onClose }]);
    } catch (error) {
        Alert.alert("Feil", error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.card }]}>
          
          <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
            <Text style={[styles.title, { color: theme.text }]}>Innstillinger</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            
            
            <View style={[styles.row, { borderBottomColor: theme.borderColor }]}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Ionicons name="moon-outline" size={20} color={theme.text} style={{marginRight: 10}} />
                    <Text style={[styles.label, { color: theme.text }]}>Mørk modus</Text>
                </View>
                <Switch 
                    value={mode === 'dark'} 
                    onValueChange={toggleTheme}
                    trackColor={{ false: "#767577", true: "#4f46e5" }}
                />
            </View>

           
            <View style={[styles.section, { borderBottomColor: theme.borderColor, borderBottomWidth: 1, paddingBottom: 15 }]}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                    <Ionicons name="language-outline" size={20} color={theme.text} style={{marginRight: 10}} />
                    <Text style={[styles.label, { color: theme.text }]}>Språk / Language</Text>
                </View>
                
                <View style={styles.langGrid}>
                    {LANGUAGE_OPTIONS.map((opt) => (
                        <TouchableOpacity 
                            key={opt.code} 
                            onPress={() => setLanguage(opt.code)}
                            style={[
                                styles.langBtn, 
                                { 
                                    backgroundColor: language === opt.code ? theme.tabActive : 'transparent',
                                    borderColor: theme.borderColor 
                                }
                            ]}
                        >
                            <Text style={{
                                color: theme.text, 
                                fontWeight: language === opt.code ? 'bold' : 'normal'
                            }}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.subText }]}>Brukerkonto</Text>
                <AppInput 
                    label="Endre E-post"
                    value={newEmail}
                    onChangeText={setNewEmail}
                    placeholder="ny@epost.no"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <AppButton 
                    title="Lagre Endringer" 
                    onPress={handleSaveEmail} 
                    loading={loading}
                    style={{marginTop: 5}} 
                />
            </View>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1 },
  title: { fontSize: 20, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 },
  label: { fontSize: 16 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  

  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, minWidth: '30%', alignItems: 'center', justifyContent: 'center' }
});