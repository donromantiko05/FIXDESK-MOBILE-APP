import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import Button from '../components/Button';
import PhotoAttachment from '../components/PhotoAttachment';
import { createTicket } from '../firebase/tickets';
import { uploadImageToFirebase } from '../firebase/storage';
import { createNotification } from '../firebase/messaging';
import { scoreTicketPriority } from '../constants/priorityRules';
import { auth } from '../firebase/config';

const CATEGORIES = ['Electrical', 'Plumbing', 'HVAC', 'IT Equipment', 'Furniture', 'Other'];
const STEPS = [{ id: 1, label: 'Category' }, { id: 2, label: 'Location' }, { id: 3, label: 'Details' }, { id: 4, label: 'Review' }];

export default function NewTicketScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('Electrical');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (loading) return;
    if (!selectedCategory || !location.trim() || !description.trim()) {
      setError('Select a category and enter a location and description.');
      return;
    }

    setError('');
    setLoading(true);
    const priorityResult = scoreTicketPriority({ category: selectedCategory, description });
    const userId = auth.currentUser?.uid || null;

    try {
      const photoUrls = await Promise.all(photos.map((uri) => uploadImageToFirebase(uri)));
      const ticket = await createTicket({
        title: description.length > 35 ? description.slice(0, 32).trim() + '...' : description,
        fullTitle: description.slice(0, 48).trim() + ' - ' + location.trim(),
        category: selectedCategory,
        location: location.trim(),
        description: description.trim(),
        priority: priorityResult.priority,
        priorityScore: priorityResult.score,
        priorityFactors: priorityResult.factors,
        status: 'evaluating',
        reporter: auth.currentUser?.displayName || auth.currentUser?.email || 'Employee',
        reporterId: userId,
        photos: photoUrls,
      });

      if (userId) {
        createNotification({
          userId,
          title: 'Ticket received',
          description: ticket.code + ' is being evaluated.',
          ticketCode: ticket.code,
          ticketId: ticket.id,
        }).catch((err) => {
          if (__DEV__) console.warn('Ticket was created, but its notification failed:', err?.message);
        });
      }
      navigation.navigate('TicketSubmitted', { ticket });
    } catch (err) {
      setError('Ticket could not be fully saved. Check Firebase access and try again.');
      if (__DEV__) console.warn('Ticket submission failed:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Ticket</Text><View style={styles.headerRightSpacer} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.stepper}>
            {STEPS.map((step) => {
              const active = step.id === 1;
              return <View key={step.id} style={styles.stepItem}><View style={[styles.stepCircle, active ? styles.stepCircleActive : styles.stepCircleInactive]}><Text style={[styles.stepNum, active ? styles.stepNumActive : styles.stepNumInactive]}>{step.id}</Text></View><Text style={[styles.stepLabel, active ? styles.stepLabelActive : styles.stepLabelInactive]}>{step.label}</Text></View>;
            })}
          </View>
          <Text style={styles.label}>Select Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => {
              const selected = selectedCategory === category;
              return <TouchableOpacity key={category} style={[styles.categoryBtn, selected && styles.categoryBtnSelected]} onPress={() => setSelectedCategory(category)}><Text style={[styles.categoryBtnText, selected && styles.categoryBtnTextSelected]}>{category}</Text></TouchableOpacity>;
            })}
          </View>
          <Text style={styles.label}>Location / Area</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g. Fl. 3, East Wing" placeholderTextColor={colors.placeholder} />
          <Text style={styles.label}>Problem Description</Text>
          <TextInput style={styles.textArea} value={description} onChangeText={setDescription} placeholder="Describe the issue in detail..." placeholderTextColor={colors.placeholder} multiline numberOfLines={4} textAlignVertical="top" />
          <PhotoAttachment photos={photos} onChange={setPhotos} />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Button title={loading ? 'Submitting...' : 'Submit Ticket'} onPress={handleSubmit} style={styles.submitBtn} disabled={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.textPrimary },
  headerRightSpacer: { width: 32 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 4 },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  stepCircleActive: { backgroundColor: colors.primary },
  stepCircleInactive: { backgroundColor: colors.border },
  stepNum: { fontSize: 11, fontWeight: typography.weight.bold },
  stepNumActive: { color: colors.white },
  stepNumInactive: { color: colors.textSecondary },
  stepLabel: { fontSize: typography.size.xs },
  stepLabelActive: { fontWeight: typography.weight.bold, color: colors.primary },
  stepLabelInactive: { color: colors.textSecondary },
  label: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.textSecondary, marginBottom: 8, marginTop: 14 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryBtn: { width: '48.5%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, height: 46, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  categoryBtnSelected: { borderColor: colors.primary, borderWidth: 1.5 },
  categoryBtnText: { fontSize: typography.size.sm, color: colors.textPrimary, fontWeight: typography.weight.medium },
  categoryBtnTextSelected: { color: colors.primary, fontWeight: typography.weight.bold },
  input: { height: 48, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, fontSize: typography.size.sm, color: colors.textPrimary },
  textArea: { minHeight: 96, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, fontSize: typography.size.sm, color: colors.textPrimary },
  errorText: { color: colors.danger, fontSize: typography.size.xs, marginTop: 8 },
  submitBtn: { marginTop: 20 },
});
