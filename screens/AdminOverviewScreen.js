import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import useTheme from '../contexts/ThemeContext';
import typography from '../constants/typography';
import TicketCard, { PriorityBadge } from '../components/TicketCard';
import useTickets from '../hooks/useTickets';
import { subscribeTechnicians } from '../firebase/technicians';
import { subscribeEquipment } from '../firebase/equipment';

const dateValue = (value) => {
  if (!value) return null;
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
const isClosed = (ticket) => ['completed', 'resolved', 'cancelled'].includes(String(ticket.status || '').toLowerCase());
const dateOrder = (ticket) => dateValue(ticket.createdAt)?.getTime() || 0;

function StatCard({ label, value, danger }) {
  const { colors: themeColors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
      <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: danger ? themeColors.danger : themeColors.textPrimary }]}>{value}</Text>
    </View>
  );
}

function Section({ title, children }) {
  const { colors: themeColors } = useTheme();
  return <View style={styles.section}><Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>{title}</Text>{children}</View>;
}

function EmptySection({ message }) {
  const { colors: themeColors } = useTheme();
  return <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>{message}</Text>;
}

export default function AdminOverviewScreen({ navigation }) {
  const { colors: themeColors } = useTheme();
  const { tickets = [], loading: ticketsLoading } = useTickets();
  const [technicians, setTechnicians] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [directoryError, setDirectoryError] = useState(false);

  useEffect(() => {
    let techLoaded = false;
    let equipmentLoaded = false;
    const markLoaded = () => {
      if (techLoaded && equipmentLoaded) setDirectoryLoading(false);
    };
    const onError = () => {
      setDirectoryError(true);
      setDirectoryLoading(false);
    };
    const stopTechnicians = subscribeTechnicians((items) => {
      setTechnicians(items);
      techLoaded = true;
      markLoaded();
    }, onError);
    const stopEquipment = subscribeEquipment((items) => {
      setEquipment(items);
      equipmentLoaded = true;
      markLoaded();
    }, onError);
    return () => {
      stopTechnicians();
      stopEquipment();
    };
  }, []);

  const activeTickets = tickets.filter((ticket) => !isClosed(ticket));
  const criticalTickets = activeTickets.filter((ticket) => String(ticket.priority || '').toLowerCase() === 'critical');
  const recentTickets = [...tickets].sort((a, b) => dateOrder(b) - dateOrder(a)).slice(0, 2);
  const criticalAlerts = criticalTickets.slice(0, 3);
  const durations = tickets.map((ticket) => {
    const created = dateValue(ticket.createdAt);
    const completed = dateValue(ticket.completedAt || ticket.resolvedAt);
    return created && completed ? (completed.getTime() - created.getTime()) / 3600000 : null;
  }).filter((hours) => hours !== null && hours >= 0);
  const avgResolution = durations.length
    ? `${(durations.reduce((sum, hours) => sum + hours, 0) / durations.length).toFixed(1)}h`
    : '—';
  const techniciansWithWork = technicians.filter((tech) =>
    activeTickets.some((ticket) => ticket.assignedTo === tech.id)
  ).length;
  const flaggedEquipment = equipment.filter((item) => ['medium', 'high', 'critical'].includes(String(item.status || '').toLowerCase()));
  const loading = ticketsLoading || directoryLoading;
  const openTicket = (ticket) => navigation.navigate('Details', { ticket });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Overview</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} accessibilityRole="button" accessibilityLabel="Profile and settings"><Ionicons name="person-circle-outline" size={24} color={themeColors.textPrimary} /></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Reports')} accessibilityRole="button" accessibilityLabel="Reports"><Ionicons name="bar-chart-outline" size={21} color={themeColors.textPrimary} /></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('PriorityRules')} accessibilityRole="button" accessibilityLabel="Priority rules"><Ionicons name="options-outline" size={21} color={themeColors.textPrimary} /></TouchableOpacity>
        </View>
      </View>

      {loading ? <ActivityIndicator style={styles.loader} color={themeColors.primary} /> : (
        <ScrollView contentContainerStyle={styles.content}>
          {directoryError && <Text style={styles.errorText}>Some technician or equipment data could not be loaded. Check Firestore access.</Text>}
          <View style={styles.statsGrid}>
            <StatCard label="Open Tickets" value={activeTickets.length} />
            <StatCard label="Critical Active" value={criticalTickets.length} danger />
            <StatCard label="Avg Resolution" value={avgResolution} />
            <StatCard label="Techs With Work" value={`${techniciansWithWork}/${technicians.length}`} />
          </View>

          <Section title="Critical Alerts">
            {criticalAlerts.length ? criticalAlerts.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} onPress={() => openTicket(ticket)} />) : <EmptySection message="No active critical tickets." />}
          </Section>
          <Section title="Recent Tickets">
            {recentTickets.length ? recentTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} onPress={() => openTicket(ticket)} />) : <EmptySection message="No tickets yet." />}
          </Section>
          <Section title="Equipment Flags">
            {flaggedEquipment.length ? flaggedEquipment.map((item) => (
              <View key={item.id} style={[styles.equipCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
                <Text style={[styles.equipName, { color: themeColors.textPrimary }]}>{item.name || item.assetId || item.id}</Text>
                <PriorityBadge level={item.status} />
              </View>
            )) : <EmptySection message="No equipment flags." />}
          </Section>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.textPrimary },
  content: { padding: 16, paddingBottom: 32 },
  loader: { marginTop: 36 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48.5%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 10 },
  statLabel: { fontSize: typography.size.xs, color: colors.textSecondary },
  statValue: { marginTop: 4, fontSize: typography.size.xxl, fontWeight: typography.weight.bold, color: colors.textPrimary },
  section: { marginTop: 14 },
  sectionTitle: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary, marginBottom: 10 },
  equipCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 },
  equipName: { fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.textPrimary },
  emptyText: { color: colors.textSecondary, fontSize: typography.size.sm, paddingVertical: 8 },
  errorText: { color: colors.danger, fontSize: typography.size.sm, marginBottom: 10 },
});
