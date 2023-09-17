import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import MalKabul from './screens/MalKabul';
import Sevkiyat from './screens/Sevkiyat';
import DepoFisleri from './screens/DepoFisleri';
import Sayim from './screens/Sayim';
import Siparis from './screens/Siparis';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
<NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen options={{headerShown:false}} name="Login" component={LoginScreen} />
        <Stack.Screen name="MainMenuScreen" 
        component={MainMenuScreen} 
        options={{ title: 'Ana Menü' }}
        />
        <Stack.Screen name="MalKabul" 
        component={MalKabul} 
        />
        <Stack.Screen name="Sevkiyat" 
        component={Sevkiyat} 
        />
        <Stack.Screen name="DepoFisleri" 
        component={DepoFisleri} 
        />
        <Stack.Screen name="Sayim" 
        component={Sayim} 
        />
        <Stack.Screen name="Siparis" 
        component={Siparis} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({

});
