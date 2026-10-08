import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import Button from '../components/Button';
import useTheme from '../contexts/ThemeContext';

export default function TicketSubmittedScreen({ navigation, route }) {
  const { colors: themeColors } = useTheme();
  const ticket = route?.params?.ticket || {
    id: 'temp',
    code: 'TCK-2101',
    title: 'New facilities issue',
    priority: 'medium',
    status: 'assigned',
    category: 'General',
    location: 'Fl. 3, East Wing',
    reporter: 'Maria Reyes (Accounting)',
    filedDate: 'Today',
  };

  const ticketCode = ticket.code || 'TCK-2101';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]}>
      <View style={styles.container}>
        {/* Green Checkmark Circle */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={32} color={themeColors.green} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>Ticket Created</Text>

        {/* Ticket Code */}
        <Text style={styles.code}>{ticketCode}</Text>

        {/* Description */}
        <Text style={[styles.description, { color: themeColors.textSecondary }]}>
          Priority is being evaluated automatically. You'll be notified once a
          technician is assigned.
        </Text>

        {/* Status Badge */}
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Evaluating priority…</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <Button
            title="View Ticket"
            onPress={() =>
              navigation.navigate('Details', { ticket, id: ticket.id })
            }
            style={styles.primaryBtn}
          />
          <Button
            title="Back to Home"
            variant="outline"
            onPress={() => navigation.navigate('Main')}
            style={styles.secondaryBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  code: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    marginBottom: 16,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
    paddingHorizontal: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 36,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
    marginRight: 6,
  },
  statusText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  buttonGroup: {
    width: '100%',
  },
  primaryBtn: {
    marginBottom: 12,
  },
  secondaryBtn: {
    backgroundColor: colors.surface,
  },
});
