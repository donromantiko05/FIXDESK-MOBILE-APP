import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import { PriorityBadge } from '../components/TicketCard';

export default function ScanEquipmentScreen({ navigation }) {
  const [equipment] = useState({
    id: 'RTU-04',
    name: 'HVAC Rooftop Unit — RTU-04',
    location: 'Fl. 3, East Wing',
    installed: 'Mar 2022',
    status: 'medium',
    history: [
      '• Filter replaced Jun 14, 2026',
      '• Coolant recharge Jan 30, 2026',
    ],
  });

  const handleManualEntry = () => {
    Alert.prompt
      ? Alert.prompt(
          'Enter Equipment ID',
          'Type the asset ID tag (e.g. RTU-04, SRV-01):',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Search',
              onPress: (id) => {
                if (id) {
                  Alert.alert('Found Asset', `Loaded details for ${id}.`);
                }
              },
            },
          ]
        )
      : Alert.alert(
          'Enter Equipment ID',
          'Asset lookup for RTU-04 loaded below.'
        );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan Equipment</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Dark Camera Viewfinder Box */}
        <View style={styles.viewfinderContainer}>
          <View style={styles.viewfinderFrame}>
            {/* Green horizontal scan laser line */}
            <View style={styles.laserLine} />
          </View>
          <Text style={styles.viewfinderPrompt}>
            Point camera at the equipment QR label.
          </Text>
        </View>

        {/* Enter Equipment ID manually button */}
        <TouchableOpacity
          style={styles.manualBtn}
          onPress={handleManualEntry}
          activeOpacity={0.8}
        >
          <Text style={styles.manualBtnText}>Enter Equipment ID manually</Text>
        </TouchableOpacity>

        {/* Scanned Equipment Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="qr-code-outline" size={22} color={colors.primary} />
            <Text style={styles.cardTitle}>{equipment.name}</Text>
          </View>

          <View style={styles.detailsTable}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{equipment.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Installed</Text>
              <Text style={styles.detailValue}>{equipment.installed}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <PriorityBadge level={equipment.status} />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Maintenance History */}
          <View style={styles.historySection}>
            <Text style={styles.historyHeader}>Maintenance History</Text>
            {equipment.history.map((hist, idx) => (
              <Text key={idx} style={styles.historyItem}>
                {hist}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  content: {
    paddingBottom: 36,
  },
  viewfinderContainer: {
    backgroundColor: '#1E2530',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  viewfinderFrame: {
    width: 156,
    height: 156,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laserLine: {
    width: '90%',
    height: 2,
    backgroundColor: colors.green,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  viewfinderPrompt: {
    fontSize: typography.size.xs,
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 16,
    textAlign: 'center',
  },
  manualBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 14,
  },
  manualBtnText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  cardTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  detailsTable: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  historySection: {
    gap: 4,
  },
  historyHeader: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  historyItem: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
