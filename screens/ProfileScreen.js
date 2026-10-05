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

export default function ProfileScreen({ navigation }) {
  const { user, profile, role } = useAuth();
  const { preferences, setPreference, syncError } = useUserPreferences();
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
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        {navigation.canGoBack() ? <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back"><Ionicons name="arrow-back" size={20} color={colors.textPrimary} /></TouchableOpacity> : null}
        <Text style={styles.headerTitle}>Profile & Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <View style={styles.avatar}><Text style={styles.initials}>{initials || 'U'}</Text></View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtitle}>{role === 'admin' ? 'Administrator' : role === 'technician' ? 'Technician' : 'Employee'}{department !== 'Not set' ? `, ${department}` : ''}{floor !== 'Not set' ? ` Fl. ${floorShort}` : ''}</Text>
        </View>
        <View style={styles.group}>
          <Text style={styles.groupTitle}>ACCOUNT DETAILS</Text>
          <ProfileRow label="Work Email" value={email || 'Not set'} onPress={() => navigation.navigate('Settings', { section: 'account' })} />
          <ProfileRow label="Department" value={department} onPress={() => navigation.navigate('Settings', { section: 'account' })} />
          <ProfileRow label="Floor" value={floor} last onPress={() => navigation.navigate('Settings', { section: 'account' })} />
        </View>
        <View style={styles.group}>
          <Text style={styles.groupTitle}>NOTIFICATIONS</Text>
          <ToggleRow label="Push Notifications" value={preferences.pushNotifications} onValueChange={(value) => setPreference('pushNotifications', value)} />
          <ToggleRow label="Email Alerts" value={preferences.emailAlerts} onValueChange={(value) => setPreference('emailAlerts', value)} />
          <ToggleRow label="Dark Mode" value={preferences.darkMode} onValueChange={(value) => setPreference('darkMode', value)} last />
        </View>
        {syncError ? <Text style={styles.syncError}>{syncError}</Text> : null}
        <TouchableOpacity style={styles.signOut} onPress={handleSignOut} disabled={signingOut} accessibilityRole="button">
          <Text style={styles.signOutText}>{signingOut ? 'Signing out...' : 'Sign Out'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsLink} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={16} color={colors.textSecondary} /><Text style={styles.settingsLinkText}>More settings</Text>
        </TouchableOpacity>
      </ScrollView>
      <RoleBottomBar role={role} activeTab={role === 'admin' ? 'Overview' : role === 'technician' ? 'Queue' : 'Home'} navigation={navigation} />
    </SafeAreaView>
  );
}

function ProfileRow({ label, value, last, onPress }) {
  return (
    <TouchableOpacity style={[styles.profileRow, last && styles.lastRow]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowCopy}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue} numberOfLines={1}>{value}</Text></View>
      <Ionicons name="chevron-forward" size={16} color={colors.placeholder} />
    </TouchableOpacity>
  );
}

function ToggleRow({ label, value, onValueChange, last }) {
  return (
    <View style={[styles.toggleRow, last && styles.lastRow]}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, backgroundColor: colors.surface },
  backButton: { padding: 5, marginRight: 7 },
  headerTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.textPrimary },
  content: { paddingHorizontal: 10, paddingBottom: 16 },
  identity: { alignItems: 'center', paddingTop: 10, paddingBottom: 9 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, marginBottom: 6 },
  initials: { color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.bold },
  name: { fontSize: typography.size.xs, color: colors.textPrimary, fontWeight: typography.weight.bold },
  subtitle: { fontSize: 9, color: colors.textSecondary, marginTop: 2 },
  group: { backgroundColor: colors.surface, borderRadius: 7, marginBottom: 9, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  groupTitle: { fontSize: 8, color: colors.textSecondary, fontWeight: typography.weight.bold, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: '#E6EAF0' },
  profileRow: { minHeight: 37, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  lastRow: { borderBottomWidth: 0 },
  rowCopy: { flex: 1 },
  rowLabel: { fontSize: 8, color: colors.textSecondary, marginBottom: 1 },
  rowValue: { fontSize: 9, color: colors.textPrimary, fontWeight: typography.weight.medium },
  toggleRow: { minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 8, paddingRight: 5, borderBottomWidth: 1, borderBottomColor: colors.border },
  toggleLabel: { fontSize: 9, color: colors.textPrimary },
  syncError: { color: colors.danger, fontSize: 10, marginVertical: 3 },
  signOut: { height: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.danger, borderRadius: 6, backgroundColor: colors.surface, marginTop: 1 },
  signOutText: { fontSize: 9, color: colors.danger, fontWeight: typography.weight.semibold },
  settingsLink: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8 },
  settingsLinkText: { fontSize: 9, color: colors.textSecondary },
});
