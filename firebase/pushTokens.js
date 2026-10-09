import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './config';

const tokenKey = (userId) => `fixdesk.pushToken.${userId}`;
const tokenDocumentId = (token) => encodeURIComponent(token);

export const registerPushToken = async (userId) => {
  if (!userId || Platform.OS === 'web') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'FixDesk updates',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  if (!permission.granted) return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  if (!projectId) throw new Error('Link this app to an EAS project and set its projectId before registering push notifications.');

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  const id = tokenDocumentId(token);
  const previousId = await AsyncStorage.getItem(tokenKey(userId));
  await setDoc(doc(db, 'users', userId, 'pushTokens', id), {
    token,
    platform: Platform.OS,
    updatedAt: serverTimestamp(),
  });
  if (previousId && previousId !== id) {
    await deleteDoc(doc(db, 'users', userId, 'pushTokens', previousId));
  }
  await AsyncStorage.setItem(tokenKey(userId), id);
  return token;
};

export const removePushToken = async (userId) => {
  if (!userId) return;
  const id = await AsyncStorage.getItem(tokenKey(userId));
  if (!id) return;
  await deleteDoc(doc(db, 'users', userId, 'pushTokens', id));
  await AsyncStorage.removeItem(tokenKey(userId));
};
