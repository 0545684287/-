import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import axios from 'axios'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function LoginScreen() {
  const [tenantSlug, setTenantSlug] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!tenantSlug || !email || !password) {
      Alert.alert('שגיאה', 'יש למלא את כל השדות')
      return
    }
    setLoading(true)
    try {
      const { data } = await axios.post(`${API_URL}/v1/auth/login`, { tenantSlug, email, password })
      await SecureStore.setItemAsync('accessToken', data.accessToken)
      await SecureStore.setItemAsync('refreshToken', data.refreshToken)
      await SecureStore.setItemAsync('tenantSlug', tenantSlug)
      router.replace('/(tabs)')
    } catch {
      Alert.alert('שגיאה', 'פרטי הכניסה שגויים')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🛡️ SafetyWork</Text>
        <Text style={styles.subtitle}>כניסה למערכת</Text>

        <TextInput style={styles.input} placeholder="שם הארגון" value={tenantSlug}
          onChangeText={setTenantSlug} autoCapitalize="none" textAlign="right" />
        <TextInput style={styles.input} placeholder="אימייל" value={email}
          onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" textAlign="right" />
        <TextInput style={styles.input} placeholder="סיסמה" value={password}
          onChangeText={setPassword} secureTextEntry textAlign="right" />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? '...' : 'כניסה'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4ff', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 28, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, elevation: 4 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, fontSize: 15 },
  button: { backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})
