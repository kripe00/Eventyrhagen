import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Imports
import { ChildCard } from '../components/ChildCard';
import { useEmployeeLogic } from '../hooks/useEmployeeLogic';

// Hent de fiksede komponentene
import { CheckInModal, DashboardHeader, FilterBar, InboxModal, MessageModal } from '../components/employee/EmployeeComponents';

// --- Fargepalett (Din original) ---
const Colors = {
  light: {
    background: '#f3f4f6',
    card: 'white',
    text: '#1f2937',
    subText: '#6b7280',
    modalBg: 'white',
    inputBg: '#f3f4f6',
    borderColor: '#e5e7eb',
    filterChip: '#f3f4f6',
    filterText: '#6b7280',
    headerBg: '#312e81'
  },
  dark: {
    background: '#111827',
    card: '#1f2937',
    text: '#f3f4f6',
    subText: '#9ca3af',
    modalBg: '#1f2937',
    inputBg: '#374151',
    borderColor: '#374151',
    filterChip: '#374151',
    filterText: '#d1d5db',
    headerBg: '#1e1b4b' 
  }
};

export default function EmployeeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] || Colors.light;

  // Hent logikk fra hooken
  const {
    children, allChildrenCount, presentCount, inboxMessages, userData,
    filter, setFilter,
    selectedChild, setSelectedChild,
    msgModalVisible, setMsgModalVisible,
    inboxVisible, setInboxVisible,
    loading, msgTitle, setMsgTitle, msgContent, setMsgContent,
    toggleCheckIn, handlePublishMessage, logout
  } = useEmployeeLogic();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.headerBg }} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor={theme.headerBg} />

      {/* 1. Dashboard Header (Med logout og riktige farger) */}
      <DashboardHeader 
        theme={theme}
        department={userData?.department}
        presentCount={presentCount}
        totalCount={allChildrenCount}
        unreadCount={inboxMessages.length}
        onOpenInbox={() => setInboxVisible(true)}
        onOpenMsg={() => setMsgModalVisible(true)}
        onLogout={logout}
      />

      <View style={[styles.mainContent, { backgroundColor: theme.background }]}>
          {/* 2. Filter */}
          <FilterBar 
            theme={theme} 
            filter={filter} 
            setFilter={setFilter} 
          />

          {/* 3. Liste over barn */}
          <FlatList
              data={children}
              renderItem={({ item }) => <ChildCard item={item} onPress={setSelectedChild} />}
              keyExtractor={item => item.id}
              numColumns={3} 
              contentContainerStyle={{ padding: 10 }}
          />
      </View>

      {/* --- MODALER --- */}
      
      <CheckInModal 
        theme={theme}
        visible={!!selectedChild}
        child={selectedChild}
        onClose={() => setSelectedChild(null)}
        onToggle={toggleCheckIn}
      />

      <MessageModal 
        theme={theme}
        visible={msgModalVisible}
        loading={loading}
        title={msgTitle} setTitle={setMsgTitle}
        content={msgContent} setContent={setMsgContent}
        onClose={() => setMsgModalVisible(false)}
        onPublish={handlePublishMessage}
      />

      <InboxModal 
        theme={theme}
        visible={inboxVisible}
        messages={inboxMessages}
        department={userData?.department}
        onClose={() => setInboxVisible(false)}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContent: { flex: 1 },
});