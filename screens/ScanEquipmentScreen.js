import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import colors from '../constants/colors';
import typography from '../constants/typography';
import { PriorityBadge } from '../components/TicketCard';
import { getEquipmentById, normalizeAssetId } from '../firebase/equipment';

export default function ScanEquipmentScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [assetInput, setAssetInput] = useState('');
  const [equipment, setEquipment] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [scanError, setScanError] = useState('');
  const isFocused = useIsFocused();

  const lookupAsset = useCallback(async (value) => {
    const assetId = normalizeAssetId(value);
    if (!assetId) {
      setScanError('Enter or scan an equipment ID.');
      return;
    }
    setAssetInput(assetId);
    setScanning(true);
    setLookingUp(true);
    setScanError('');
    try {
      const found = await getEquipmentById(assetId);
      setEquipment(found);
      if (!found) setScanError('No equipment matched "' + assetId + '". Check the ID or add it from Equipment.');
    } catch {
      setEquipment(null);
      setScanError('Could not load equipment. Check your connection and Firebase access.');
    } finally {
      setLookingUp(false);
    }
  }, []);

  const handleBarcode = useCallback(({ data }) => {
    if (scanning) return;
    lookupAsset(data);
  }, [lookupAsset, scanning]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}><Text style={styles.headerTitle}>Scan Equipment</Text></View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.cameraCard}>
          {!permission ? (
            <View style={styles.cameraPlaceholder}><ActivityIndicator color={colors.white} /></View>
          ) : !permission.granted ? (
            <View style={styles.permissionPrompt}>
              <Ionicons name="camera-outline" size={34} color={colors.white} />
              <Text style={styles.permissionText}>Camera access is needed to scan an equipment label.</Text>
              <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}><Text style={styles.permissionButtonText}>Allow Camera</Text></TouchableOpacity>
            </View>
          ) : isFocused ? (
            <CameraView
              style={styles.camera}
              facing="back"
              active={isFocused}
              barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'code39'] }}
              onBarcodeScanned={scanning ? undefined : handleBarcode}
            >
              <View style={styles.scanOverlay}>
                <View style={styles.scanFrame}><View style={styles.laserLine} /></View>
                <Text style={styles.cameraHint}>Point camera at the equipment QR label.</Text>
              </View>
            </CameraView>
          ) : (
            <View style={styles.cameraPlaceholder}><Text style={styles.cameraHint}>Camera paused</Text></View>
          )}
        </View>

        <View style={styles.manualRow}>
          <TextInput
            value={assetInput}
            onChangeText={setAssetInput}
            style={styles.input}
            placeholder="Equipment ID, e.g. RTU-04"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="characters"
            returnKeyType="search"
            onSubmitEditing={() => lookupAsset(assetInput)}
          />
          <TouchableOpacity style={styles.searchButton} onPress={() => lookupAsset(assetInput)} accessibilityRole="button" accessibilityLabel="Find equipment">
            <Ionicons name="search" size={19} color={colors.white} />
          </TouchableOpacity>
        </View>
        {scanning && <TouchableOpacity style={styles.scanAgain} onPress={() => { setEquipment(null); setScanError(''); setScanning(false); }}><Text style={styles.scanAgainText}>Scan another item</Text></TouchableOpacity>}
        {lookingUp && <ActivityIndicator style={styles.loader} color={colors.primary} />}
        {scanError ? <Text style={styles.error}>{scanError}</Text> : null}

        {equipment && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="qr-code-outline" size={22} color={colors.primary} />
              <View style={styles.cardTitleWrap}><Text style={styles.cardTitle}>{equipment.name}</Text><Text style={styles.assetId}>{equipment.assetId || equipment.id}</Text></View>
            </View>
            <DetailRow label="Location" value={equipment.location || 'Not set'} />
            <DetailRow label="Installed" value={equipment.installed || 'Not set'} />
            <DetailRow label="Status" value={equipment.status || 'unknown'} badge />
            <View style={styles.divider} />
            <Text style={styles.historyTitle}>Maintenance History</Text>
            {(equipment.history || []).length ? equipment.history.map((entry, index) => (
              <Text key={index} style={styles.historyItem}>• {typeof entry === 'string' ? entry : entry.description || entry.title || 'Maintenance record'}</Text>
            )) : <Text style={styles.historyItem}>No maintenance history recorded.</Text>}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, badge }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      {badge ? <PriorityBadge level={value} /> : <Text style={styles.detailValue}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.surface, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.textPrimary },
  content: { paddingBottom: 36 },
  cameraCard: { height: 250, backgroundColor: '#1E2530', overflow: 'hidden' },
  camera: { flex: 1 },
  cameraPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.12)' },
  scanFrame: { width: 180, height: 150, borderRadius: 14, borderWidth: 2, borderColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  laserLine: { width: '90%', height: 2, backgroundColor: colors.green, shadowColor: colors.green, shadowOpacity: 0.8, shadowRadius: 5, elevation: 3 },
  cameraHint: { fontSize: typography.size.xs, color: 'rgba(255,255,255,0.8)', marginTop: 14, textAlign: 'center', paddingHorizontal: 18 },
  permissionPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  permissionText: { color: colors.white, textAlign: 'center', marginTop: 10, fontSize: typography.size.sm },
  permissionButton: { marginTop: 14, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 7, backgroundColor: colors.primary },
  permissionButtonText: { color: colors.white, fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  manualRow: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 14 },
  input: { flex: 1, height: 44, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, color: colors.textPrimary, fontSize: typography.size.sm },
  searchButton: { width: 46, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  scanAgain: { alignSelf: 'center', paddingVertical: 10 },
  scanAgainText: { color: colors.primary, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  loader: { marginTop: 16 },
  error: { marginHorizontal: 16, marginTop: 12, color: colors.danger, fontSize: typography.size.xs },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 16, marginHorizontal: 16, marginTop: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  cardTitleWrap: { flex: 1 },
  cardTitle: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary },
  assetId: { fontSize: typography.size.xs, color: colors.primary, marginTop: 2 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  detailLabel: { fontSize: typography.size.sm, color: colors.textSecondary },
  detailValue: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  historyTitle: { fontSize: typography.size.xs, fontWeight: typography.weight.bold, color: colors.textSecondary, marginBottom: 5 },
  historyItem: { fontSize: typography.size.xs, color: colors.textSecondary, lineHeight: 18 },
});
