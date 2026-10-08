import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import useTheme from '../contexts/ThemeContext';

const ROLE_TABS = {
  employee: [
    ['Home', 'home-outline', 'Home'],
    ['Report', 'add-circle-outline', 'Report'],
    ['Tickets', 'document-text-outline', 'Tickets'],
    ['Scan', 'qr-code-outline', 'Scan'],
    ['Alerts', 'notifications-outline', 'Alerts'],
  ],
  admin: [
    ['Overview', 'grid-outline', 'Overview'],
    ['AdminTickets', 'ticket-outline', 'Tickets'],
    ['Techs', 'people-outline', 'Techs'],
    ['Equip', 'construct-outline', 'Equipment'],
  ],
  technician: [
    ['Queue', 'document-text-outline', 'Queue'],
    ['Scan', 'qr-code-outline', 'Scan'],
    ['History', 'pulse-outline', 'History'],
    ['Status', 'person-outline', 'Status'],
  ],
};

export default function RoleBottomBar({ role, activeTab, navigation }) {
  const { colors: themeColors } = useTheme();
  const tabs = ROLE_TABS[role] || ROLE_TABS.employee;

  return (
    <View style={[styles.bar, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}>
      {tabs.map(([route, icon, label]) => {
        const active = route === activeTab;
        const activeIcon = active ? icon.replace('-outline', '') : icon;
        return (
          <TouchableOpacity
            key={route}
            style={styles.tab}
            onPress={() => navigation.navigate('Main', { screen: route })}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            <Ionicons name={activeIcon} size={19} color={active ? themeColors.primary : themeColors.textSecondary} />
            <Text style={[styles.label, { color: active ? themeColors.primary : themeColors.textSecondary }, active && styles.activeLabel]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 1 },
  label: { fontSize: 11, color: colors.textSecondary },
  activeLabel: { color: colors.primary, fontWeight: '600' },
});
