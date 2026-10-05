import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import priorityMap from '../constants/priority';
import { scoreTicketPriority } from '../constants/priorityRules';

const LEVELS = [
  { name: 'Low', color: colors.green, bg: '#E8F4EC', sla: '3 days', desc: 'Cosmetic or non-disruptive issues.' },
  { name: 'Medium', color: '#C98516', bg: '#FFF3DD', sla: '24 hours', desc: 'Workaround exists, partial system disruption.' },
  { name: 'High', color: '#D76A26', bg: '#FCE9DF', sla: '4 hours', desc: 'Safety risk, active functional blockage.' },
  { name: 'Critical', color: colors.danger, bg: '#FBE7E7', sla: '1 hour', desc: 'Immediate hazard or building-wide emergency.' },
];

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

function Factor({ title, detail, percent }) {
  return (
    <View style={styles.factor}>
      <View style={styles.factorHeading}><Text style={styles.factorTitle}>{title}</Text><Text style={styles.percent}>{percent}%</Text></View>
      <Text style={styles.factorDetail}>{detail}</Text>
      <View style={styles.track}><View style={[styles.fill, { width: percent + '%' }]} /></View>
    </View>
  );
}

export default function PriorityRulesScreen({ navigation, route }) {
  const ticket = route?.params?.ticket || {
    code: route?.params?.ticketCode || 'TCK-2101',
    category: 'Electrical',
    description: 'Outlet sparked when a laptop was plugged in',
    incidentCount: 1,
  };
  const score = scoreTicketPriority(ticket);
  const factors = ticket.priorityFactors?.length ? ticket.priorityFactors : score.factors;
  const result = ticket.priority || score.priority;
  const resultStyle = priorityMap[result] || priorityMap.medium;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Priority Rules</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Reports')} accessibilityRole="button" accessibilityLabel="Open reports">
          <Ionicons name="bar-chart-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How {ticket.code || ticket.id || 'ticket'} was scored</Text>
          {factors.map((factor) => <Factor key={factor.title} title={factor.title} detail={factor.detail} percent={factor.percent} />)}
          <View style={styles.resultRow}><Text style={styles.resultLabel}>Result · score {ticket.priorityScore ?? score.score}</Text><View style={[styles.highBadge, { backgroundColor: resultStyle.background }]}><View style={[styles.highDot, { backgroundColor: resultStyle.color }]} /><Text style={[styles.highText, { color: resultStyle.color }]}>{resultStyle.label}</Text></View></View>
        </View>

        <Text style={styles.sectionTitle}>Priority Levels</Text>
        {LEVELS.map((level) => (
          <View key={level.name} style={styles.levelCard}>
            <View style={styles.levelTop}>
              <View style={[styles.levelBadge, { backgroundColor: level.bg }]}><View style={[styles.levelDot, { backgroundColor: level.color }]} /><Text style={[styles.levelName, { color: level.color }]}>{level.name}</Text></View>
              <Text style={styles.sla}>SLA: {level.sla}</Text>
            </View>
            <Text style={styles.levelDescription}>{level.desc}</Text>
          </View>
        ))}
      </ScrollView>
      <AdminNav navigation={navigation} active="Overview" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary },
  content: { paddingHorizontal: 11, paddingTop: 10, paddingBottom: 12 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 9, marginBottom: 11 },
  cardTitle: { fontSize: 9, fontWeight: typography.weight.bold, color: colors.textPrimary, marginBottom: 7 },
  factor: { marginBottom: 6 },
  factorHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  factorTitle: { fontSize: 8, color: colors.textPrimary, fontWeight: typography.weight.semibold },
  percent: { fontSize: 8, color: colors.textSecondary },
  factorDetail: { fontSize: 7, color: colors.textSecondary, marginTop: 1, marginBottom: 3 },
  track: { height: 3, backgroundColor: '#E6EAF0', borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.purple },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, marginTop: 2, paddingTop: 7 },
  resultLabel: { fontSize: 9, fontWeight: typography.weight.bold, color: colors.textPrimary },
  highBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 12, backgroundColor: '#FCE9DF' },
  highDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#D76A26', marginRight: 4 },
  highText: { color: '#D76A26', fontSize: 8, fontWeight: typography.weight.semibold },
  sectionTitle: { fontSize: typography.size.xs, fontWeight: typography.weight.bold, color: colors.textPrimary, marginBottom: 6 },
  levelCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 8, marginBottom: 6 },
  levelTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  levelBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 12 },
  levelDot: { width: 5, height: 5, borderRadius: 3, marginRight: 4 },
  levelName: { fontSize: 8, fontWeight: typography.weight.semibold },
  sla: { fontSize: 8, color: colors.textPrimary, fontWeight: typography.weight.bold },
  levelDescription: { fontSize: 7, color: colors.textSecondary, marginTop: 4 },
  bottomBar: { height: 44, flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 1 },
  tabLabel: { fontSize: 8, color: colors.textSecondary },
  activeTab: { color: colors.purple, fontWeight: typography.weight.semibold },
});
