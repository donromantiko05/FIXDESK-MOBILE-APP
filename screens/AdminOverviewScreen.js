import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import typography from '../constants/typography';
import TicketCard, { PriorityBadge } from '../components/TicketCard';
 
// TODO: replace this mock data with useTickets(), useTechnicians() and an
// equipment hook once those files exist. Keep the same field names.
const STATS = {
  openTickets: 23,
  criticalActive: 2,
  avgResolution: '6.4h',
  techUtilization: '78%',
};
 
const CRITICAL_ALERTS = [
  { id: '1', code: 'TCK-2094', title: 'Server room overheating', priority: 'critical', status: 'unassigned' },
];
 
const RECENT_TICKETS = [
  { id: '2', code: 'TCK-2091', title: 'AC not cooling', priority: 'high', status: 'assigned' },
  { id: '3', code: 'TCK-2087', title: 'Flickering light', priority: 'medium', status: 'in_progress' },
];
 
const EQUIPMENT_FLAGS = [
  { id: 'e1', name: 'RTU-04 HVAC Unit', severity: 'medium' },
  { id: 'e2', name: 'Server Rack Cooling', severity: 'critical' },
];
 
function StatCard({ label, value, danger }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, danger && { color: colors.danger }]}>
        {value}
      </Text>
    </View>
  );
}
 
function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}
 
export default function AdminOverviewScreen({ navigation }) {
  const openTicket = (ticket) => navigation.navigate('Details', { ticket });
 
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Overview</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} accessibilityRole="button" accessibilityLabel="Profile and settings"><Ionicons name="person-circle-outline" size={24} color={colors.textPrimary} /></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Reports')} accessibilityRole="button" accessibilityLabel="Reports"><Ionicons name="bar-chart-outline" size={21} color={colors.textPrimary} /></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('PriorityRules')} accessibilityRole="button" accessibilityLabel="Priority rules"><Ionicons name="options-outline" size={21} color={colors.textPrimary} /></TouchableOpacity>
        </View>
      </View>
 
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsGrid}>
          <StatCard label="Open Tickets" value={STATS.openTickets} />
          <StatCard label="Critical Active" value={STATS.criticalActive} danger />
          <StatCard label="Avg Resolution" value={STATS.avgResolution} />
          <StatCard label="Tech Utilization" value={STATS.techUtilization} />
        </View>
 
        <Section title="Critical Alerts">
          {CRITICAL_ALERTS.map((t) => (
            <TicketCard key={t.id} ticket={t} onPress={() => openTicket(t)} />
          ))}
        </Section>
 
        <Section title="Recent Tickets">
          {RECENT_TICKETS.map((t) => (
            <TicketCard key={t.id} ticket={t} onPress={() => openTicket(t)} />
          ))}
        </Section>
 
        <Section title="Equipment Flags">
          {EQUIPMENT_FLAGS.map((e) => (
            <View key={e.id} style={styles.equipCard}>
              <Text style={styles.equipName}>{e.name}</Text>
              <PriorityBadge level={e.severity} />
            </View>
          ))}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  content: { padding: 16, paddingBottom: 32 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
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
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  equipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  equipName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
});
