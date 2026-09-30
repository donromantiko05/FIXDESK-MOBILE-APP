import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import Button from '../components/Button';
import { resetPassword } from '../firebase/auth';
 
const RESEND_SECONDS = 30;
 
export default function ResetLinkSentScreen({ navigation, route }) {
  const email = route?.params?.email ?? '';
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
 
  // Countdown before "Resend link" becomes available
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);
 
  const handleResend = async () => {
    if (!email) return;
    try {
      setResending(true);
      await resetPassword(email);
      setSecondsLeft(RESEND_SECONDS);
      Alert.alert('Link sent', `We sent a new reset link to ${email}.`);
    } catch (err) {
      Alert.alert('Could not resend', 'Check your connection and try again.');
    } finally {
      setResending(false);
    }
  };
 
  const canResend = secondsLeft <= 0 && !resending && !!email;
 
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
 
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail-open-outline" size={36} color={colors.primary} />
        </View>
 
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          We sent a password reset link to{'\n'}
          <Text style={styles.email}>{email || 'your work email'}</Text>
        </Text>
 
        <Button
          title="Back to Login"
          onPress={() => navigation.navigate('Login')}
        />
 
        <View style={styles.resendRow}>
          <Text style={styles.hint}>Didn't get the email? </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} accessibilityRole="button">
              <Text style={styles.link}>Resend link</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.hint}>
              {resending ? 'Sending…' : `Resend in ${secondsLeft}s`}
            </Text>
          )}
        </View>
 
        <Text style={styles.note}>Check your spam folder too.</Text>
      </View>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 24, paddingTop: 16 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 80,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.size.sm,
    lineHeight: 21,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  email: {
    color: colors.textPrimary,
    fontWeight: typography.weight.semibold,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  hint: { fontSize: typography.size.xs, color: colors.textSecondary },
  link: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  note: {
    marginTop: 12,
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});