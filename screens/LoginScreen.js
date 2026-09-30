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
import AppTextInput from '../components/TextInput';
import Button from '../components/Button';
import { signIn, getAuthErrorMessage } from '../firebase/auth';
 
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
 
  const handleSignIn = async () => {
    if (loading) return;
    if (!email.trim() || !password) {
      setError('Enter your work email and password.');
      return;
    }
    if (!email.includes('@')) {
      setError('Enter a valid work email.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { profile } = await signIn(email, password);
      // Temporary check while testing: confirm the role that was read.
      if (__DEV__) console.log('Signed in as', profile.email, 'role:', profile.role);
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
          {/* Logo + title */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>FD</Text>
            </View>
            <Text style={styles.title}>FIXDESK</Text>
            <Text style={styles.subtitle}>Corporate Facilities Maintenance</Text>
          </View>
 
          {/* Form */}
          <AppTextInput
            label="Work Email"
            value={email}
            onChangeText={setEmail}
            placeholder="maria.r@company.com"
            keyboardType="email-address"
          />
          <AppTextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />
 
          <TouchableOpacity
            style={styles.forgot}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.link}>Forgot password?</Text>
          </TouchableOpacity>
 
          {error ? <Text style={styles.error}>{error}</Text> : null}
 
          <Button
            title={loading ? 'Signing in...' : 'Sign In'}
            onPress={handleSignIn}
            style={styles.signIn}
          />
 
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.link}>Sign up</Text>
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
  content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.white,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  title: {
    marginTop: 14,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 6,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  forgot: { alignSelf: 'flex-end', marginBottom: 20 },
  link: {
    color: colors.primary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  error: {
    color: colors.danger,
    fontSize: typography.size.sm,
    marginBottom: 12,
  },
  signIn: { marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: typography.size.xs, color: colors.textSecondary },
});