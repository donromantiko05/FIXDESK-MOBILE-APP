import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import AdminOverviewScreen from '../screens/AdminOverviewScreen';
import AdminTicketsScreen from '../screens/AdminTicketsScreen';
import TechniciansScreen from '../screens/TechniciansScreen';
import EquipmentScreen from '../screens/EquipmentScreen';
 
const Tab = createBottomTabNavigator();
 
const ICONS = {
  Overview: 'grid-outline',
  Tickets: 'ticket-outline',
  Techs: 'people-outline',
  Equip: 'construct-outline',
};
 
// Admin tabs. TODO: show a different tab set for employees / technicians.
export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.placeholder,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Overview" component={AdminOverviewScreen} />
      <Tab.Screen name="Tickets" component={AdminTicketsScreen} />
      <Tab.Screen name="Techs" component={TechniciansScreen} />
      <Tab.Screen name="Equip" component={EquipmentScreen} />
    </Tab.Navigator>
  );
}