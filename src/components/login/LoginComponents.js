import React from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, StyleSheet, 
    ActivityIndicator, Platform, TouchableWithoutFeedback, Keyboard 
} from 'react-native';

const styles = StyleSheet.create({
  card: { 
    borderRadius: 20, 
    padding: 24, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 10, 
    elevation: 5 
  },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginLeft: 4 },
  input: { 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 16, 
    fontSize: 16, 
    borderWidth: 1 
  },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText: { fontWeight: 'bold', fontSize: 16 },
  switchButton: { marginTop: 20, alignItems: 'center', padding: 10 },
  switchText: { fontWeight: '600' }
});

export const DismissKeyboard = ({ children }) => {
  if (Platform.OS === 'web') return children; 
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {children}
    </TouchableWithoutFeedback>
  );
};

export const LoginCard = ({ 
    theme, email, setEmail, password, setPassword, 
    loading, isLoginMode, setIsLoginMode, onAuthAction 
}) => {
    return (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.title, { color: theme.text }]}>Eventyrhagen</Text>
            <Text style={[styles.subtitle, { color: theme.subText }]}>
                {isLoginMode ? 'Logg inn for å fortsette' : 'Opprett ny brukerkonto'}
            </Text>
            
            <Text style={[styles.label, { color: theme.text }]}>E-post</Text>
            <TextInput 
              placeholder="din@epost.no" 
              placeholderTextColor={theme.subText} 
              style={[styles.input, { 
                  backgroundColor: theme.inputBg, 
                  borderColor: theme.inputBorder, 
                  color: theme.inputText 
              }]} 
              autoCapitalize="none" 
              keyboardType="email-address" 
              value={email} 
              onChangeText={setEmail} 
            />
            
            <Text style={[styles.label, { color: theme.text }]}>Passord</Text>
            <TextInput 
              placeholder="********" 
              placeholderTextColor={theme.subText}
              style={[styles.input, { 
                  backgroundColor: theme.inputBg, 
                  borderColor: theme.inputBorder, 
                  color: theme.inputText 
              }]} 
              secureTextEntry 
              value={password} 
              onChangeText={setPassword} 
            />

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.button }]} 
              onPress={onAuthAction} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                  <Text style={[styles.btnText, { color: theme.buttonText }]}>
                      {isLoginMode ? 'Logg Inn' : 'Opprett Bruker'}
                  </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchButton} onPress={() => setIsLoginMode(!isLoginMode)}>
                <Text style={[styles.switchText, { color: theme.button }]}>
                    {isLoginMode ? 'Har du ikke bruker? Registrer deg' : 'Har du allerede bruker? Logg inn'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};