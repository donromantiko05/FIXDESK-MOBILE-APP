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
import colors from '../constants/colors';
import typography from '../constants/typography';
import departments from '../constants/departments';
import AppTextInput from '../components/TextInput';
import Dropdown from '../components/Dropdown';
import Button from '../components/Button';
import { signUp, getAuthErrorMessage } from '../firebase/auth';
 
export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
 
  const handleCreateAccount = async () => {
    if (loading) return;
    if (
      !fullName.trim() ||
      !email.trim() ||
      !department ||
      !password ||
      !confirmPassword
    ) {
      setError('Fill in all fields.');
      return;
    }
    if (!email.includes('@')) {
      setError('Enter a valid work email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signUp({ fullName, email, department, password });
      navigation.replace('Main');
    } catch (e) {
      setError(getAuthErrorMessage(e));
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
          <View>
            {/* Title */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Get started with corporate facilities support
              </Text>
            </View>
 
            {/* Form */}
            <AppTextInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Maria Rodriguez"
              autoCapitalize="words"
            />
            <AppTextInput
              label="Work Email"
              value={email}
              onChangeText={setEmail}
              placeholder="maria.r@company.com"
              keyboardType="email-address"
            />
            <Dropdown
              label="Department"
              value={department}
              options={departments}
              onSelect={setDepartment}
              placeholder="Select department"
            />
            <AppTextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create password"
              secureTextEntry
            />
            <AppTextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat password"
              secureTextEntry
            />
 
            {error ? <Text style={styles.error}>{error}</Text> : null}
 
            <Button
              title={loading ? 'Creating account...' : 'Create Account'}
              onPress={handleCreateAccount}
              style={styles.submit}
            />
          </View>
 
          {/* Footer link, pinned to the bottom like the design */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  header: { alignItems: 'center', marginBottom: 28 },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    fontSize: typography.size.sm,
    marginBottom: 12,
  },
  submit: { marginTop: 8 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: { fontSize: typography.size.sm, color: colors.textSecondary },
  link: {
    color: colors.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
});