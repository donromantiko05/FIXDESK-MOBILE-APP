import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import typography from '../constants/typography';
 
// Placeholder. TODO: list technicians from useTechnicians() once connected.
export default function TechniciansScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Technicians</Text>
      </View>
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No technicians to show yet.</Text>
      </View>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { fontSize: typography.size.sm, color: colors.textSecondary },
});