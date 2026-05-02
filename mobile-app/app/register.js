import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_BASE_URL } from '@/src/config';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Validation Error", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password
      });

      Alert.alert("Success ✅", "Registration Successful!", [
        { text: "Go to Login", onPress: () => router.replace('/login') }
      ]);

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed.";
      Alert.alert("Registration Error ❌", errorMsg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.innerContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our restaurant system</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput 
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
            </View>

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

            <TouchableOpacity 
              style={[styles.button, loading && { opacity: 0.7 }]} 
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? "Registering..." : "Register"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.link} onPress={() => router.replace('/login')}>
              <Text style={styles.linkText}>Already have an account? Login here</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    borderColor: 'rgba(255, 215, 0, 0.2)', // Subtle yellow border
    marginTop: 50 
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
    elevation: 5
  },
  buttonText: { color: '#000000', fontSize: 18, fontWeight: '800' }, // Black text on yellow
  link: { marginTop: 25, alignItems: 'center' },
  linkText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' } // White link text
});

/**
 * What it does:
 * Allows new users to create an account and join the restaurant system.
 * 
 * Why it's used:
 * 1. To enable registration by providing user details.
 * 2. To redirect the user to the login screen upon successful registration.
 */
