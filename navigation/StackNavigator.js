import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetLinkSentScreen from '../screens/ResetLinkSentScreen';
import TabNavigator from './TabNavigator';
import TicketDetailScreen from '../screens/TicketDetailScreen';
import DetailsScreen from '../screens/DetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import PriorityRulesScreen from '../screens/PriorityRulesScreen';
import NewTicketScreen from '../screens/NewTicketScreen';
import TicketSubmittedScreen from '../screens/TicketSubmittedScreen';
import TicketsListScreen from '../screens/TicketsListScreen';
import EmployeeHomeScreen from '../screens/EmployeeHomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ScanEquipmentScreen from '../screens/ScanEquipmentScreen';
import TechQueueScreen from '../screens/TechQueueScreen';
import TechStatusScreen from '../screens/TechStatusScreen';
import TechHistoryScreen from '../screens/TechHistoryScreen';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      {/* Auth screens */}
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ResetLinkSent" component={ResetLinkSentScreen} options={{ headerShown: false }} />

      {/* Main Tab Navigator */}
      <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />

      {/* Direct screen routes */}
      <Stack.Screen name="EmployeeHome" component={EmployeeHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NewTicket" component={NewTicketScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TicketSubmitted" component={TicketSubmittedScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Details" component={DetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PriorityRules" component={PriorityRulesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TicketsList" component={TicketsListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ScanEquipment" component={ScanEquipmentScreen} options={{ headerShown: false }} />

      {/* Technician routes */}
      <Stack.Screen name="TechQueue" component={TechQueueScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TechStatus" component={TechStatusScreen} options={{ headerShown: false, presentation: 'transparentModal', animation: 'fade' }} />
      <Stack.Screen name="TechHistory" component={TechHistoryScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
