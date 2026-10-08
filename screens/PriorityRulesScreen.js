import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import priorityMap from '../constants/priority';
import { scoreTicketPriority } from '../constants/priorityRules';
import useTheme from '../contexts/ThemeContext';

const LEVELS = [
  { name: 'Low', color: colors.green, bg: '#E8F4EC', sla: '3 days', desc: 'Cosmetic or non-disruptive issues.' },
  { name: 'Medium', color: '#C98516', bg: '#FFF3DD', sla: '24 hours', desc: 'Workaround exists, partial system disruption.' },
  { name: 'High', color: '#D76A26', bg: '#FCE9DF', sla: '4 hours', desc: 'Safety risk, active functional blockage.' },
  { name: 'Critical', color: colors.danger, bg: '#FBE7E7', sla: '1 hour', desc: 'Immediate hazard or building-wide emergency.' },
];

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

function Factor({ title, detail, percent }) {
  const { colors: themeColors } = useTheme();
  return (
    <View style={styles.factor}>
      <View style={styles.factorHeading}><Text style={[styles.factorTitle, { color: themeColors.textPrimary }]}>{title}</Text><Text style={[styles.percent, { color: themeColors.textSecondary }]}>{percent}%</Text></View>
      <Text style={[styles.factorDetail, { color: themeColors.textSecondary }]}>{detail}</Text>
      <View style={styles.track}><View style={[styles.fill, { width: percent + '%' }]} /></View>
    </View>
  );
}

export default function PriorityRulesScreen({ navigation, route }) {
  const { colors: themeColors, isDark } = useTheme();
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
    <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Priority Rules</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Reports')} accessibilityRole="button" accessibilityLabel="Open reports">
          <Ionicons name="bar-chart-outline" size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>How {ticket.code || ticket.id || 'ticket'} was scored</Text>
          {factors.map((factor) => <Factor key={factor.title} title={factor.title} detail={factor.detail} percent={factor.percent} />)}
          <View style={styles.resultRow}><Text style={styles.resultLabel}>Result · score {ticket.priorityScore ?? score.score}</Text><View style={[styles.highBadge, { backgroundColor: resultStyle.background }]}><View style={[styles.highDot, { backgroundColor: resultStyle.color }]} /><Text style={[styles.highText, { color: resultStyle.color }]}>{resultStyle.label}</Text></View></View>
        </View>

        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Priority Levels</Text>
        {LEVELS.map((level) => (
          <View key={level.name} style={[styles.levelCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            <View style={styles.levelTop}>
              <View style={[styles.levelBadge, { backgroundColor: isDark ? '#263341' : level.bg }]}><View style={[styles.levelDot, { backgroundColor: level.color }]} /><Text style={[styles.levelName, { color: level.color }]}>{level.name}</Text></View>
              <Text style={[styles.sla, { color: themeColors.textPrimary }]}>SLA: {level.sla}</Text>
            </View>
            <Text style={[styles.levelDescription, { color: themeColors.textSecondary }]}>{level.desc}</Text>
          </View>
        ))}
      </ScrollView>
      <AdminNav navigation={navigation} active="Overview" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14, marginBottom: 16 },
  cardTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.textPrimary, marginBottom: 12 },
  factor: { marginBottom: 12 },
  factorHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  factorTitle: { fontSize: typography.size.xs, color: colors.textPrimary, fontWeight: typography.weight.semibold },
  percent: { fontSize: typography.size.xs, color: colors.textSecondary },
  factorDetail: { fontSize: 11, color: colors.textSecondary, marginTop: 3, marginBottom: 5 },
  track: { height: 4, backgroundColor: '#E6EAF0', borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.purple },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, marginTop: 2, paddingTop: 7 },
  resultLabel: { fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.textPrimary },
  highBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 12, backgroundColor: '#FCE9DF' },
  highDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#D76A26', marginRight: 4 },
  highText: { color: '#D76A26', fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  sectionTitle: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary, marginBottom: 10 },
  levelCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14, marginBottom: 10 },
  levelTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  levelBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 14 },
  levelDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  levelName: { fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  sla: { fontSize: typography.size.xs, color: colors.textPrimary, fontWeight: typography.weight.bold },
  levelDescription: { fontSize: 11, color: colors.textSecondary, marginTop: 7 },
  bottomBar: { height: 58, flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 1 },
  tabLabel: { fontSize: 11, color: colors.textSecondary },
  activeTab: { color: colors.purple, fontWeight: typography.weight.semibold },
});
