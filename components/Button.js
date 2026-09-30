import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';
 
// variant: 'primary' (blue) | 'purple' | 'green' | 'outline'
export default function Button({ title, onPress, variant = 'primary', style }) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.text, variant === 'outline' && styles.outlineText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
 
const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  purple: { backgroundColor: colors.purple },
  green: { backgroundColor: colors.green },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    color: colors.white,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  outlineText: { color: colors.textSecondary },
});