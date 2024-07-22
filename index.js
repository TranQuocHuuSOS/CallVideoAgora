/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import messaging from '@react-native-firebase/messaging';
import {name as appName} from './app.json';
import {ALERT_TYPE, Toast} from 'react-native-alert-notification';
import { navigate } from './RootNavigation';


messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
    if (remoteMessage.notification.title=="Incoming Call") {
    Toast.show({
      type: ALERT_TYPE.INFO,
      title: `${remoteMessage.notification.title}`,
      textBody: `${remoteMessage.notification.body}`,
    });
    
    navigate('IncomingCall', remoteMessage.data)
  }
  });
  messaging().onMessage(async remoteMessage => {
    if (remoteMessage.notification.title=="Incoming Call") {
    Toast.show({
      type: ALERT_TYPE.INFO,
      title: `${remoteMessage.notification.title}`,
      textBody: `${remoteMessage.notification.body}`,
    });
   
    navigate("IncomingCall", remoteMessage.data)
  }
  })
AppRegistry.registerComponent(appName, () => App);
