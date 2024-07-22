import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './src/Login/Login';
import Call from './src/Call/Call';
import IncomingCall from './src/Call/IncomingCall';
import {AlertNotificationRoot} from 'react-native-alert-notification';
import messaging from '@react-native-firebase/messaging';
import {navigationRef, navigate} from './RootNavigation';
import CallReceiver from './src/Call/CallReceiver';
import Sound from 'react-native-sound';
const Stack = createNativeStackNavigator();
const callSound = new Sound(
  require('./assets/sound/ring.mp3'),
  Sound.MAIN_BUNDLE,
  error => {
    if (error) {
      console.log('Error loading sound file:', error);
      return;
    }
  },
);
const App = () => {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      handleIncomingCall(remoteMessage);
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      handleIncomingCall(remoteMessage);
    });

    return unsubscribe;
  }, []);
  const handleIncomingCall = (remoteMessage: any) => {
    const {notification, data} = remoteMessage;
    if (notification.title === 'Incoming Call') {
      navigate('IncomingCall', {...data});
    }
  };
  return (
    <AlertNotificationRoot>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Call" component={Call} />
          <Stack.Screen name="CallReceiver" component={CallReceiver} options={{ headerShown: false }}/>
          <Stack.Screen
            name="IncomingCall"
            component={IncomingCall}
            initialParams={{callSound: callSound}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AlertNotificationRoot>
  );
};

export default App;

const styles = StyleSheet.create({});
