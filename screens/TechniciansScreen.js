import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import typography from '../constants/typography';
import { subscribeTechnicians, updateTechnician } from '../firebase/technicians';

export default function TechniciansScreen() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => subscribeTechnicians(
    (list) => { setTechnicians(list); setLoading(false); setError(''); },
    () => { setLoading(false); setError('Could not load technician accounts. Check Firestore access.'); }
  ), []);

  const setAvailability = async (technician, value) => {
    const availability = value ? 'Available' : 'Busy';
    setTechnicians((current) => current.map((item) => item.id === technician.id ? { ...item, availability } : item));
    try {
      await updateTechnician(technician.id, { availability });
    } catch {
      setTechnicians((current) => current.map((item) => item.id === technician.id ? { ...item, availability: technician.availability || 'Available' } : item));
      Alert.alert('Could not save availability', 'Check Firebase access and try again.');
    }
  };

  const renderTechnician = ({ item }) => {
    const available = (item.availability || 'Available') === 'Available';
    return (
      <View style={styles.card}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(item.fullName || item.email || 'T').slice(0, 1).toUpperCase()}</Text></View>
        <View style={styles.details}>
          <Text style={styles.name}>{item.fullName || 'Technician'}</Text>
          <Text style={styles.email}>{item.email || 'No email on file'}</Text>
          <Text style={[styles.status, available ? styles.available : styles.busy]}>{item.availability || 'Available'}</Text>
        </View>
        <Switch value={available} onValueChange={(value) => setAvailability(item, value)} trackColor={{ false: colors.border, true: colors.green }} thumbColor={colors.white} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}><Text style={styles.headerTitle}>Technicians</Text></View>
      {loading ? <ActivityIndicator style={styles.loader} color={colors.primary} /> :
        error ? <Text style={styles.emptyText}>{error}</Text> :
        <FlatList data={technicians} keyExtractor={(item) => item.id} renderItem={renderTechnician} contentContainerStyle={technicians.length ? styles.list : styles.empty} ListEmptyComponent={<Text style={styles.emptyText}>No technician accounts yet. Set a user's role to technician in their Firebase profile to add them here.</Text>} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.textPrimary },
  loader: { marginTop: 30 },
  list: { padding: 14 },
  empty: { flex: 1, justifyContent: 'center', padding: 24 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, fontSize: typography.size.sm, paddingHorizontal: 24 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14, marginBottom: 9 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E5EAF2', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { color: colors.primary, fontSize: typography.size.md, fontWeight: typography.weight.bold },
  details: { flex: 1 },
  name: { color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.bold },
  email: { color: colors.textSecondary, fontSize: typography.size.xs, marginTop: 2 },
  status: { fontSize: 10, fontWeight: typography.weight.semibold, marginTop: 3 },
  available: { color: colors.green },
  busy: { color: colors.danger },
});
