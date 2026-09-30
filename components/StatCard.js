import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';

export default function StatCard({ label, value, danger, style }) {
  return (
    <View style={[styles.statCard, style]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, danger && { color: colors.danger }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  statLabel: { fontSize: typography.size.xs, color: colors.textSecondary },
  statValue: {
    marginTop: 4,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
});
