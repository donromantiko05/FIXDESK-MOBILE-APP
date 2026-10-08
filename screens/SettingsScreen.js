import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import useAuth from '../hooks/useAuth';
import useUserPreferences from '../hooks/useUserPreferences';
import useTheme from '../contexts/ThemeContext';
import { signOutUser } from '../firebase/auth';
import RoleBottomBar from '../components/RoleBottomBar';

export default function SettingsScreen({ navigation }) {
  const { user, profile, role } = useAuth();
  const { preferences, setPreference, syncError } = useUserPreferences();
  const { colors: themeColors, setDarkMode } = useTheme();
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
    <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back"><Ionicons name="arrow-back" size={22} color={themeColors.textPrimary} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Settings</Text><View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.intro, { color: themeColors.textSecondary }]}>Manage your account and preferences.</Text>
        <SettingsGroup colors={themeColors} title="ACCOUNT">
          <InfoRow colors={themeColors} label="Work Email" value={email} />
          <InfoRow colors={themeColors} label="Department" value={profile?.department || 'Not set'} />
          <InfoRow colors={themeColors} label="Floor" value={profile?.floor || 'Not set'} last />
        </SettingsGroup>
        <SettingsGroup colors={themeColors} title="PREFERENCES">
          <SwitchRow colors={themeColors} label="Push Notifications" value={preferences.pushNotifications} onValueChange={(value) => setPreference('pushNotifications', value)} />
          <SwitchRow colors={themeColors} label="Email Alerts" value={preferences.emailAlerts} onValueChange={(value) => setPreference('emailAlerts', value)} />
          <SwitchRow colors={themeColors} label="Dark Mode" value={preferences.darkMode} onValueChange={setDarkMode} last />
        </SettingsGroup>
        {syncError ? <Text style={styles.syncError}>{syncError}</Text> : null}
        <SettingsGroup colors={themeColors} title="SECURITY">
          <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('ForgotPassword', { email })}>
            <View><Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>Change Password</Text><Text style={[styles.rowHint, { color: themeColors.textSecondary }]}>Send a password reset link to your email</Text></View>
            <Ionicons name="chevron-forward" size={17} color={themeColors.placeholder} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionRow, styles.lastRow]} onPress={signOut} disabled={signingOut}>
            <Text style={[styles.rowLabel, { color: colors.danger }]}>{signingOut ? 'Signing out...' : 'Sign Out'}</Text>
            <Ionicons name="log-out-outline" size={18} color={themeColors.danger} />
          </TouchableOpacity>
        </SettingsGroup>
      </ScrollView>
      <RoleBottomBar role={role} activeTab={role === 'admin' ? 'Overview' : role === 'technician' ? 'Queue' : 'Home'} navigation={navigation} />
    </SafeAreaView>
  );
}

function SettingsGroup({ title, children, colors: themeColors }) {
  return <View style={[styles.group, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}><Text style={[styles.groupTitle, { backgroundColor: themeColors.background, color: themeColors.textSecondary }]}>{title}</Text>{children}</View>;
}
function InfoRow({ label, value, last, colors: themeColors }) {
  return <View style={[styles.infoRow, last && styles.lastRow]}><View><Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>{label}</Text><Text style={[styles.rowValue, { color: themeColors.textSecondary }]}>{value}</Text></View></View>;
}
function SwitchRow({ label, value, onValueChange, last, colors: themeColors }) {
  return <View style={[styles.actionRow, last && styles.lastRow]}><Text style={[styles.rowLabel, { color: themeColors.textPrimary }]}>{label}</Text><Switch value={value} onValueChange={onValueChange} trackColor={{ false: themeColors.border, true: themeColors.primary }} thumbColor={themeColors.white} /></View>;
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
  groupTitle: { fontSize: typography.size.xs, fontWeight: typography.weight.bold, color: colors.textSecondary, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#E6EAF0' },
  infoRow: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  actionRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  lastRow: { borderBottomWidth: 0 },
  rowLabel: { fontSize: typography.size.sm, color: colors.textPrimary, fontWeight: typography.weight.medium },
  rowValue: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 3 },
  rowHint: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 4 },
  syncError: { color: colors.danger, fontSize: typography.size.xs, marginBottom: 10 },
});
