import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';
import priority from '../constants/priority';
import status from '../constants/status';
import useTheme from '../contexts/ThemeContext';
 
// One ticket row: title + priority badge, ticket id + status.
// ticket = { id, code, title, priority, status }
export default function TicketCard({ ticket = {}, onPress, accentBorder = false, style }) {
  const { colors: themeColors } = useTheme();
  if (!ticket) return null;
  const p = priority[ticket.priority?.toLowerCase?.()] ?? priority[ticket.priority] ?? priority.medium;
  const s = status[ticket.status?.toLowerCase?.()] ?? status[ticket.status] ?? status.unassigned;
 
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: themeColors.surface, borderColor: themeColors.border },
        accentBorder && { borderLeftWidth: 4, borderLeftColor: p.color },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
    >
      <View style={styles.row}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]} numberOfLines={1}>
          {ticket.title}
        </Text>
        <View style={[styles.badge, { backgroundColor: p.background }]}>
          <View style={[styles.dot, { backgroundColor: p.color }]} />
          <Text style={[styles.badgeText, { color: p.color }]}>{p.label}</Text>
        </View>
      </View>
      <View style={[styles.row, styles.bottom]}>
        <Text style={[styles.code, { color: themeColors.textSecondary }]}>{ticket.code}</Text>
        <View style={styles.statusWrap}>
          <View style={[styles.statusDot, { backgroundColor: s.color }]} />
          <Text style={[styles.status, { color: themeColors.textSecondary }]}>{s.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
 
export function PriorityBadge({ level }) {
  const { colors: themeColors } = useTheme();
  const p = priority[level?.toLowerCase?.()] ?? priority[level] ?? priority.medium;
  return (
    <View style={[styles.badge, { backgroundColor: p.background }]}>
      <View style={[styles.dot, { backgroundColor: p.color }]} />
      <Text style={[styles.badgeText, { color: p.color }]}>{p.label}</Text>
    </View>
  );
}
 
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottom: { marginTop: 8 },
  title: {
    flex: 1,
    marginRight: 8,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  badgeText: { fontSize: 11, fontWeight: typography.weight.semibold },
  code: { fontSize: typography.size.xs, color: colors.textSecondary },
  statusWrap: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  status: { fontSize: typography.size.xs, color: colors.textSecondary },
});
