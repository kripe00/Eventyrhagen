import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/Authcontext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { LANGUAGE_OPTIONS } from '../../utils/translationService';

export const SettingsModal = ({ visible, onClose }) => {
  const { user, updateUserEmail } = useAuth();
  const { theme, mode, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage(); 
  




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
                    {LANGUAGE_OPTIONS.map((opt) => {
                        const isSelected = language === opt.code;
                        return (
                            <TouchableOpacity 
                                key={opt.code} 
                                onPress={() => setLanguage(opt.code)}
                                style={[
                                    styles.langBtn, 
                                    { 
                                       
                                        backgroundColor: isSelected ? theme.tabActive : 'transparent',
                                        borderColor: isSelected ? theme.tabActive : theme.borderColor 
                                    }
                                ]}
                            >
                                <Text style={{
                                
                                    color: isSelected ? (mode === 'light' ? '#4f46e5' : '#ffffff') : theme.text, 
                                    fontWeight: isSelected ? 'bold' : 'normal'
                                }}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
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