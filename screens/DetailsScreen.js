import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PriorityBadge } from '../components/TicketCard';
import { fetchTicketById, getTicketById } from '../firebase/tickets';
import colors from '../constants/colors';
import typography from '../constants/typography';

const DEFAULT_TICKET = {
  id: '1',
  code: 'TCK-2091',
  title: 'AC not cooling',
  fullTitle: 'AC not cooling - Fl. 3 east wing',
  priority: 'high',
  status: 'in_progress',
  category: 'HVAC',
  location: 'Fl. 3, East Wing',
  assignedTechnician: 'James Cruz',
  filedDate: 'Sep 9, 2026',
  activity: ['James Cruz accepted ticket - 2 hrs ago', 'Repair started - 1 hr ago'],
  timeline: [
    { title: 'Reported', done: true },
    { title: 'Priority Set', done: true },
    { title: 'Technician Assigned', subtitle: 'James Cruz assigned', done: true },
    { title: 'Accepted', done: true },
    { title: 'Repair In Progress', done: true },
  ],
};

const STEPS = [
  'Reported',
  'Priority Set',
  'Technician Assigned',
  'Accepted',
  'Repair In Progress',
  'Completed',
];

function getCurrentStep(ticket) {
  const status = String(ticket.status || '').toLowerCase();
  if (status === 'completed' || status === 'resolved') return 5;
  if (status === 'in_progress' || status === 'repair_in_progress') return 4;
  if (status === 'accepted') return 3;
  if (status === 'assigned') return 2;
  if (status === 'evaluating') return 1;
  return 0;
}

function BottomTab({ icon, label, tab, active, navigation }) {
  return (
    <TouchableOpacity
      style={styles.tab}
      onPress={() => navigation.navigate('Main', { screen: tab })}
      accessibilityRole="button"
      accessibilityLabel={label}
      activeOpacity={0.75}
    >
      <Ionicons name={icon} size={20} color={active ? colors.primary : colors.textSecondary} />
      <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function DetailsScreen({ navigation, route }) {
  const paramTicket = route?.params?.ticket;
  const paramId = route?.params?.id;
  const [ticket, setTicket] = useState(
    paramTicket || (paramId ? getTicketById(paramId) : null) || DEFAULT_TICKET
  );

  useEffect(() => {
    if (paramTicket) {
      setTicket(paramTicket);
      return;
    }
    if (paramId) {
      const found = getTicketById(paramId);
      if (found) setTicket(found);
      fetchTicketById(paramId).then((remote) => {
        if (remote) setTicket(remote);
      }).catch(() => {});
    }
  }, [paramId, paramTicket]);

  const currentStep = getCurrentStep(ticket);
  const displayTitle =
    ticket.fullTitle ||
    (ticket.title && ticket.location
      ? ticket.title + ' - ' + ticket.location
      : ticket.title || 'Facilities Ticket');
  const assignedTechnician =
    ticket.assignedTechnician ||
    ticket.technician ||
    ticket.timeline?.find((item) => /assigned/i.test(item.title || ''))
      ?.subtitle?.replace(/ assigned$/i, '') ||
    'Not assigned';
  const activity = ticket.activity?.length
    ? ticket.activity
    : (ticket.timeline || [])
        .filter((item) => item.subtitle)
        .map((item) => item.subtitle);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={23} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket Detail</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ticketCard}>
          <View style={styles.titleRow}>
            <Text style={styles.ticketTitle} numberOfLines={1}>{displayTitle}</Text>
            <PriorityBadge level={ticket.priority || 'medium'} />
          </View>
          <View style={styles.codeRow}>
            <Text style={styles.ticketCode}>{ticket.code || ticket.id || 'TCK-2091'}</Text>
            <Text style={styles.filedDate}>Filed {ticket.filedDate || 'recently'}</Text>
          </View>
          <View style={styles.divider} />
          <DetailRow label="Category" value={ticket.category || 'General'} />
          <DetailRow label="Location" value={ticket.location || 'Not specified'} />
          <DetailRow label="Assigned Technician" value={assignedTechnician} />
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Ticket Status</Text>
          {STEPS.map((step, index) => {
            const isDone = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <View key={step} style={styles.statusRow}>
                <View style={[
                  styles.statusDot,
                  isDone && styles.doneDot,
                  isCurrent && styles.currentDot,
                ]} />
                <Text style={[
                  styles.statusText,
                  isCurrent && styles.currentStatusText,
                  index > currentStep && styles.pendingStatusText,
                ]}>
                  {step}{isCurrent ? ' (Current)' : ''}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Activity</Text>
          {activity.length ? activity.map((item, index) => (
            <Text key={index} style={styles.activityText}>- {item}</Text>
          )) : (
            <Text style={styles.activityText}>- Ticket reported</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <BottomTab icon="home-outline" label="Home" tab="Home" navigation={navigation} />
        <BottomTab icon="add-circle-outline" label="Report" tab="Report" navigation={navigation} />
        <BottomTab icon="document-text" label="Tickets" tab="Tickets" active navigation={navigation} />
        <BottomTab icon="qr-code-outline" label="Scan" tab="Scan" navigation={navigation} />
        <BottomTab icon="notifications-outline" label="Alerts" tab="Alerts" navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { padding: 4, width: 38 },
  headerTitle: {
    flex: 1,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginLeft: 4,
  },
  headerSpacer: { width: 38 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 20 },
  ticketCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 10,
    marginBottom: 11,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ticketTitle: {
    flex: 1,
    marginRight: 8,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 },
  ticketCode: { fontSize: typography.size.xs, color: colors.primary, fontWeight: typography.weight.medium },
  filedDate: { fontSize: 10, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 },
  detailLabel: { fontSize: 10, color: colors.textSecondary },
  detailValue: {
    maxWidth: '62%',
    fontSize: 10,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 10,
    marginBottom: 11,
  },
  sectionTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: 7,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', minHeight: 19 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border, marginRight: 9 },
  doneDot: { backgroundColor: colors.green },
  currentDot: { backgroundColor: colors.primary },
  statusText: { fontSize: 10, color: colors.textPrimary },
  currentStatusText: { color: colors.primary, fontWeight: typography.weight.semibold },
  pendingStatusText: { color: colors.placeholder },
  activitySection: { paddingTop: 1 },
  activityText: { fontSize: 10, color: colors.textSecondary, marginBottom: 5, lineHeight: 15 },
  bottomBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 8,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabLabel: { fontSize: 9, color: colors.textSecondary },
  activeTabLabel: { color: colors.primary, fontWeight: typography.weight.semibold },
});
