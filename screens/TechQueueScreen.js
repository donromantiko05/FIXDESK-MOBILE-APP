import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import typography from '../constants/typography';
import { PriorityBadge } from '../components/TicketCard';

export default function TechQueueScreen({ navigation }) {
  const [techStatus, setTechStatus] = useState('Available');

  // Stats matching design
  const stats = [
    { label: 'Assigned Today', value: '4' },
    { label: 'In Progress', value: '1' },
    { label: 'Completed Week', value: '11' },
    { label: 'Avg Repair Time', value: '2.3h' },
  ];

  // Active Job
  const [activeJob, setActiveJob] = useState({
    id: '2',
    code: 'TCK-2087',
    title: 'Flickering light, meeting B',
    priority: 'medium',
    timeElapsed: '41 min elapsed',
  });

  // Up Next Queue
  const [upNextJobs, setUpNextJobs] = useState([
    {
      id: '5',
      code: 'TCK-2094',
      title: 'Server room overheating',
      priority: 'critical',
      location: 'Fl. 1, Server Room',
      isPrimaryAction: true,
    },
    {
      id: '1',
      code: 'TCK-2091',
      title: 'AC not cooling',
      priority: 'high',
      location: 'Fl. 3, East Wing',
      isPrimaryAction: false,
    },
  ]);

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
        onPress: () => {
          // Promote job to active
          setActiveJob({
            id: job.id,
            code: job.code,
            title: job.title,
            priority: job.priority,
            timeElapsed: 'Just started',
          });
          setUpNextJobs((prev) => prev.filter((j) => j.code !== job.code));
        },
      },
    ]);
  };

  const handleToggleStatus = () => {
    setTechStatus((prev) => (prev === 'Available' ? 'Busy' : 'Available'));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Queue</Text>
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

          {upNextJobs.map((job) => (
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
                  job.isPrimaryAction
                    ? styles.acceptBtnPrimary
                    : styles.acceptBtnSecondary
                }
                onPress={() => handleAcceptJob(job)}
                activeOpacity={0.85}
              >
                <Text
                  style={
                    job.isPrimaryAction
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
