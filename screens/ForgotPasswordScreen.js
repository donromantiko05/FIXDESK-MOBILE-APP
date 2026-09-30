import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import AppTextInput from '../components/TextInput';
import Button from '../components/Button';
import { resetPassword } from '../firebase/auth';
 
export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
 
  const handleSend = async () => {
    if (loading) return;
 
    const value = email.trim();
    if (!value) {
      setError('Enter your work email.');
      return;
    }
    if (!value.includes('@')) {
      setError('Enter a valid work email.');
      return;
    }
 
    setError('');
    setLoading(true);
    try {
      await resetPassword(value);
      navigation.navigate('ResetLinkSent', { email: value });
    } catch (err) {
      if (err.code === 'auth/invalid-email') {
        setError('Enter a valid work email.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again in a few minutes.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('No connection. Check your internet and try again.');
      } else {
        setError('Could not send the reset link. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.back}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
 
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your work email and we'll send you a reset link.
          </Text>
 
          <AppTextInput
            label="Work Email"
            value={email}
            onChangeText={setEmail}
            placeholder="maria.r@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
 
          {error ? <Text style={styles.error}>{error}</Text> : null}
 
          <Button
            title={loading ? 'Sending…' : 'Send Reset Link'}
            onPress={handleSend}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  back: { alignSelf: 'flex-start', marginBottom: 32 },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  error: {
    color: colors.danger,
    fontSize: typography.size.sm,
    marginBottom: 12,
  },
});