import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import useTheme from '../contexts/ThemeContext';
import typography from '../constants/typography';
import { PriorityBadge } from '../components/TicketCard';
import Timeline from '../components/Timeline';
import { getTicketById } from '../firebase/tickets';

const DEFAULT_TIMELINE = [
  { title: 'Reported', time: 'Sep 9, 2026 10:14 AM', done: true },
  {
    title: 'Priority Evaluated',
    time: 'Sep 9, 2026 10:15 AM (Auto)',
    done: true,
  },
  { title: 'Assigned', subtitle: 'James Cruz assigned', done: true },
  {
    title: 'Repair in Progress',
    subtitle: 'Started today 2:14 PM',
    done: true,
  },
];

export default function TicketDetailScreen({ navigation, route }) {
  const { colors: themeColors } = useTheme();
  const paramTicket = route?.params?.ticket;
  const paramId = route?.params?.id;

  const [ticket, setTicket] = useState(
    paramTicket || (paramId ? getTicketById(paramId) : null) || {
      id: '1',
      code: 'TCK-2091',
      title: 'AC not cooling',
      fullTitle: 'AC not cooling — Fl. 3 east wing',
      priority: 'high',
      status: 'assigned',
      category: 'HVAC',
      location: 'Fl. 3, East Wing',
      reporter: 'Maria Reyes (Accounting)',
      filedDate: 'Sep 9, 2026',
      photos: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80',
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&q=80',
      ],
      timeline: DEFAULT_TIMELINE,
    }
  );

  useEffect(() => {
    if (paramId && !paramTicket) {
      const found = getTicketById(paramId);
      if (found) setTicket(found);
    }
  }, [paramId, paramTicket]);

  const displayTitle =
    ticket.fullTitle ||
    (ticket.title && ticket.location
      ? `${ticket.title} — ${ticket.location}`
      : ticket.title || 'Facilities Ticket');

  const photos = ticket.photos || [];
  const timeline = ticket.timeline && ticket.timeline.length ? ticket.timeline : DEFAULT_TIMELINE;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Ticket Detail</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ticket Info Card */}
        <View style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]} numberOfLines={2}>
              {displayTitle}
            </Text>
            <PriorityBadge level={ticket.priority || 'medium'} />
          </View>

          <View style={styles.codeRow}>
            <Text style={[styles.code, { color: themeColors.primary }]}>{ticket.code || 'TCK-2091'}</Text>
            <Text style={[styles.filedDate, { color: themeColors.textSecondary }]}>
              {ticket.filedDate ? `Filed ${ticket.filedDate}` : 'Filed recently'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <View style={styles.detailsTable}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Category</Text>
              <Text style={[styles.detailValue, { color: themeColors.textPrimary }]}>{ticket.category || 'HVAC'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Location</Text>
              <Text style={[styles.detailValue, { color: themeColors.textPrimary }]}>
                {ticket.location || 'Fl. 3, East Wing'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Reporter</Text>
              <Text style={[styles.detailValue, { color: themeColors.textPrimary }]}>
                {ticket.reporter || 'Maria Reyes (Accounting)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Photos Section */}
        <View style={styles.photosSection}>
          <Text style={[styles.sectionHeaderTitle, { color: themeColors.textPrimary }]}>
            PHOTOS ({photos.length})
          </Text>
          {photos.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photosRow}>
                {photos.map((uri, idx) => (
                  <Image
                    key={idx}
                    source={{ uri }}
                    style={styles.photoThumb}
                    resizeMode="cover"
                  />
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.noPhotos}>
              <Ionicons
                name="image-outline"
                size={20}
                color={colors.placeholder}
              />
              <Text style={[styles.noPhotosText, { color: themeColors.textSecondary }]}>No photos attached</Text>
            </View>
          )}
        </View>

        {/* Work Progress Section */}
        <View style={styles.progressCard}>
          <Text style={[styles.progressTitle, { color: themeColors.textPrimary }]}>Work Progress</Text>
          <Timeline steps={timeline} />
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  headerRightSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginRight: 10,
    lineHeight: 22,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  code: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  filedDate: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  detailsTable: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  photosSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionHeaderTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  photosRow: {
    flexDirection: 'row',
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  noPhotos: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  noPhotosText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
  },
  progressTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: 16,
  },
});
