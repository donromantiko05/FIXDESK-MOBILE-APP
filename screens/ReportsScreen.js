import { Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import useTickets from '../hooks/useTickets';

const CATEGORY_COLORS = [colors.purple, '#7767A5', '#9286B6', '#B3AACB', '#C8C3D7'];
const dateValue = (value) => {
  if (!value) return null;
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

function AdminNav({ navigation, active }) {
  const items = [
    ['Overview', 'grid-outline'],
    ['AdminTickets', 'ticket-outline', 'Tickets'],
    ['Techs', 'people-outline', 'Techs'],
    ['Equip', 'construct-outline'],
  ];
  return (
    <View style={styles.bottomBar}>
      {items.map(([tab, icon, label = tab]) => (
        <TouchableOpacity key={tab} style={styles.tab} onPress={() => navigation.navigate('Main', { screen: tab })}>
          <Ionicons name={icon} size={18} color={tab === active ? colors.purple : colors.textSecondary} />
          <Text style={[styles.tabLabel, tab === active && styles.activeTab]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function StatCard({ label, value }) {
  return <View style={styles.statCard}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>;
}

function CategoryBar({ name, percent, index }) {
  return (
    <View style={styles.categoryRow}>
      <View style={styles.categoryLabels}><Text style={styles.categoryName}>{name}</Text><Text style={styles.percent}>{percent}%</Text></View>
      <View style={styles.track}><View style={[styles.fill, { width: percent + '%', backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }]} /></View>
    </View>
  );
}

function TrendChart({ width, values }) {
  const chartWidth = Math.max(width - 48, 180);
  const chartHeight = 84;
  const maxValue = Math.max(...values, 1);
  const points = values.map((value, index) => ({
    x: (chartWidth - 12) * index / (values.length - 1) + 6,
    y: chartHeight - 10 - value / maxValue * 62,
  }));
  return (
    <View style={[styles.chart, { width: chartWidth, height: chartHeight }]}>
      {[20, 48, 76].map((top) => <View key={top} style={[styles.gridLine, { top }]} />)}
      {points.slice(0, -1).map((point, index) => {
        const next = points[index + 1];
        const dx = next.x - point.x;
        const dy = next.y - point.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) + 'rad';
        return <View key={'line-' + index} style={[styles.trendLine, { left: point.x, top: point.y, width: length, transform: [{ rotate: angle }] }]} />;
      })}
      {points.map((point, index) => <View key={'point-' + index} style={[styles.point, { left: point.x - 2, top: point.y - 2 }]} />)}
    </View>
  );
}

export default function ReportsScreen({ navigation }) {
  const { tickets = [] } = useTickets();
  const { width: windowWidth } = useWindowDimensions();
  const resolvedTickets = tickets.filter((ticket) => ['completed', 'resolved'].includes(String(ticket.status).toLowerCase()));
  const resolved = resolvedTickets.length;
  const durations = resolvedTickets.map((ticket) => {
    const created = dateValue(ticket.createdAt);
    const completed = dateValue(ticket.completedAt || ticket.resolvedAt);
    return created && completed ? (completed.getTime() - created.getTime()) / 3600000 : null;
  }).filter((hours) => hours !== null && hours >= 0);
  const avgResolution = durations.length ? (durations.reduce((sum, hours) => sum + hours, 0) / durations.length).toFixed(1) + 'h' : '—';
  const responses = tickets.map((ticket) => Number(ticket.firstResponseHours)).filter((value) => Number.isFinite(value) && value >= 0);
  const avgResponse = responses.length ? (responses.reduce((sum, hours) => sum + hours, 0) / responses.length).toFixed(1) + 'h' : '—';
  const ratings = tickets.map((ticket) => Number(ticket.satisfactionRating)).filter((value) => Number.isFinite(value) && value >= 1 && value <= 5);
  const satisfaction = ratings.length ? Math.round(ratings.reduce((sum, value) => sum + value, 0) / ratings.length / 5 * 100) + '%' : '—';
  const categories = tickets.length
    ? Object.entries(tickets.reduce((counts, ticket) => {
        const category = ticket.category || 'Other';
        counts[category] = (counts[category] || 0) + 1;
        return counts;
      }, {})).map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count).slice(0, 5)
    : [];
  const total = categories.reduce((sum, item) => sum + item.count, 0);
  const categoryData = categories.map((item) => ({ name: item.name, percent: Math.round(item.count * 100 / total) }));
  const trendDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    return day;
  });
  const trendValues = trendDays.map((day) => resolvedTickets.filter((ticket) => {
    const completed = dateValue(ticket.completedAt || ticket.resolvedAt);
    return completed && completed.toDateString() === day.toDateString();
  }).length);

  const exportReport = async () => {
    const rows = [
      ['Code', 'Title', 'Category', 'Priority', 'Status', 'Created', 'Completed'],
      ...tickets.map((ticket) => [ticket.code, ticket.title, ticket.category, ticket.priority, ticket.status, ticket.filedDate, ticket.completedAt || ticket.resolvedAt || '']),
    ];
    const csv = rows.map((row) => row.map((value) => '"' + String(value ?? '').replace(/"/g, '""') + '"').join(',')).join('\n');
    try {
      await Share.share({ title: 'FixDesk weekly report', message: csv });
    } catch {
      Alert.alert('Export unavailable', 'Your device could not open the share sheet.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <TouchableOpacity onPress={() => navigation.navigate('PriorityRules')} accessibilityRole="button" accessibilityLabel="Open priority rules">
          <Ionicons name="options-outline" size={21} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.overviewHeading}><Text style={styles.sectionTitle}>Overview</Text><Text style={styles.period}>This Week</Text></View>
        <View style={styles.statsGrid}>
          <StatCard label="Resolved" value={resolved} />
          <StatCard label="Avg Res. Time" value={avgResolution} />
          <StatCard label="First Response" value={avgResponse} />
          <StatCard label="Satisfaction" value={satisfaction} />
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tickets by Category</Text>
          {categoryData.length ? categoryData.map((item, index) => <CategoryBar key={item.name} name={item.name} percent={item.percent} index={index} />) : <Text style={styles.noData}>No ticket categories recorded yet.</Text>}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resolution Trend</Text>
          <TrendChart width={windowWidth - 56} values={trendValues} />
        </View>
        <TouchableOpacity style={styles.exportButton} onPress={exportReport} accessibilityRole="button">
          <Text style={styles.exportText}>Export Report</Text>
        </TouchableOpacity>
      </ScrollView>
      <AdminNav navigation={navigation} active="Overview" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { height: 48, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary },
  content: { paddingHorizontal: 11, paddingTop: 10, paddingBottom: 14 },
  overviewHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sectionTitle: { fontSize: typography.size.xs, fontWeight: typography.weight.bold, color: colors.textPrimary },
  period: { fontSize: 9, color: colors.purple, fontWeight: typography.weight.semibold },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 5 },
  statCard: { width: '48.5%', height: 42, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 5, marginBottom: 5 },
  statLabel: { fontSize: 8, color: colors.textSecondary },
  noData: { fontSize: 9, color: colors.textSecondary, paddingVertical: 8 },
  statValue: { fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.textPrimary, marginTop: 1 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 9, marginTop: 7 },
  cardTitle: { fontSize: 9, color: colors.textPrimary, fontWeight: typography.weight.bold, marginBottom: 8 },
  categoryRow: { marginBottom: 5 },
  categoryLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  categoryName: { fontSize: 8, color: colors.textSecondary },
  percent: { fontSize: 8, color: colors.textSecondary },
  track: { height: 4, backgroundColor: '#E6EAF0', borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
  chart: { marginTop: 2, position: 'relative', justifyContent: 'center' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#E9ECF1' },
  trendLine: { position: 'absolute', height: 2, backgroundColor: colors.purple, transformOrigin: 'left center' },
  point: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: colors.purple },
  exportButton: { height: 32, borderRadius: 6, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center', marginTop: 9 },
  exportText: { fontSize: 9, color: colors.textPrimary, fontWeight: typography.weight.bold },
  bottomBar: { height: 44, flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 1 },
  tabLabel: { fontSize: 8, color: colors.textSecondary },
  activeTab: { color: colors.purple, fontWeight: typography.weight.semibold },
});
