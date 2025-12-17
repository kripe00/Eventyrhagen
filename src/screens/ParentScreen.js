import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useParentLogic } from '../hooks/useParentLogic';
import { MessagesSection, ChildCard, SendMessageModal } from '../components/parent/ParentComponents';
import { SettingsModal } from '../components/ui/SettingsModal';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function ParentScreen() {
  const { theme } = useTheme(); 
  const { t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const {
    children, messages, loading, logout, user,
    msgModalVisible, setMsgModalVisible,
    msgContent, setMsgContent,
    selectedChild, setSelectedChild,
    handleSendMessage, toggleStatus, reportSickness,
    markMessageAsRead, deleteMessage 
  } = useParentLogic();

  if (loading) return (
      <View style={[styles.center, {backgroundColor: theme.background}]}>
          <ActivityIndicator size="large" color="#4f46e5" />
      </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.headerBg }]} edges={['top', 'left', 'right']}>
      <StatusBar style="light" /> 
      
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.headerTitle, { color: theme.headerText }]}>{t('headerTitle')}</Text>
        <View style={{flexDirection: 'row', gap: 15}}>
            <TouchableOpacity onPress={() => setShowSettings(true)}>
                <Ionicons name="settings-outline" size={24} color={theme.headerText} />
            </TouchableOpacity>

            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                <Text style={{marginRight:5, color: theme.headerText, fontWeight:'500'}}>{t('logout')}</Text>
                <Ionicons name="log-out-outline" size={24} color={theme.headerText} />
            </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.mainContent, { backgroundColor: theme.background }]}>
        <FlatList 
            data={children}
            renderItem={({ item }) => (
                 <ChildCard 
                     item={item} 
                     theme={theme} 
                     onToggleStatus={toggleStatus} 
                     onReportSickness={reportSickness} 
                     onOpenMessageModal={(child) => { setSelectedChild(child); setMsgModalVisible(true); }}
                 />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={{padding: 20}}
            ListHeaderComponent={
                <>
                    <MessagesSection 
                        messages={messages} 
                        theme={theme} 
                        currentUser={user}
                        onMarkAsRead={markMessageAsRead}
                        onDelete={deleteMessage} 
                    />
                    
                    {children.length === 0 && (
                        <View style={styles.center}>
                            <Ionicons name="people-outline" size={60} color="#cbd5e1" />
                            <Text style={{color: '#64748b', fontSize: 16, marginTop: 10}}>{t('noChildren')}</Text>
                        </View>
                    )}
                </>
            }
        />
      </View>

      <SendMessageModal 
        visible={msgModalVisible}
        theme={theme}
        child={selectedChild}
        content={msgContent}
        setContent={setMsgContent}
        onClose={() => setMsgModalVisible(false)}
        onSend={handleSendMessage}
      />

      <SettingsModal 
        visible={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainContent: { flex: 1 },
  center: { alignItems: 'center', padding: 20, marginTop: 50 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', padding: 5 },
});