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

export default function ProfileScreen({ navigation }) {
  const { user, profile, role } = useAuth();
  const { preferences, setPreference, syncError } = useUserPreferences();
  const { colors: themeColors, setDarkMode } = useTheme();
  const [signingOut, setSigningOut] = useState(false);
  const name = profile?.fullName || user?.displayName || 'Employee';
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  const email = profile?.email || user?.email || '';
  const department = profile?.department || 'Not set';
  const floor = profile?.floor || 'Not set';
  const floorShort = floor.split(/\s+/)[0];

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
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
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        {navigation.canGoBack() ? <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back"><Ionicons name="arrow-back" size={20} color={colors.textPrimary} /></TouchableOpacity> : null}
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Profile & Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <View style={styles.avatar}><Text style={styles.initials}>{initials || 'U'}</Text></View>
          <Text style={[styles.name, { color: themeColors.textPrimary }]}>{name}</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{role === 'admin' ? 'Administrator' : role === 'technician' ? 'Technician' : 'Employee'}{department !== 'Not set' ? `, ${department}` : ''}{floor !== 'Not set' ? ` Fl. ${floorShort}` : ''}</Text>
        </View>
        <View style={[styles.group, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Text style={[styles.groupTitle, { color: themeColors.textSecondary, backgroundColor: themeColors.background }]}>ACCOUNT DETAILS</Text>
          <ProfileRow colors={themeColors} label="Work Email" value={email || 'Not set'} onPress={() => navigation.navigate('Settings', { section: 'account' })} />
          <ProfileRow colors={themeColors} label="Department" value={department} onPress={() => navigation.navigate('Settings', { section: 'account' })} />
          <ProfileRow colors={themeColors} label="Floor" value={floor} last onPress={() => navigation.navigate('Settings', { section: 'account' })} />
        </View>
        <View style={[styles.group, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Text style={[styles.groupTitle, { color: themeColors.textSecondary, backgroundColor: themeColors.background }]}>NOTIFICATIONS</Text>
          <ToggleRow colors={themeColors} label="Push Notifications" value={preferences.pushNotifications} onValueChange={(value) => setPreference('pushNotifications', value)} />
          <ToggleRow colors={themeColors} label="Email Alerts" value={preferences.emailAlerts} onValueChange={(value) => setPreference('emailAlerts', value)} />
          <ToggleRow colors={themeColors} label="Dark Mode" value={preferences.darkMode} onValueChange={setDarkMode} last />
        </View>
        {syncError ? <Text style={[styles.syncError, { color: themeColors.danger }]}>{syncError}</Text> : null}
        <TouchableOpacity style={[styles.signOut, { backgroundColor: themeColors.surface, borderColor: themeColors.danger }]} onPress={handleSignOut} disabled={signingOut} accessibilityRole="button">
          <Text style={[styles.signOutText, { color: themeColors.danger }]}>{signingOut ? 'Signing out...' : 'Sign Out'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsLink} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={16} color={themeColors.textSecondary} /><Text style={[styles.settingsLinkText, { color: themeColors.textSecondary }]}>More settings</Text>
        </TouchableOpacity>
      </ScrollView>
      <RoleBottomBar role={role} activeTab={role === 'admin' ? 'Overview' : role === 'technician' ? 'Queue' : 'Home'} navigation={navigation} />
    </SafeAreaView>
  );
}

function ProfileRow({ label, value, last, onPress, colors: themeColors }) {
  return (
    <TouchableOpacity style={[styles.profileRow, last && styles.lastRow]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowCopy}><Text style={[styles.rowLabel, { color: themeColors.textSecondary }]}>{label}</Text><Text style={[styles.rowValue, { color: themeColors.textPrimary }]} numberOfLines={1}>{value}</Text></View>
      <Ionicons name="chevron-forward" size={16} color={themeColors.placeholder} />
    </TouchableOpacity>
  );
}

function ToggleRow({ label, value, onValueChange, last, colors: themeColors }) {
  return (
    <View style={[styles.toggleRow, last && styles.lastRow]}>
      <Text style={[styles.toggleLabel, { color: themeColors.textPrimary }]}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: themeColors.border, true: themeColors.primary }} thumbColor={themeColors.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { padding: 5, marginRight: 7 },
  headerTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.textPrimary },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  identity: { alignItems: 'center', paddingTop: 18, paddingBottom: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, marginBottom: 8 },
  initials: { color: colors.white, fontSize: typography.size.md, fontWeight: typography.weight.bold },
  name: { fontSize: typography.size.md, color: colors.textPrimary, fontWeight: typography.weight.bold },
  subtitle: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 3, textAlign: 'center' },
  group: { backgroundColor: colors.surface, borderRadius: 10, marginBottom: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  groupTitle: { fontSize: 11, color: colors.textSecondary, fontWeight: typography.weight.bold, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: '#E6EAF0' },
  profileRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  lastRow: { borderBottomWidth: 0 },
  rowCopy: { flex: 1 },
  rowLabel: { fontSize: typography.size.xs, color: colors.textSecondary, marginBottom: 2 },
  rowValue: { fontSize: typography.size.sm, color: colors.textPrimary, fontWeight: typography.weight.medium },
  toggleRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 14, paddingRight: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  toggleLabel: { fontSize: typography.size.sm, color: colors.textPrimary },
  syncError: { color: colors.danger, fontSize: typography.size.xs, marginVertical: 6 },
  signOut: { height: 44, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.danger, borderRadius: 8, backgroundColor: colors.surface, marginTop: 4 },
  signOutText: { fontSize: typography.size.sm, color: colors.danger, fontWeight: typography.weight.semibold },
  settingsLink: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12 },
  settingsLinkText: { fontSize: typography.size.xs, color: colors.textSecondary },
});
