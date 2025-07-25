import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { signUp } from '../services/firebase';
import * as Font from 'expo-font';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        'Tiny5': require('../../assets/fonts/Tiny5-Regular.ttf'),
      });
      setFontLoaded(true);
    }
    loadFont();
  }, []);

  const handleSignUp = async () => {
    try {
      await signUp(email, password, userName);
      navigation.navigate('Main');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (!fontLoaded) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>U.G.G</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#999"
          value={userName}
          onChangeText={setUserName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 50,
  },
  logo: {
    fontFamily: 'Tiny5',
    fontSize: 72,
    color: 'orange',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 50,
    borderColor: '#7048e8',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: '#2A2A2A',
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#7048e8',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#7048e8',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
});

export default SignUpScreen;