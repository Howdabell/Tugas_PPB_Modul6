import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State untuk ganti mode Login <-> Register
  const [isRegisterMode, setIsRegisterMode] = useState(false); 

  const { login, register, enterAsGuest } = useAuth();

  const handleAuth = async () => {
    // Validasi sederhana
    if (!email || !password) {
      Alert.alert("Error", "Email dan Password wajib diisi");
      return;
    }

    setLoading(true);
    try {
      if (isRegisterMode) {
        // === Mode Daftar ===
        await register(email, password);
        Alert.alert("Sukses", "Akun berhasil dibuat! Anda sudah login.");
      } else {
        // === Mode Login ===
        await login(email, password);
        // Tidak perlu alert sukses, otomatis pindah halaman karena state user berubah
      }
    } catch (error) {
      Alert.alert("Gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        
        <Text style={styles.title}>
          {isRegisterMode ? "Buat Akun Baru" : "IOTWatch Login"}
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Tombol Utama (Login atau Daftar) */}
        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isRegisterMode ? "Daftar Sekarang" : "Masuk"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Tombol Pindah Mode */}
        <TouchableOpacity 
          style={styles.switchButton} 
          onPress={() => setIsRegisterMode(!isRegisterMode)}
        >
          <Text style={styles.switchText}>
            {isRegisterMode 
              ? "Sudah punya akun? Login di sini" 
              : "Belum punya akun? Daftar di sini"}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Tombol Tamu */}
        <TouchableOpacity style={styles.guestButton} onPress={enterAsGuest}>
          <Text style={styles.guestText}>Lanjut sebagai Tamu (Guest)</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#f8f9fb' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 30, 
    textAlign: 'center', 
    color: '#1f2937' 
  },
  input: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#e5e7eb',
    fontSize: 16
  },
  button: { 
    backgroundColor: '#2563eb', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16
  },
  switchButton: {
    marginTop: 15,
    alignItems: 'center',
    padding: 10
  },
  switchText: {
    color: '#2563eb',
    fontWeight: '500'
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 25
  },
  guestButton: { 
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 10
  },
  guestText: { 
    color: '#4b5563', 
    fontWeight: '600'
  },
});