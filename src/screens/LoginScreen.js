import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DismissKeyboard, LoginCard } from '../components/login/LoginComponents';
import { useLoginLogic } from '../hooks/useLoginLogic';

export default function LoginScreen() {
  const {
    email, setEmail,
    password, setPassword,
    loading,
    isLoginMode, setIsLoginMode,
    theme,
    handleAuthAction
  } = useLoginLogic();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <DismissKeyboard>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            <LoginCard 
                theme={theme}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                loading={loading}
                isLoginMode={isLoginMode}
                setIsLoginMode={setIsLoginMode}
                onAuthAction={handleAuthAction}
            />

          </ScrollView>
        </DismissKeyboard>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, 
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
});