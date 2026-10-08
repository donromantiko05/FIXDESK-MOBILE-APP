import { Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import useTheme from '../contexts/ThemeContext';
import typography from '../constants/typography';
import useTickets from '../hooks/useTickets';

const CATEGORY_COLORS = [colors.purple, '#7767A5', '#9286B6', '#B3AACB', '#C8C3D7'];
const dateValue = (value) => {
  if (!value) return null;
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

function AdminNav({ navigation, active }) {
  const { colors: themeColors } = useTheme();
  const items = [
    ['Overview', 'grid-outline'],
    ['AdminTickets', 'ticket-outline', 'Tickets'],
    ['Techs', 'people-outline', 'Techs'],
    ['Equip', 'construct-outline'],
  ];
  return (
    <View style={[styles.bottomBar, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}>
      {items.map(([tab, icon, label = tab]) => (
        <TouchableOpacity key={tab} style={styles.tab} onPress={() => navigation.navigate('Main', { screen: tab })}>
          <Ionicons name={icon} size={18} color={tab === active ? themeColors.purple : themeColors.textSecondary} />
          <Text style={[styles.tabLabel, { color: tab === active ? themeColors.purple : themeColors.textSecondary }, tab === active && styles.activeTab]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function StatCard({ label, value, colors: themeColors }) {
  return <View style={[styles.statCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}><Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{label}</Text><Text style={[styles.statValue, { color: themeColors.textPrimary }]}>{value}</Text></View>;
}

function CategoryBar({ name, percent, index, colors: themeColors }) {
  return (
    <View style={styles.categoryRow}>
      <View style={styles.categoryLabels}><Text style={[styles.categoryName, { color: themeColors.textSecondary }]}>{name}</Text><Text style={[styles.percent, { color: themeColors.textSecondary }]}>{percent}%</Text></View>
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
  const { colors: themeColors } = useTheme();
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
    <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Reports</Text>
        <TouchableOpacity onPress={() => navigation.navigate('PriorityRules')} accessibilityRole="button" accessibilityLabel="Open priority rules">
          <Ionicons name="options-outline" size={21} color={themeColors.textPrimary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.overviewHeading}><Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Overview</Text><Text style={styles.period}>This Week</Text></View>
        <View style={styles.statsGrid}>
          <StatCard colors={themeColors} label="Resolved" value={resolved} />
          <StatCard colors={themeColors} label="Avg Res. Time" value={avgResolution} />
          <StatCard colors={themeColors} label="First Response" value={avgResponse} />
          <StatCard colors={themeColors} label="Satisfaction" value={satisfaction} />
        </View>
        <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>Tickets by Category</Text>
          {categoryData.length ? categoryData.map((item, index) => <CategoryBar colors={themeColors} key={item.name} name={item.name} percent={item.percent} index={index} />) : <Text style={[styles.noData, { color: themeColors.textSecondary }]}>No ticket categories recorded yet.</Text>}
        </View>
        <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>Resolution Trend</Text>
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
  header: { height: 56, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 },
  headerTitle: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  overviewHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary },
  period: { fontSize: typography.size.xs, color: colors.purple, fontWeight: typography.weight.semibold },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  statCard: { width: '48.5%', minHeight: 76, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
  statLabel: { fontSize: typography.size.xs, color: colors.textSecondary },
  noData: { fontSize: typography.size.xs, color: colors.textSecondary, paddingVertical: 10 },
  statValue: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.textPrimary, marginTop: 5 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14, marginTop: 10 },
  cardTitle: { fontSize: typography.size.sm, color: colors.textPrimary, fontWeight: typography.weight.bold, marginBottom: 12 },
  categoryRow: { marginBottom: 9 },
  categoryLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  categoryName: { fontSize: typography.size.xs, color: colors.textSecondary },
  percent: { fontSize: typography.size.xs, color: colors.textSecondary },
  track: { height: 5, backgroundColor: '#E6EAF0', borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2 },
  chart: { marginTop: 2, position: 'relative', justifyContent: 'center' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#E9ECF1' },
  trendLine: { position: 'absolute', height: 2, backgroundColor: colors.purple, transformOrigin: 'left center' },
  point: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: colors.purple },
  exportButton: { height: 46, borderRadius: 8, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  exportText: { fontSize: typography.size.sm, color: colors.textPrimary, fontWeight: typography.weight.bold },
  bottomBar: { height: 58, flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 1 },
  tabLabel: { fontSize: 11, color: colors.textSecondary },
  activeTab: { color: colors.purple, fontWeight: typography.weight.semibold },
});
