// FirebaseService.js
import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid} from 'react-native';
// Function to request notification permissions
export const requestNotificationPermission = async () => {
  try {
    // Yêu cầu quyền thông báo
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
    } else {
      console.log('Notification permission denied');
    }
  } catch (error) {
    console.log('Error requesting user permission:', error);
  }
};

// Function to get FCM token
export const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};