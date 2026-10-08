import { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import useTheme from '../contexts/ThemeContext';
 
// Labeled input. Set secureTextEntry to get the show/hide eye icon.
export default function AppTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
}) {
  const [hidden, setHidden] = useState(secureTextEntry);
  const { colors: themeColors } = useTheme();
 
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: themeColors.textSecondary }]}>{label}</Text> : null}
      <View style={[styles.box, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
        <RNTextInput
          style={[styles.input, { color: themeColors.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={themeColors.placeholder}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden(!hidden)} hitSlop={10}>
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
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
    height: 50,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
});
