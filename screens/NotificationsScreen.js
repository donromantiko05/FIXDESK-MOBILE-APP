import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import useTheme from '../contexts/ThemeContext';
import typography from '../constants/typography';
import EmptyState from '../components/EmptyState';
import useNotifications from '../hooks/useNotifications';

const FILTERS = ['All', 'Unread', 'Tickets'];

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Ticket received',
    description: 'TCK-2101 is being evaluated',
    time: 'just now',
    icon: 'document-text-outline',
    unread: true,
    isTicket: true,
    ticketCode: 'TCK-2101',
  },
  {
    id: '2',
    title: 'Technician assigned',
    description: 'James Cruz was assigned to your ticket',
    time: '3 min ago',
    icon: 'person-outline',
    unread: true,
    isTicket: true,
    ticketCode: 'TCK-2091',
  },
  {
    id: '3',
    title: 'Repair started',
    description: 'Repair started on TCK-2101',
    time: '18 min ago',
    icon: 'pulse-outline',
    unread: false,
    isTicket: true,
    ticketCode: 'TCK-2101',
  },
  {
    id: '4',
    title: 'Repair completed',
    description: 'Repair completed — please confirm',
    time: '1 hr ago',
    icon: 'checkmark-outline',
    unread: false,
    isTicket: true,
    ticketCode: 'TCK-2079',
  },
  {
    id: '5',
    title: 'Schedule updated',
    description: 'Weekly maintenance schedule updated',
    time: 'Yesterday',
    icon: 'calendar-outline',
    unread: false,
    isTicket: false,
  },
];

const formatNotificationTime = (timestamp) => {
  const date = timestamp?.toDate?.();
  if (!date) return '';
  const elapsed = Math.max(0, Date.now() - date.getTime());
  if (elapsed < 60000) return 'just now';
  if (elapsed < 3600000) return `${Math.floor(elapsed / 60000)} min ago`;
  if (elapsed < 86400000) return `${Math.floor(elapsed / 3600000)} hr ago`;
  return date.toLocaleDateString();
};

export default function NotificationsScreen({ navigation }) {
  const { colors: themeColors } = useTheme();
  const { notifications, markAsRead, clearAll } = useNotifications();
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'Unread') return item.unread;
    if (activeFilter === 'Tickets') return item.isTicket;
    return true;
  });

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => clearAll() },
      ]
    );
  };

  const handleNotificationPress = async (item) => {
    try {
      await markAsRead(item.id);
    } catch {
      Alert.alert('Could not update notification', 'Check your Firebase connection and try again.');
    }

    if (item.ticketCode) {
      navigation.navigate('Details', {
        id: item.ticketId || item.ticketCode,
      });
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        <View style={styles.headerLeft}>
          {navigation.canGoBack() && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={8}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Notifications</Text>
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity
            onPress={handleClearAll}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear all notifications"
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((filter) => {
          const isSelected = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                isSelected ? styles.filterPillActive : styles.filterPillInactive,
              ]}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  isSelected ? styles.filterTextActive : styles.filterTextInactive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.7}
          >
            {/* Left square icon container */}
            <View style={styles.iconBox}>
              <Ionicons name={item.icon} size={22} color={colors.textPrimary} />
            </View>

            {/* Middle and Right Text */}
            <View style={styles.contentWrap}>
              <View style={styles.topRow}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemTime}>{formatNotificationTime(item.createdAt)}</Text>
              </View>
              <Text style={styles.itemDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No notifications"
            message={
              activeFilter === 'All'
                ? "You're all caught up! New updates will appear here."
                : `No ${activeFilter.toLowerCase()} notifications found.`
            }
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  clearAllText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.primary,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: colors.textPrimary,
  },
  filterPillInactive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterText: {
    fontSize: typography.size.xs,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: typography.weight.semibold,
  },
  filterTextInactive: {
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contentWrap: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  itemTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  itemTime: {
    fontSize: typography.size.xs,
    color: '#8C96A5',
  },
  itemDescription: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
