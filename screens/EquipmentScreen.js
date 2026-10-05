import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import { subscribeEquipment, createEquipment } from '../firebase/equipment';
import { PriorityBadge } from '../components/TicketCard';

export default function EquipmentScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ assetId: '', name: '', location: '', installed: '', status: 'low' });

  useEffect(() => subscribeEquipment(
    (list) => { setItems(list); setLoading(false); setError(''); },
    () => { setLoading(false); setError('Could not load equipment. Check Firestore access.'); }
  ), []);

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const save = async () => {
    setSaving(true);
    try {
      await createEquipment(form);
      setForm({ assetId: '', name: '', location: '', installed: '', status: 'low' });
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Could not save equipment', e?.message || 'Check Firebase access and try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.itemHeading}><View style={styles.copy}><Text style={styles.name}>{item.name}</Text><Text style={styles.assetId}>{item.assetId || item.id}</Text></View><PriorityBadge level={item.status || 'low'} /></View>
      <Text style={styles.meta}>{item.location || 'Location not set'}{item.installed ? ' • Installed ' + item.installed : ''}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}><Text style={styles.headerTitle}>Equipment</Text><TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)} accessibilityRole="button" accessibilityLabel="Add equipment"><Ionicons name="add" size={22} color={colors.white} /></TouchableOpacity></View>
      {loading ? <ActivityIndicator style={styles.loader} color={colors.primary} /> :
        error ? <Text style={styles.emptyText}>{error}</Text> :
        <FlatList data={items} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={items.length ? styles.list : styles.empty} ListEmptyComponent={<Text style={styles.emptyText}>No equipment yet. Add an asset to make its QR code scannable.</Text>} />}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.backdrop}><View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Add Equipment</Text>
          <FormField label="Asset ID" value={form.assetId} onChangeText={(value) => updateField('assetId', value)} placeholder="RTU-04" />
          <FormField label="Equipment name" value={form.name} onChangeText={(value) => updateField('name', value)} placeholder="HVAC rooftop unit" />
          <FormField label="Location" value={form.location} onChangeText={(value) => updateField('location', value)} placeholder="Fl. 3, East Wing" />
          <FormField label="Installed" value={form.installed} onChangeText={(value) => updateField('installed', value)} placeholder="Mar 2022" />
          <View style={styles.actions}><TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancel}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity><TouchableOpacity onPress={save} disabled={saving} style={styles.save}><Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Equipment'}</Text></TouchableOpacity></View>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

function FormField({ label, ...props }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput style={styles.input} {...props} autoCapitalize="characters" placeholderTextColor={colors.placeholder} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.textPrimary },
  addButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  loader: { marginTop: 30 },
  list: { padding: 14 },
  empty: { flex: 1, justifyContent: 'center', padding: 24 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, fontSize: typography.size.sm, paddingHorizontal: 24 },
  card: { padding: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 9, marginBottom: 9 },
  itemHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  copy: { flex: 1, marginRight: 10 },
  name: { fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.textPrimary },
  assetId: { fontSize: typography.size.xs, color: colors.primary, marginTop: 3 },
  meta: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 8 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: colors.surface, padding: 20, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  sheetTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.textPrimary, marginBottom: 12 },
  field: { marginBottom: 10 },
  fieldLabel: { fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: colors.textSecondary, marginBottom: 5 },
  input: { height: 42, borderWidth: 1, borderColor: colors.border, borderRadius: 7, paddingHorizontal: 10, fontSize: typography.size.sm, color: colors.textPrimary },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9, marginTop: 8 },
  cancel: { height: 40, justifyContent: 'center', paddingHorizontal: 12 },
  cancelText: { color: colors.textSecondary, fontSize: typography.size.sm },
  save: { height: 40, backgroundColor: colors.primary, paddingHorizontal: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: colors.white, fontSize: typography.size.sm, fontWeight: typography.weight.bold },
});
