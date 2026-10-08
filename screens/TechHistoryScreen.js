import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import useTheme from '../contexts/ThemeContext';
import typography from '../constants/typography';
import { PriorityBadge } from '../components/TicketCard';

export default function TechHistoryScreen({ navigation, route }) {
  const { colors: themeColors } = useTheme();
  const paramTicket = route?.params?.ticket;

  const [ticket] = useState(
    paramTicket || {
      code: 'TCK-2091',
      title: 'AC not cooling — Fl. 3 east...',
      priority: 'high',
      filedDate: 'Sep 9, 2026',
      category: 'HVAC',
      location: 'Fl. 3, East Wing',
      technician: 'James Cruz',
    }
  );

  const statusSteps = [
    { label: 'Reported', state: 'completed' },
    { label: 'Priority Set', state: 'completed' },
    { label: 'Technician Assigned', state: 'completed' },
    { label: 'Accepted', state: 'completed' },
    { label: 'Repair In Progress (Current)', state: 'current' },
    { label: 'Completed', state: 'pending' },
  ];

  const activities = [
    '• James Cruz accepted ticket — 2 hrs ago',
    '• Repair started — 1 hr ago',
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Ticket Detail</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Ticket Summary Card */}
        <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <View style={styles.cardTopRow}>
              <Text style={[styles.ticketTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
              {ticket.title || 'AC not cooling — Fl. 3 east...'}
            </Text>
            <PriorityBadge level={ticket.priority || 'high'} />
          </View>

          <View style={styles.cardCodeRow}>
            <Text style={[styles.ticketCode, { color: themeColors.primary }]}>{ticket.code || 'TCK-2091'}</Text>
            <Text style={[styles.filedDate, { color: themeColors.textSecondary }]}>
              Filed {ticket.filedDate || 'Sep 9, 2026'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <View style={styles.metaTable}>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Category</Text>
              <Text style={[styles.metaValue, { color: themeColors.textPrimary }]}>{ticket.category || 'HVAC'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Location</Text>
              <Text style={[styles.metaValue, { color: themeColors.textPrimary }]}>
                {ticket.location || 'Fl. 3, East Wing'}
              </Text>
            </View>
            {ticket.equipmentName ? <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Equipment</Text>
              <Text style={[styles.metaValue, { color: themeColors.textPrimary }]}>{ticket.equipmentName}</Text>
            </View> : null}
            {ticket.equipmentId ? <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Asset ID</Text>
              <Text style={[styles.metaValue, { color: themeColors.textPrimary }]}>{ticket.equipmentId}</Text>
            </View> : null}
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: themeColors.textSecondary }]}>Assigned Technician</Text>
              <Text style={[styles.metaValue, { color: themeColors.textPrimary }]}>
                {ticket.assignedTechnician || ticket.technician || 'Not assigned'}
              </Text>
            </View>
          </View>
          {ticket.description ? <View style={{ marginTop: 14 }}>
            <Text style={[styles.metaLabel, { color: themeColors.textSecondary, marginBottom: 5 }]}>Problem Description</Text>
            <Text style={[styles.metaValue, { color: themeColors.textPrimary, textAlign: 'left' }]}>{ticket.description}</Text>
          </View> : null}
        </View>

        {/* Ticket Status Card */}
        <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Ticket Status</Text>
          <View style={styles.statusList}>
            {statusSteps.map((step, idx) => {
              const isCompleted = step.state === 'completed';
              const isCurrent = step.state === 'current';

              let dotColor = colors.border;
              let textColor = colors.placeholder;
              let fontWeight = typography.weight.regular;

              if (isCompleted) {
                dotColor = colors.green;
                textColor = colors.textPrimary;
                fontWeight = typography.weight.medium;
              } else if (isCurrent) {
                dotColor = colors.primary;
                textColor = colors.primary;
                fontWeight = typography.weight.bold;
              }

              return (
                <View key={idx} style={styles.statusItem}>
                  <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
                  <Text
                    style={[
                      styles.statusText,
                      { color: textColor, fontWeight },
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Activity Section */}
        <View style={styles.activitySection}>
          <Text style={[styles.activityHeader, { color: themeColors.textPrimary }]}>Activity</Text>
          {activities.map((act, idx) => (
            <Text key={idx} style={[styles.activityItem, { color: themeColors.textSecondary }]}>
              {act}
            </Text>
          ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  headerRightSpacer: {
    width: 32,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketTitle: {
    flex: 1,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginRight: 8,
  },
  cardCodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ticketCode: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  filedDate: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  metaTable: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  metaValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  statusList: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  statusText: {
    fontSize: typography.size.sm,
  },
  activitySection: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  activityHeader: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  activityItem: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
});
