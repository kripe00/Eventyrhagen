import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../config/firebaseconfig';
import { useAuth } from '../context/Authcontext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true); 

  const { login } = useAuth();

  const handleAuthAction = async () => {
    if(!email || !password) {
        Alert.alert("Feil", "Vennligst fyll ut både e-post og passord");
        return;
    }

    setLoading(true);
    try {
      if (isLoginMode) {
        // logg inn eksisterende bruker
        await login(email, password);
      } else {
        // registrer ny bruker
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("Velkommen!", "Bruker opprettet. Du blir nå logget inn.");
      }
    } catch (error) {
      console.error(error);
      let msg = "Noe gikk galt.";
      if (error.code === 'auth/email-already-in-use') msg = "Denne e-posten er allerede i bruk.";
      if (error.code === 'auth/invalid-email') msg = "Ugyldig e-postadresse.";
      if (error.code === 'auth/weak-password') msg = "Passordet må ha minst 6 tegn.";
      if (error.code === 'auth/invalid-credential') msg = "Feil brukernavn eller passord.";
      
      Alert.alert("Feil", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.card}>
        <Text style={styles.title}>Eventyrhagen</Text>
        <Text style={styles.subtitle}>
            {isLoginMode ? 'Logg inn for å fortsette' : 'Opprett ny brukerkonto'}
        </Text>
        
        <TextInput 
          placeholder="E-post" 
          style={styles.input} 
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput 
          placeholder="Passord" 
          style={styles.input} 
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* knapp med logg inn eller registrer*/}
        <TouchableOpacity style={styles.button} onPress={handleAuthAction} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.btnText}>
                {isLoginMode ? 'Logg Inn' : 'Opprett Bruker'}
            </Text>
          )}
        </TouchableOpacity>

        {/* bytte modus knapp */}
        <TouchableOpacity 
            style={styles.switchButton} 
            onPress={() => setIsLoginMode(!isLoginMode)}
        >
            <Text style={styles.switchText}>
                {isLoginMode ? 'Har du ikke bruker? Registrer deg' : 'Har du allerede bruker? Logg inn'}
            </Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4f46e5', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 24, elevation: 5 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#1f2937' },
  subtitle: { textAlign: 'center', color: '#6b7280', marginBottom: 24 },
  input: { backgroundColor: '#f3f4f6', padding: 16, borderRadius: 12, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  
  switchButton: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#4f46e5', fontWeight: '600' }
});