import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChildCard, MessagesSection, SendMessageModal } from '../components/parent/ParentComponents';
import { useParentLogic } from '../hooks/useParentLogic';

export default function ParentScreen() {
  const {
    children, messages, loading, theme, colorScheme, logout,
    msgModalVisible, setMsgModalVisible,
    msgContent, setMsgContent,
    selectedChild, setSelectedChild,
    handleSendMessage, toggleStatus, reportSickness
  } = useParentLogic();

  if (loading) return (
      <View style={[styles.center, {backgroundColor: theme.background}]}>
          <ActivityIndicator size="large" color="#4f46e5" />
      </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.headerBg }]} edges={['top', 'left', 'right']}>
      <StatusBar style={colorScheme === 'dark' ? "light" : "dark"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.borderColor }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Min Side</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={{marginRight:5, color: theme.text, fontWeight:'500'}}>Logg ut</Text>
            <Ionicons name="log-out-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Hovedinnhold */}
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
                    <MessagesSection messages={messages} theme={theme} />
                    {children.length === 0 && (
                        <View style={styles.center}>
                            <Ionicons name="people-outline" size={60} color="#cbd5e1" />
                            <Text style={{color: '#64748b', fontSize: 16, marginTop: 10}}>Ingen barn funnet</Text>
                        </View>
                    )}
                </>
            }
        />
      </View>

      {/* Modal */}
      <SendMessageModal 
        visible={msgModalVisible}
        theme={theme}
        child={selectedChild}
        content={msgContent}
        setContent={setMsgContent}
        onClose={() => setMsgModalVisible(false)}
        onSend={handleSendMessage}
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