
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View, Button , Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useLogin from '../../Hooks/useLogin';
import { requestNotificationPermission, getFCMToken } from '../Utils/FirebaseService';
const Login = () => {
  useEffect(() => {
    requestNotificationPermission();
  }, []);
  const navigation:any = useNavigation();
  const {login, loading, error}= useLogin();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async() => {
    const fcmToken = await getFCMToken();
    try {
      const userData= await login(userName, password, fcmToken);
      console.log(userData);
      if(userData){
        navigation.navigate("Call",{userData});
      }
    } catch (err) {
      Alert.alert("Login Failed", error || "Invalid credentials");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});

export default Login;


