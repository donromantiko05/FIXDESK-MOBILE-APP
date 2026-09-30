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
 
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.box}>
        <RNTextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
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
              color={colors.textSecondary}
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