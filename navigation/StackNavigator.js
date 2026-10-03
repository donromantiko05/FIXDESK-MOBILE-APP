import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetLinkSentScreen from '../screens/ResetLinkSentScreen';
import TabNavigator from './TabNavigator';
import TicketDetailScreen from '../screens/TicketDetailScreen';
import NewTicketScreen from '../screens/NewTicketScreen';
import TicketSubmittedScreen from '../screens/TicketSubmittedScreen';
import TicketsListScreen from '../screens/TicketsListScreen';
import EmployeeHomeScreen from '../screens/EmployeeHomeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ScanEquipmentScreen from '../screens/ScanEquipmentScreen';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      {/* Auth screens */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetLinkSent"
        component={ResetLinkSentScreen}
        options={{ headerShown: false }}
      />

      {/* Main Tab Navigator */}
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      {/* Direct screen routes */}
      <Stack.Screen
        name="EmployeeHome"
        component={EmployeeHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewTicket"
        component={NewTicketScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TicketSubmitted"
        component={TicketSubmittedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TicketDetail"
        component={TicketDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Details"
        component={TicketDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TicketsList"
        component={TicketsListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ScanEquipment"
        component={ScanEquipmentScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}