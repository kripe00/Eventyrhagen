import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';


import { AuthProvider, useAuth } from './src/context/Authcontext';
import AdminScreen from './src/screens/AdminScreen';
import EmployeeScreen from './src/screens/EmployeeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ParentScreen from './src/screens/ParentScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
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
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}