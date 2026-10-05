import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import useAuth from '../hooks/useAuth';
import useUserPreferences from '../hooks/useUserPreferences';
import { signOutUser } from '../firebase/auth';
import RoleBottomBar from '../components/RoleBottomBar';

export default function SettingsScreen({ navigation }) {
  const { user, profile, role } = useAuth();
  const { preferences, setPreference, syncError } = useUserPreferences();
  const [signingOut, setSigningOut] = useState(false);
  const email = profile?.email || user?.email || 'No email set';

  const signOut = () => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign Out', style: 'destructive', onPress: async () => {
      try {
        setSigningOut(true);
        await signOutUser();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
      catch { Alert.alert('Error', 'Could not sign out. Try again.'); }
      finally { setSigningOut(false); }
    } },
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back"><Ionicons name="arrow-back" size={22} color={colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text><View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>Manage your account and preferences.</Text>
        <SettingsGroup title="ACCOUNT">
          <InfoRow label="Work Email" value={email} />
          <InfoRow label="Department" value={profile?.department || 'Not set'} />
          <InfoRow label="Floor" value={profile?.floor || 'Not set'} last />
        </SettingsGroup>
        <SettingsGroup title="PREFERENCES">
          <SwitchRow label="Push Notifications" value={preferences.pushNotifications} onValueChange={(value) => setPreference('pushNotifications', value)} />
          <SwitchRow label="Email Alerts" value={preferences.emailAlerts} onValueChange={(value) => setPreference('emailAlerts', value)} />
          <SwitchRow label="Dark Mode" value={preferences.darkMode} onValueChange={(value) => setPreference('darkMode', value)} last />
        </SettingsGroup>
        {syncError ? <Text style={styles.syncError}>{syncError}</Text> : null}
        <SettingsGroup title="SECURITY">
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('ForgotPassword', { email })}>
            <View><Text style={styles.rowLabel}>Change Password</Text><Text style={styles.rowHint}>Send a password reset link to your email</Text></View>
            <Ionicons name="chevron-forward" size={17} color={colors.placeholder} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionRow, styles.lastRow]} onPress={signOut} disabled={signingOut}>
            <Text style={[styles.rowLabel, { color: colors.danger }]}>{signingOut ? 'Signing out...' : 'Sign Out'}</Text>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </SettingsGroup>
      </ScrollView>
      <RoleBottomBar role={role} activeTab={role === 'admin' ? 'Overview' : role === 'technician' ? 'Queue' : 'Home'} navigation={navigation} />
    </SafeAreaView>
  );
}

function SettingsGroup({ title, children }) {
  return <View style={styles.group}><Text style={styles.groupTitle}>{title}</Text>{children}</View>;
}
function InfoRow({ label, value, last }) {
  return <View style={[styles.infoRow, last && styles.lastRow]}><View><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value}</Text></View></View>;
}
function SwitchRow({ label, value, onValueChange, last }) {
  return <View style={[styles.actionRow, last && styles.lastRow]}><Text style={styles.rowLabel}>{label}</Text><Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.white} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { width: 36, padding: 4 },
  headerTitle: { flex: 1, fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary, marginLeft: 5 },
  spacer: { width: 36 },
  content: { padding: 16, paddingBottom: 28 },
  intro: { fontSize: typography.size.sm, color: colors.textSecondary, marginBottom: 16 },
  group: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, overflow: 'hidden', marginBottom: 14 },
  groupTitle: { fontSize: 10, fontWeight: typography.weight.bold, color: colors.textSecondary, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#E6EAF0' },
  infoRow: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  actionRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  lastRow: { borderBottomWidth: 0 },
  rowLabel: { fontSize: typography.size.sm, color: colors.textPrimary, fontWeight: typography.weight.medium },
  rowValue: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 3 },
  rowHint: { fontSize: 10, color: colors.textSecondary, marginTop: 3 },
  syncError: { color: colors.danger, fontSize: 10, marginBottom: 10 },
});
