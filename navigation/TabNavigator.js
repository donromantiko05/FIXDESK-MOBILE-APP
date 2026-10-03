import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import useAuth from '../hooks/useAuth';

// Admin screens
import AdminOverviewScreen from '../screens/AdminOverviewScreen';
import AdminTicketsScreen from '../screens/AdminTicketsScreen';
import TechniciansScreen from '../screens/TechniciansScreen';
import EquipmentScreen from '../screens/EquipmentScreen';

// Employee screens
import EmployeeHomeScreen from '../screens/EmployeeHomeScreen';
import NewTicketScreen from '../screens/NewTicketScreen';
import TicketsListScreen from '../screens/TicketsListScreen';
import ScanEquipmentScreen from '../screens/ScanEquipmentScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  // Admin tabs
  Overview: 'grid-outline',
  AdminTickets: 'ticket-outline',
  Techs: 'people-outline',
  Equip: 'construct-outline',

  // Employee tabs (matching designs)
  Home: 'home-outline',
  Report: 'add-circle-outline',
  Tickets: 'document-text-outline',
  Scan: 'qr-code-outline',
  Alerts: 'notifications-outline',
};

export default function TabNavigator() {
  const { isAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.placeholder,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconName = ICONS[route.name] || 'ellipse-outline';
          // Use solid icon if active and available
          const focusedName = focused
            ? iconName.replace('-outline', '')
            : iconName;
          return <Ionicons name={focusedName} size={size} color={color} />;
        },
      })}
    >
      {isAdmin ? (
        <>
          <Tab.Screen name="Overview" component={AdminOverviewScreen} />
          <Tab.Screen name="AdminTickets" component={AdminTicketsScreen} options={{ tabBarLabel: 'Tickets' }} />
          <Tab.Screen name="Techs" component={TechniciansScreen} />
          <Tab.Screen name="Equip" component={EquipmentScreen} />
        </>
      ) : (
        <>
          <Tab.Screen name="Home" component={EmployeeHomeScreen} />
          <Tab.Screen name="Report" component={NewTicketScreen} />
          <Tab.Screen name="Tickets" component={TicketsListScreen} />
          <Tab.Screen name="Scan" component={ScanEquipmentScreen} />
          <Tab.Screen name="Alerts" component={NotificationsScreen} />
        </>
      )}
    </Tab.Navigator>
  );
}