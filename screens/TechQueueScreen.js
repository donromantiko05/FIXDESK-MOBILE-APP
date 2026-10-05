import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import { PriorityBadge } from '../components/TicketCard';
import useTickets from '../hooks/useTickets';
import useAuth from '../hooks/useAuth';
import { updateTicket } from '../firebase/tickets';
import { createNotification } from '../firebase/messaging';
import { updateTechnician } from '../firebase/technicians';

export default function TechQueueScreen({ navigation }) {
  const { tickets } = useTickets();
  const { user, profile } = useAuth();
  const [techStatus, setTechStatus] = useState(profile?.availability || 'Available');
  const [saving, setSaving] = useState(false);
  const techId = user?.uid;
  const techName = profile?.fullName || user?.displayName || '';

  useEffect(() => {
    setTechStatus(profile?.availability || 'Available');
  }, [profile?.availability]);

  const activeJob = useMemo(() => tickets.find((ticket) =>
    (ticket.assignedTo === techId || (techName && ticket.assignedTechnician === techName)) &&
    ['accepted', 'in_progress', 'parts_ordered', 'on_hold'].includes(ticket.status)
  ) || null, [tickets, techId, techName]);
  const upNextJobs = useMemo(() => tickets.filter((ticket) =>
    ['evaluating', 'unassigned', 'assigned'].includes(ticket.status) &&
    (!ticket.assignedTo || ticket.assignedTo === techId)
  ), [tickets, techId]);

  const stats = [
    { label: 'Available Tickets', value: upNextJobs.length },
    { label: 'Active Jobs', value: activeJob ? 1 : 0 },
    { label: 'Completed', value: tickets.filter((ticket) => ticket.assignedTo === techId && ticket.status === 'completed').length },
    { label: 'My Tickets', value: tickets.filter((ticket) => ticket.assignedTo === techId).length },
  ];

  const handleMarkCompleted = (job) => {
    navigation.navigate('TechStatus', {
      ticketCode: job.code,
      ticketTitle: job.title,
      defaultStatus: 'Completed',
    });
  };

  const handleAcceptJob = (job) => {
    Alert.alert('Accept Job', `Do you want to accept ticket ${job.code}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          setSaving(true);
          try {
            const updated = await updateTicket(job.id || job.code, {
              status: 'accepted',
              assignedTo: techId,
              assignedTechnician: techName,
              acceptedAt: new Date(),
              firstResponseHours: job.createdAt?.toDate
                ? Math.max(0, (Date.now() - job.createdAt.toDate().getTime()) / 3600000)
                : null,
              timelineEntry: { title: 'Accepted', subtitle: (techName || 'Technician') + ' accepted ticket', time: new Date().toLocaleString(), done: true },
            });
            if (updated.reporterId) {
              createNotification({ userId: updated.reporterId, title: 'Technician accepted ticket', description: `${job.code} was accepted by ${techName || 'your technician'}.`, ticketCode: job.code, ticketId: updated.id }).catch(() => {});
            }
          } catch (error) {
            Alert.alert('Could not accept ticket', error?.message || 'Check Firebase access and try again.');
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  const handleToggleStatus = async () => {
    const next = techStatus === 'Available' ? 'Busy' : 'Available';
    setTechStatus(next);
    if (!techId) return;
    try {
      await updateTechnician(techId, { availability: next });
    } catch {
      setTechStatus(techStatus);
      Alert.alert('Could not update status', 'Check Firebase access and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Queue</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Profile and settings">
          <Ionicons name="person-circle-outline" size={25} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statusPill,
            techStatus === 'Available' ? styles.pillAvailable : styles.pillBusy,
          ]}
          onPress={handleToggleStatus}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.statusDot,
              techStatus === 'Available' ? styles.dotAvailable : styles.dotBusy,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              techStatus === 'Available' ? styles.textAvailable : styles.textBusy,
            ]}
          >
            {techStatus}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 2x2 Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((s, idx) => (
            <View key={idx} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </View>
          ))}
        </View>

        {/* ACTIVE JOB SECTION */}
        {activeJob && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>ACTIVE JOB</Text>
            <TouchableOpacity
              style={styles.activeJobCard}
              onPress={() =>
                navigation.navigate('TechHistory', {
                  ticket: activeJob,
                  ticketCode: activeJob.code,
                })
              }
              activeOpacity={0.9}
            >
              <View style={styles.jobRow}>
                <Text style={styles.jobTitle} numberOfLines={1}>
                  {activeJob.title}
                </Text>
                <PriorityBadge level={activeJob.priority} />
              </View>

              <View style={[styles.jobRow, styles.subRow]}>
                <Text style={styles.activeJobCode}>{activeJob.code}</Text>
                <Text style={styles.jobMeta}>{activeJob.timeElapsed}</Text>
              </View>

              <TouchableOpacity
                style={styles.completeBtn}
                onPress={() => handleMarkCompleted(activeJob)}
                activeOpacity={0.85}
              >
                <Text style={styles.completeBtnText}>Mark Completed</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        )}

        {/* UP NEXT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            UP NEXT ({upNextJobs.length})
          </Text>

          {upNextJobs.map((job, index) => (
            <TouchableOpacity
              key={job.code}
              style={styles.upNextCard}
              onPress={() =>
                navigation.navigate('TechHistory', {
                  ticket: job,
                  ticketCode: job.code,
                })
              }
              activeOpacity={0.9}
            >
              <View style={styles.jobRow}>
                <Text style={styles.jobTitle} numberOfLines={1}>
                  {job.title}
                </Text>
                <PriorityBadge level={job.priority} />
              </View>

              <View style={[styles.jobRow, styles.subRow]}>
                <Text style={styles.jobCode}>{job.code}</Text>
                <Text style={styles.jobMeta}>{job.location}</Text>
              </View>

              <TouchableOpacity
                style={
                  index === 0
                    ? styles.acceptBtnPrimary
                    : styles.acceptBtnSecondary
                }
                onPress={() => handleAcceptJob(job)}
                activeOpacity={0.85}
              >
                <Text
                  style={
                    index === 0
                      ? styles.acceptBtnTextPrimary
                      : styles.acceptBtnTextSecondary
                  }
                >
                  Accept Job
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pillAvailable: {
    backgroundColor: '#E6F4EA',
  },
  pillBusy: {
    backgroundColor: '#FDE8E8',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotAvailable: {
    backgroundColor: colors.green,
  },
  dotBusy: {
    backgroundColor: colors.danger,
  },
  statusText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  textAvailable: {
    color: colors.green,
  },
  textBusy: {
    color: colors.danger,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statCard: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  statValue: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  section: {
    marginTop: 14,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  activeJobCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.green,
    borderRadius: 10,
    padding: 16,
  },
  upNextCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  jobRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subRow: {
    marginTop: 8,
  },
  jobTitle: {
    flex: 1,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginRight: 8,
  },
  activeJobCode: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.green,
  },
  jobCode: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  jobMeta: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  completeBtn: {
    backgroundColor: colors.green,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  completeBtnText: {
    color: colors.white,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  acceptBtnPrimary: {
    backgroundColor: colors.green,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  acceptBtnTextPrimary: {
    color: colors.white,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  acceptBtnSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  acceptBtnTextSecondary: {
    color: colors.textPrimary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
});
