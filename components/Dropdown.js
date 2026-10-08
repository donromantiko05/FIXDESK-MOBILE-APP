
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import useTheme from '../contexts/ThemeContext';
 
// Labeled dropdown. Tap the box to open a list, tap an option to select it.
// options: array of strings. onSelect gets the chosen string.
export default function Dropdown({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select',
}) {
  const [open, setOpen] = useState(false);
  const { colors: themeColors, isDark } = useTheme();
 
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: themeColors.textSecondary }]}>{label}</Text> : null}
 
      <TouchableOpacity
        style={[styles.box, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.value, { color: value ? themeColors.textPrimary : themeColors.placeholder }]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={themeColors.textSecondary} />
      </TouchableOpacity>
 
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        {/* Tapping the dark area closes the list */}
        <Pressable style={[styles.backdrop, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(26, 34, 51, 0.45)' }]} onPress={() => setOpen(false)}>
          {/* Empty onPress stops taps on the list from closing it */}
          <Pressable style={[styles.sheet, { backgroundColor: themeColors.surface }]} onPress={() => {}}>
            <Text style={[styles.sheetTitle, { color: themeColors.textPrimary }]}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: item === value ? themeColors.primary : themeColors.textPrimary },
                      item === value && styles.optionSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === value && (
                    <Ionicons name="checkmark" size={20} color={themeColors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
 
const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  value: { fontSize: typography.size.md, color: colors.textPrimary },
  placeholder: { color: colors.placeholder },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 34, 51, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    maxHeight: '60%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 8,
  },
  sheetTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionText: { fontSize: typography.size.md, color: colors.textPrimary },
  optionSelected: {
    color: colors.primary,
    fontWeight: typography.weight.semibold,
  },
});
