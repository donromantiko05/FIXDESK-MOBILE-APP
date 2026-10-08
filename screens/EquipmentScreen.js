import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import colors from '../constants/colors';
import useTheme from '../contexts/ThemeContext';
import typography from '../constants/typography';
import { subscribeEquipment, createEquipment } from '../firebase/equipment';
import { PriorityBadge } from '../components/TicketCard';

export default function EquipmentScreen() {
  const { colors: themeColors } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [qrEquipment, setQrEquipment] = useState(null);
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
      const savedEquipment = await createEquipment(form);
      setForm({ assetId: '', name: '', location: '', installed: '', status: 'low' });
      setModalVisible(false);
      setQrEquipment(savedEquipment);
    } catch (e) {
      Alert.alert('Could not save equipment', e?.message || 'Check Firebase access and try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
      <View style={styles.itemHeading}><View style={styles.copy}><Text style={[styles.name, { color: themeColors.textPrimary }]}>{item.name}</Text><Text style={styles.assetId}>{item.assetId || item.id}</Text></View><PriorityBadge level={item.status || 'low'} /></View>
      <Text style={[styles.meta, { color: themeColors.textSecondary }]}>{item.location || 'Location not set'}{item.installed ? ' • Installed ' + item.installed : ''}</Text>
      <TouchableOpacity style={styles.qrButton} onPress={() => setQrEquipment(item)} accessibilityRole="button" accessibilityLabel={'Show QR code for ' + item.name}>
        <Ionicons name="qr-code-outline" size={17} color={themeColors.primary} />
        <Text style={styles.qrButtonText}>Show QR code</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}><Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Equipment</Text><TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)} accessibilityRole="button" accessibilityLabel="Add equipment"><Ionicons name="add" size={22} color={colors.white} /></TouchableOpacity></View>
      {loading ? <ActivityIndicator style={styles.loader} color={themeColors.primary} /> :
        error ? <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>{error}</Text> :
        <FlatList data={items} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={items.length ? styles.list : styles.empty} ListEmptyComponent={<Text style={styles.emptyText}>No equipment yet. Add an asset to make its QR code scannable.</Text>} />}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView style={styles.keyboardAvoider} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" contentContainerStyle={styles.sheetScroll}>
              <View style={[styles.sheet, { backgroundColor: themeColors.surface }]}>
                <Text style={[styles.sheetTitle, { color: themeColors.textPrimary }]}>Add Equipment</Text>
                <FormField colors={themeColors} label="Asset ID" value={form.assetId} onChangeText={(value) => updateField('assetId', value)} placeholder="RTU-04" />
                <FormField colors={themeColors} label="Equipment name" value={form.name} onChangeText={(value) => updateField('name', value)} placeholder="HVAC rooftop unit" />
                <FormField colors={themeColors} label="Location" value={form.location} onChangeText={(value) => updateField('location', value)} placeholder="Fl. 3, East Wing" />
                <FormField colors={themeColors} label="Installed" value={form.installed} onChangeText={(value) => updateField('installed', value)} placeholder="Mar 2022" />
                <View style={styles.actions}><TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancel}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity><TouchableOpacity onPress={save} disabled={saving} style={styles.save}><Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Equipment'}</Text></TouchableOpacity></View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      <Modal visible={Boolean(qrEquipment)} animationType="fade" transparent onRequestClose={() => setQrEquipment(null)}>
        <View style={styles.qrBackdrop}><View style={[styles.qrSheet, { backgroundColor: themeColors.surface }]}>
          <TouchableOpacity style={styles.qrClose} onPress={() => setQrEquipment(null)} accessibilityRole="button" accessibilityLabel="Close QR code">
            <Ionicons name="close" size={22} color={themeColors.textSecondary} />
          </TouchableOpacity>
          {qrEquipment && <>
            <Text style={[styles.qrTitle, { color: themeColors.textPrimary }]}>{qrEquipment.name}</Text>
            <Text style={styles.qrAssetId}>{qrEquipment.assetId || qrEquipment.id}</Text>
            <View style={styles.qrImage}><QRCode value={'fixdesk:' + (qrEquipment.assetId || qrEquipment.id)} size={220} /></View>
            <Text style={[styles.qrHint, { color: themeColors.textSecondary }]}>Scan this code from Scan Equipment to open this asset’s details.</Text>
          </>}
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

function FormField({ label, colors: themeColors, ...props }) {
  return <View style={styles.field}><Text style={[styles.fieldLabel, { color: themeColors.textSecondary }]}>{label}</Text><TextInput style={[styles.input, { backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.textPrimary }]} {...props} autoCapitalize="characters" placeholderTextColor={themeColors.placeholder} /></View>;
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
  qrButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, marginTop: 12, paddingVertical: 4 },
  qrButtonText: { color: colors.primary, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  keyboardAvoider: { flex: 1, justifyContent: 'flex-end' },
  sheetScroll: { flexGrow: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%', backgroundColor: colors.surface, padding: 20, paddingBottom: 28, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  sheetTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.textPrimary, marginBottom: 12 },
  field: { marginBottom: 10 },
  fieldLabel: { fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: colors.textSecondary, marginBottom: 5 },
  input: { height: 42, borderWidth: 1, borderColor: colors.border, borderRadius: 7, paddingHorizontal: 10, fontSize: typography.size.sm, color: colors.textPrimary },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9, marginTop: 8 },
  cancel: { height: 40, justifyContent: 'center', paddingHorizontal: 12 },
  cancelText: { color: colors.textSecondary, fontSize: typography.size.sm },
  save: { height: 40, backgroundColor: colors.primary, paddingHorizontal: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: colors.white, fontSize: typography.size.sm, fontWeight: typography.weight.bold },
  qrBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.55)' },
  qrSheet: { width: '100%', maxWidth: 360, alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 22, borderRadius: 16 },
  qrClose: { position: 'absolute', top: 12, right: 12, zIndex: 1, padding: 4 },
  qrTitle: { marginTop: 8, textAlign: 'center', fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary },
  qrAssetId: { marginTop: 4, textAlign: 'center', fontSize: typography.size.xs, color: colors.primary },
  qrImage: { marginTop: 20, padding: 14, backgroundColor: colors.white, borderRadius: 10 },
  qrHint: { marginTop: 16, textAlign: 'center', fontSize: typography.size.xs, lineHeight: 18, color: colors.textSecondary },
});
