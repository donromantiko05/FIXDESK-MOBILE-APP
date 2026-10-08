import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import useTheme from '../contexts/ThemeContext';
import typography from '../constants/typography';
import TicketCard from '../components/TicketCard';
import EmptyState from '../components/EmptyState';
import useTickets from '../hooks/useTickets';

const FILTERS = ['All', 'Open', 'In Progress', 'Completed'];

export default function TicketsListScreen({ navigation }) {
  const { colors: themeColors } = useTheme();
  const { tickets, loading, refresh } = useTickets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortDesc, setSortDesc] = useState(true);

  // Filter & Search & Sort logic
  const filteredTickets = useMemo(() => {
    return tickets
      .filter((ticket) => {
        // Status filter tab
        if (activeFilter === 'Open') {
          if (
            ticket.status === 'completed' ||
            ticket.status === 'resolved'
          ) {
            return false;
          }
        } else if (activeFilter === 'In Progress') {
          if (
            ticket.status !== 'in_progress' &&
            ticket.status !== 'assigned'
          ) {
            return false;
          }
        } else if (activeFilter === 'Completed') {
          if (
            ticket.status !== 'completed' &&
            ticket.status !== 'resolved'
          ) {
            return false;
          }
        }

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const code = (ticket.code || '').toLowerCase();
        const title = (ticket.title || '').toLowerCase();
        const category = (ticket.category || '').toLowerCase();
        const location = (ticket.location || '').toLowerCase();
        return (
          code.includes(q) ||
          title.includes(q) ||
          category.includes(q) ||
          location.includes(q)
        );
      })
      .sort((a, b) => {
        const idA = Number(a.id) || 0;
        const idB = Number(b.id) || 0;
        return sortDesc ? idB - idA : idA - idB;
      });
  }, [tickets, activeFilter, searchQuery, sortDesc]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* Title */}
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>My Tickets</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <Ionicons
          name="search-outline"
          size={18}
          color={themeColors.placeholder}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tickets..."
          placeholderTextColor={themeColors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={8}
            style={styles.clearBtn}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.placeholder}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const isSelected = activeFilter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterPill,
                isSelected ? styles.filterPillActive : styles.filterPillInactive,
              ]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  isSelected
                    ? styles.filterTextActive
                    : styles.filterTextInactive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sorting indicator */}
      <View style={styles.sortRow}>
        <Text style={styles.sortText}>
          Sorting by: <Text style={styles.sortHighlight}>{sortDesc ? 'Newest first' : 'Oldest first'}</Text>
        </Text>
        <TouchableOpacity
          onPress={() => setSortDesc(!sortDesc)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Toggle sorting"
        >
          <Ionicons name="options-outline" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item.id || item.code}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        renderItem={({ item }) => (
          <TicketCard
            ticket={item}
            accentBorder={true}
            onPress={() =>
              navigation.navigate('Details', { ticket: item, id: item.id })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No tickets found"
            message={
              searchQuery
                ? `No tickets matching "${searchQuery}".`
                : 'No tickets in this category.'
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    height: 44,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textPrimary,
  },
  clearBtn: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: colors.primary,
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
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  sortText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  sortHighlight: {
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
  },
});
