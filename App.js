import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/Authcontext';
import { ThemeProvider } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext'; // <--- NY: Importer LanguageProvider

import AdminScreen from './src/screens/AdminScreen';
import EmployeeScreen from './src/screens/EmployeeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ParentScreen from './src/screens/ParentScreen';
import SplashScreen from './src/screens/SplashScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, role, loading } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);

  if (loading || showSplash) {
    return <SplashScreen onAnimationFinish={() => setShowSplash(false)} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : role === 'admin' ? (
        <Stack.Screen name="AdminHome" component={AdminScreen} />
      ) : role === 'employee' ? (
        <Stack.Screen name="EmployeeHome" component={EmployeeScreen} />
      ) : (
        <Stack.Screen name="ParentHome" component={ParentScreen} />
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          {/* Pakk inn appen i LanguageProvider slik at språkvalg er tilgjengelig overalt */}
          <LanguageProvider> 
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}