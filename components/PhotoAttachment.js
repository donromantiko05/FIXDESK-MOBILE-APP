import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import { pickImageFromLibrary, takePhotoWithCamera } from '../firebase/storage';

export default function PhotoAttachment({ photos = [], onChange, maxPhotos = 3 }) {
  const [busy, setBusy] = useState(false);

  const addPhoto = async (capture) => {
    if (photos.length >= maxPhotos || busy) return;
    setBusy(true);
    try {
      const uri = capture ? await takePhotoWithCamera() : await pickImageFromLibrary();
      if (uri) onChange([...photos, uri]);
    } catch (error) {
      Alert.alert('Photo unavailable', error?.message || 'Could not access photos.');
    } finally {
      setBusy(false);
    }
  };

  const showOptions = () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Photo limit', 'You can attach up to ' + maxPhotos + ' photos.');
      return;
    }
    Alert.alert('Attach Photo', 'Choose a photo source.', [
      { text: 'Take Photo', onPress: () => addPhoto(true) },
      { text: 'Choose from Library', onPress: () => addPhoto(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View>
      <TouchableOpacity style={[styles.button, photos.length > 0 && styles.buttonActive]} onPress={showOptions} activeOpacity={0.8}>
        <Ionicons name={busy ? 'hourglass-outline' : 'camera-outline'} size={24} color={photos.length ? colors.green : colors.textSecondary} />
        <Text style={[styles.label, photos.length > 0 && styles.labelActive]}>
          {busy ? 'Opening photos...' : photos.length ? photos.length + ' photo(s) attached - tap to add' : 'Attach photo'}
        </Text>
      </TouchableOpacity>
      {photos.length > 0 && (
        <View style={styles.previewRow}>
          {photos.map((uri, index) => (
            <View key={uri + index} style={styles.previewWrap}>
              <Image source={{ uri }} style={styles.preview} />
              <TouchableOpacity style={styles.remove} onPress={() => onChange(photos.filter((_, i) => i !== index))} accessibilityRole="button" accessibilityLabel="Remove photo">
                <Ionicons name="close-circle" size={22} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 8, paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  buttonActive: { borderColor: colors.green, borderStyle: 'solid', backgroundColor: '#F3F9F5' },
  label: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 6 },
  labelActive: { color: colors.green, fontWeight: typography.weight.semibold },
  previewRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  previewWrap: { position: 'relative' },
  preview: { width: 64, height: 64, borderRadius: 7, backgroundColor: colors.border },
  remove: { position: 'absolute', top: -7, right: -7, backgroundColor: colors.white, borderRadius: 11 },
});
