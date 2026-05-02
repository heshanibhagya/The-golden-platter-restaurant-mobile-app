import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_BASE_URL } from '@/src/config';
import { AuthContext } from '../src/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useContext(AuthContext); // Get login function from AuthContext
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email,
        password: password
      });

      if (response.data.token) {
        // Save token using AuthContext
        await login(response.data.token);
        
        console.log("✅ Logged in successfully");

        // Redirect to Dashboard
        Alert.alert("Success", "Login Successful!", [
          { text: "OK", onPress: () => router.replace('/(tabs)/admin-dashboard') }
        ]);
      }
    } catch (error) {
      console.log("Login Error Detail:", error.message);
      const errorMsg = error.response?.data?.message || "Cannot connect to server.";
      Alert.alert("Login Failed", errorMsg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.innerContainer}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Restaurant App</Text>
          <Text style={styles.subtitle}>Login to Your Account</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              style={styles.input}
              placeholder="email@example.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={styles.input}
              placeholder="********"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerLink} 
            onPress={() => router.push('/register')}
          >
            <Text style={styles.registerLinkText}>Don't have an account? Register here</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' }, // Pure black background
  innerContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { 
    backgroundColor: '#1e1e1e', // Dark grey card
    padding: 30, 
    borderRadius: 25, 
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)' // Subtle yellow border
  },
  title: { fontSize: 32, fontWeight: '800', color: '#FFD700', textAlign: 'center' }, // Yellow title
  subtitle: { fontSize: 16, color: '#FFFFFF', textAlign: 'center', marginBottom: 35 }, // White subtitle
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#FFD700', marginBottom: 8 }, // Yellow labels
  input: { 
    backgroundColor: '#2c2c2c', 
    borderWidth: 1, 
    borderColor: '#444', 
    borderRadius: 12, 
    padding: 15, 
    color: '#fff',
    fontSize: 16
  },
  button: { 
    backgroundColor: '#FFD700', // Bright yellow button
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  buttonText: { color: '#000000', fontSize: 18, fontWeight: '800' }, // High contrast black text
  registerLink: { marginTop: 25, alignItems: 'center' },
  registerLinkText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' } // White link text
});

/**
 * What it does:
 * Validates user credentials and retrieves an authentication token.
 * Uses AuthContext to persist the token on the device.
 * 
 * Why it's used:
 * 1. To authenticate the user and grant access to protected areas of the app.
 * 2. To redirect the user to the Dashboard upon successful login.
 */
