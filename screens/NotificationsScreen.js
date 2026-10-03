import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Technician Assigned',
    message: 'James Cruz was assigned to ticket TCK-2091.',
    time: '2 hours ago',
    read: false,
    icon: 'person-outline',
  },
  {
    id: '2',
    title: 'Priority Evaluated',
    message: 'Ticket TCK-2091 priority set to High.',
    time: '3 hours ago',
    read: true,
    icon: 'flash-outline',
  },
  {
    id: '3',
    title: 'Ticket Completed',
    message: 'Ticket TCK-2079 (Squeaky door hinge) was marked resolved.',
    time: '1 day ago',
    read: true,
    icon: 'checkmark-circle-outline',
  },
];

export default function NotificationsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        {navigation.canGoBack() && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.read && styles.cardUnread]}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.textWrap}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.message}>{item.message}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { marginRight: 12 },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  listContent: { padding: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
  },
  cardUnread: {
    borderColor: colors.primary,
    backgroundColor: '#F7FAFC',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  time: { fontSize: typography.size.xs, color: colors.textSecondary },
  message: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
