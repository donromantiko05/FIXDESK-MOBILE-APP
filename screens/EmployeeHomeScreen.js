import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import TicketCard from '../components/TicketCard';
import EmptyState from '../components/EmptyState';
import useTickets from '../hooks/useTickets';

export default function EmployeeHomeScreen({ navigation }) {
  const { tickets, loading, refresh } = useTickets();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logoTitle}>FIXDESK</Text>
        <TouchableOpacity style={styles.profileShortcut} onPress={() => navigation.navigate('Profile')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Profile">
          <Ionicons name="person-circle-outline" size={25} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Notifications">
          <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
        <TouchableOpacity style={styles.banner} onPress={() => navigation.navigate('NewTicket')} activeOpacity={0.9} accessibilityRole="button" accessibilityLabel="Report a Problem">
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>Report a Problem</Text>
            <Text style={styles.bannerSubtitle}>Snap a photo, we'll handle the rest</Text>
          </View>
          <View style={styles.cameraCircle}><Ionicons name="camera" size={24} color={colors.white} /></View>
        </TouchableOpacity>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>My Tickets</Text></View>
        {tickets.length === 0 ? (
          <EmptyState icon="ticket-outline" title="No tickets yet" message="Tap 'Report a Problem' to submit your first facilities request." />
        ) : (
          <View style={styles.ticketList}>
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id || ticket.code} ticket={ticket} onPress={() => navigation.navigate('Details', { ticket, id: ticket.id })} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  profileShortcut: { position: 'absolute', right: 58, top: 13 },
  logoTitle: { fontSize: typography.size.xl, fontWeight: typography.weight.bold, color: colors.textPrimary, letterSpacing: 1 },
  scrollContent: { paddingBottom: 32 },
  banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.primary, borderRadius: 12, marginHorizontal: 16, marginTop: 16, paddingVertical: 20, paddingHorizontal: 18, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  bannerTextWrap: { flex: 1, marginRight: 12 },
  bannerTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.white, marginBottom: 4 },
  bannerSubtitle: { fontSize: typography.size.xs, color: 'rgba(255, 255, 255, 0.88)' },
  cameraCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 255, 255, 0.22)', alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { marginHorizontal: 16, marginTop: 24, marginBottom: 10 },
  sectionTitle: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.textPrimary },
  ticketList: { paddingHorizontal: 16 },
});