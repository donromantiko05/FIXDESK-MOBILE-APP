import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';
import useTheme from '../contexts/ThemeContext';

export default function StatCard({ label, value, danger, style }) {
  const { colors: themeColors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }, style]}>
      <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: danger ? themeColors.danger : themeColors.textPrimary }]}>
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
