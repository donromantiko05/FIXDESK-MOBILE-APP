import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PhotoAttachment from '../components/PhotoAttachment';
import { uploadImageToFirebase } from '../firebase/storage';
import { createNotification } from '../firebase/messaging';
import { updateTicket } from '../firebase/tickets';
import colors from '../constants/colors';
import typography from '../constants/typography';

const STATUS_OPTIONS = [
  'In Progress',
  'Parts Ordered',
  'On Hold',
  'Completed',
];

export default function TechStatusScreen({ navigation, route }) {
  const ticketCode = route?.params?.ticketCode || 'TCK-2091';
  const defaultStatus = route?.params?.defaultStatus || 'In Progress';

  const [selectedStatus, setSelectedStatus] = useState(defaultStatus);
  const [workLog, setWorkLog] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const uploadedPhotos = await Promise.all(photos.map((uri) => uploadImageToFirebase(uri, 'work-photos')));
      const statusValue = {
        'In Progress': 'in_progress',
        'Parts Ordered': 'parts_ordered',
        'On Hold': 'on_hold',
        Completed: 'completed',
      }[selectedStatus];
      const ticket = await updateTicket(ticketCode, {
        status: statusValue,
        workLog: workLog.trim(),
        completionPhotos: uploadedPhotos,
        ...(statusValue === 'completed' ? { completedAt: new Date() } : {}),
        timelineEntry: {
          title: selectedStatus,
          subtitle: workLog.trim() || 'Status updated by technician',
          time: new Date().toLocaleString(),
          done: true,
        },
      });

      if (ticket.reporterId) {
        const userId = ticket.reporterId;
        createNotification({
          userId,
          title: selectedStatus === 'completed' ? 'Repair completed' : 'Ticket update',
          description: `${ticketCode}: ${selectedStatus}${workLog.trim() ? ' - ' + workLog.trim() : ''}`,
          ticketCode,
          ticketId: ticket.id,
        }).catch((notificationError) => {
          if (__DEV__) console.warn('Ticket updated, but notification failed:', notificationError?.message);
        });
      }
      Alert.alert(
        'Status Updated',
        `Ticket ${ticketCode} status was saved as "${selectedStatus}".`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Main');
              }
            },
          },
        ]
      );
    } catch (submitError) {
      setError('Could not save the ticket update. Check Firebase access and try again.');
      if (__DEV__) console.warn('Ticket status update failed:', submitError?.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Main');
    }
  };

  return (
    <View style={styles.backdrop}>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.safeSheet} edges={['bottom']}>
          {/* Top handle pill */}
          <View style={styles.handleBar} />

          <ScrollView
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Update Status</Text>
              <Text style={styles.ticketCode}>{ticketCode}</Text>
            </View>

            {/* Radio options container */}
            <View style={styles.radioContainer}>
              {STATUS_OPTIONS.map((status, index) => {
                const isSelected = selectedStatus === status;
                const isLast = index === STATUS_OPTIONS.length - 1;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.radioRow,
                      !isLast && styles.radioDivider,
                    ]}
                    onPress={() => setSelectedStatus(status)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.radioLabel,
                        isSelected && styles.radioLabelSelected,
                      ]}
                    >
                      {status}
                    </Text>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Work Log / Resolution Notes */}
            <Text style={styles.fieldLabel}>Work Log / Resolution Notes</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe what was done..."
              placeholderTextColor={colors.placeholder}
              value={workLog}
              onChangeText={setWorkLog}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Attach completion photo */}
            <PhotoAttachment photos={photos} onChange={setPhotos} />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Buttons */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? 'Submitting…' : 'Submit Update'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 34, 51, 0.45)',
    justifyContent: 'flex-end',
  },
  keyboardWrap: {
    width: '100%',
  },
  safeSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  ticketCode: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  radioContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  radioDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  radioLabel: {
    fontSize: typography.size.sm,
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
  radioLabelSelected: {
    fontWeight: typography.weight.semibold,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.green,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.green,
  },
  fieldLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  textArea: {
    minHeight: 80,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: typography.size.sm,
    color: colors.textPrimary,
  },
  attachPhotoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    backgroundColor: '#F1F4F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    paddingVertical: 16,
    gap: 8,
  },
  attachPhotoBoxActive: {
    borderColor: colors.green,
    borderStyle: 'solid',
    backgroundColor: '#E6F4EA',
  },
  attachPhotoText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },
  attachPhotoTextActive: {
    color: colors.green,
    fontWeight: typography.weight.semibold,
  },
  error: {
    color: colors.danger,
    fontSize: typography.size.xs,
    marginTop: 8,
  },
  submitBtn: {
    backgroundColor: colors.green,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelBtnText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
});
