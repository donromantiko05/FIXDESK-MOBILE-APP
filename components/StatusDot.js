import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';
import statusMap from '../constants/status';
import useTheme from '../contexts/ThemeContext';

export default function StatusDot({ status, showLabel = true }) {
  const { colors: themeColors } = useTheme();
  const s = statusMap[status?.toLowerCase?.()] ?? statusMap[status] ?? statusMap.unassigned;

  return (
    <View style={styles.wrap}>
      <View style={[styles.dot, { backgroundColor: s.color }]} />
      {showLabel ? <Text style={[styles.text, { color: themeColors.textSecondary }]}>{s.label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  text: { fontSize: typography.size.xs, color: colors.textSecondary },
});
