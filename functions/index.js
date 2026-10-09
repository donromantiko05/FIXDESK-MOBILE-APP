const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const logger = require('firebase-functions/logger');

initializeApp();
const db = getFirestore();
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

exports.sendPushForNotification = onDocumentCreated('notifications/{notificationId}', async (event) => {
  const notification = event.data?.data();
  const userId = notification?.userId;
  if (!userId) return;

  const userSnapshot = await db.collection('users').doc(userId).get();
  if (!userSnapshot.exists || userSnapshot.get('preferences.pushNotifications') === false) return;

  const tokenSnapshot = await db.collection('users').doc(userId).collection('pushTokens').get();
  if (tokenSnapshot.empty) return;

  const tokens = tokenSnapshot.docs;
  for (let start = 0; start < tokens.length; start += 100) {
    const batch = tokens.slice(start, start + 100);
    const messages = batch.map((tokenDoc) => ({
      to: tokenDoc.get('token'),
      title: notification.title || 'FixDesk update',
      body: notification.description || '',
      sound: 'default',
      channelId: 'default',
      data: {
        notificationId: event.params.notificationId,
        isTicket: Boolean(notification.isTicket),
        ticketId: notification.ticketId || '',
        ticketCode: notification.ticketCode || '',
      },
    }));

    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    });
    if (!response.ok) throw new Error(`Expo Push API returned HTTP ${response.status}`);

    const result = await response.json();
    const receipts = Array.isArray(result.data) ? result.data : [result.data];
    await Promise.all(receipts.map(async (receipt, index) => {
      if (receipt?.status === 'error' && receipt?.details?.error === 'DeviceNotRegistered') {
        await batch[index].ref.delete();
      } else if (receipt?.status === 'error') {
        logger.warn('Expo push send failed', { userId, message: receipt.message });
      }
    }));
  }
});
