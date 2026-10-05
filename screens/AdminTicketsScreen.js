import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import typography from '../constants/typography';
import TicketCard from '../components/TicketCard';
import EmptyState from '../components/EmptyState';
import useTickets from '../hooks/useTickets';
import { subscribeTechnicians } from '../firebase/technicians';
import { updateTicket } from '../firebase/tickets';
import { createNotification } from '../firebase/messaging';

export default function AdminTicketsScreen({ navigation }) {
  const { tickets, loading } = useTickets();
  const [technicians, setTechnicians] = useState([]);
  const [assigning, setAssigning] = useState('');

  useEffect(() => subscribeTechnicians(setTechnicians, () => setTechnicians([])), []);

  const assignTicket = (ticket) => {
    if (!technicians.length) {
      Alert.alert('No technicians', 'Add technician accounts with role "technician" in Firebase first.');
      return;
    }
    Alert.alert('Assign Ticket', 'Choose a technician for ' + ticket.code + '.', [
      ...technicians.slice(0, 4).map((technician) => ({
        text: technician.fullName || technician.email || 'Technician',
        onPress: async () => {
          setAssigning(ticket.id);
          try {
            const name = technician.fullName || technician.email || 'Technician';
            const updated = await updateTicket(ticket.id, {
              status: 'assigned',
              assignedTo: technician.id,
              assignedTechnician: name,
              assignedAt: new Date(),
              timelineEntry: { title: 'Technician Assigned', subtitle: name + ' assigned', time: new Date().toLocaleString(), done: true },
            });
            if (updated.reporterId) {
              createNotification({ userId: updated.reporterId, title: 'Technician assigned', description: name + ' was assigned to ' + ticket.code + '.', ticketCode: ticket.code, ticketId: updated.id, icon: 'person-outline' }).catch(() => {});
            }
          } catch (error) {
            Alert.alert('Assignment failed', error?.message || 'Check Firebase access and try again.');
          } finally {
            setAssigning('');
          }
        },
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const renderTicket = ({ item }) => (
    <View style={styles.ticketWrap}>
      <TicketCard ticket={item} onPress={() => navigation.navigate('Details', { ticket: item, id: item.id })} />
      <View style={styles.ticketFooter}>
        <Text style={styles.assignedText}>{item.assignedTechnician ? 'Assigned to ' + item.assignedTechnician : 'Waiting for assignment'}</Text>
        <TouchableOpacity style={styles.assignButton} disabled={assigning === item.id} onPress={() => assignTicket(item)}>
          <Text style={styles.assignText}>{assigning === item.id ? 'Saving...' : item.assignedTo ? 'Reassign' : 'Assign'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}><Text style={styles.headerTitle}>Tickets</Text><Text style={styles.count}>{tickets.length}</Text></View>
      {loading ? <ActivityIndicator style={styles.loader} color={colors.primary} /> :
        <FlatList data={tickets} keyExtractor={(item) => item.id || item.code} renderItem={renderTicket} contentContainerStyle={tickets.length ? styles.list : styles.empty} ListEmptyComponent={<EmptyState icon="ticket-outline" title="No tickets yet" message="Submitted tickets will appear here." />} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.textPrimary },
  count: { color: colors.textSecondary, fontSize: typography.size.sm },
  loader: { marginTop: 28 },
  list: { padding: 14 },
  empty: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  ticketWrap: { backgroundColor: colors.surface, borderRadius: 10, padding: 8, marginBottom: 10 },
  ticketFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 7, paddingBottom: 5 },
  assignedText: { flex: 1, fontSize: typography.size.xs, color: colors.textSecondary },
  assignButton: { backgroundColor: colors.purple, borderRadius: 6, paddingHorizontal: 13, paddingVertical: 7 },
  assignText: { color: colors.white, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
});
