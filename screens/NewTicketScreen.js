import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import Button from '../components/Button';
import { createTicket } from '../firebase/tickets';
import { auth } from '../firebase/config';

const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'HVAC',
  'IT Equipment',
  'Furniture',
  'Other',
];

const STEPS = [
  { id: 1, label: 'Category' },
  { id: 2, label: 'Location' },
  { id: 3, label: 'Details' },
  { id: 4, label: 'Review' },
];

export default function NewTicketScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('Electrical');
  const [location, setLocation] = useState('Fl. 3, East Wing');
  const [description, setDescription] = useState(
    'Outlet near desk 14 sparked briefly when I plugged in my laptop...'
  );
  const [hasPhoto, setHasPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (loading) return;

    if (!selectedCategory) {
      setError('Please select a category.');
      return;
    }
    if (!location.trim()) {
      setError('Please enter the location / area.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a problem description.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Determine priority estimation automatically based on category / description
      let priority = 'medium';
      const text = `${selectedCategory} ${description}`.toLowerCase();
      if (
        text.includes('spark') ||
        text.includes('smoke') ||
        text.includes('fire') ||
        text.includes('flood') ||
        text.includes('server')
      ) {
        priority = 'high';
      } else if (
        text.includes('hinge') ||
        text.includes('blinds') ||
        text.includes('chair')
      ) {
        priority = 'low';
      }

      // Title summary
      const titleSummary =
        description.length > 35
          ? `${description.slice(0, 32).trim()}...`
          : description;

      const newTicket = await createTicket({
        title: titleSummary,
        fullTitle: `${titleSummary} — ${location}`,
        category: selectedCategory,
        location: location.trim(),
        description: description.trim(),
        priority,
        status: 'assigned',
        reporter: auth.currentUser?.displayName || 'Maria Reyes (Accounting)',
        photos: hasPhoto
          ? [
              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80',
            ]
          : [],
      });

      navigation.navigate('TicketSubmitted', { ticket: newTicket });
    } catch (e) {
      Alert.alert('Error', 'Could not create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Ticket</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step Indicator */}
          <View style={styles.stepper}>
            {STEPS.map((step) => {
              const isActive = step.id === 1;
              return (
                <View key={step.id} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      isActive ? styles.stepCircleActive : styles.stepCircleInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNum,
                        isActive ? styles.stepNumActive : styles.stepNumInactive,
                      ]}
                    >
                      {step.id}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isActive ? styles.stepLabelActive : styles.stepLabelInactive,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Select Category */}
          <Text style={styles.label}>Select Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryBtn,
                    isSelected && styles.categoryBtnSelected,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryBtnText,
                      isSelected && styles.categoryBtnTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Location / Area */}
          <Text style={styles.label}>Location / Area</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Fl. 3, East Wing"
            placeholderTextColor={colors.placeholder}
          />

          {/* Problem Description */}
          <Text style={styles.label}>Problem Description</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the issue in detail..."
            placeholderTextColor={colors.placeholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Attach Photo Box */}
          <TouchableOpacity
            style={[styles.photoBox, hasPhoto && styles.photoBoxActive]}
            onPress={() => setHasPhoto(!hasPhoto)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={hasPhoto ? 'checkmark-circle' : 'camera-outline'}
              size={26}
              color={hasPhoto ? colors.green : colors.textSecondary}
            />
            <Text
              style={[styles.photoText, hasPhoto && styles.photoTextActive]}
            >
              {hasPhoto ? '1 photo attached (tap to remove)' : 'Attach photo'}
            </Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Submit Button */}
          <Button
            title={loading ? 'Submitting…' : 'Submit Ticket'}
            onPress={handleSubmit}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepCircleInactive: {
    backgroundColor: colors.border,
  },
  stepNum: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
  },
  stepNumActive: {
    color: colors.white,
  },
  stepNumInactive: {
    color: colors.textSecondary,
  },
  stepLabel: {
    fontSize: typography.size.xs,
  },
  stepLabelActive: {
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  stepLabelInactive: {
    color: colors.textSecondary,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryBtn: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryBtnSelected: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  categoryBtnText: {
    fontSize: typography.size.sm,
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
  categoryBtnTextSelected: {
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
  input: {
    height: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: typography.size.sm,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 96,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: typography.size.sm,
    color: colors.textPrimary,
  },
  photoBox: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBoxActive: {
    borderColor: colors.green,
    borderStyle: 'solid',
    backgroundColor: '#F3F9F5',
  },
  photoText: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginTop: 6,
  },
  photoTextActive: {
    color: colors.green,
    fontWeight: typography.weight.semibold,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.size.xs,
    marginTop: 8,
  },
  submitBtn: {
    marginTop: 20,
  },
});
