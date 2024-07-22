import {useRoute} from '@react-navigation/native';
import React, {useRef, useState, useEffect} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {PermissionsAndroid, Platform} from 'react-native';
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  ChannelProfileType,
} from 'react-native-agora';
import getToken from '../../Hooks/useGetToken';
import startCall from '../../Hooks/useStartCall';
import { fetchCallStatus } from '../../Hooks/useCallStatus';
import { navigate } from '../../RootNavigation';
import { endCall } from '../../Hooks/callAPI';
const appId = 'dc540b5b6c544e60b09e776423f10f82';
const channelName = 'Testing';
const uid = Math.floor(Math.random() * 1000000000);
const Call = () => {
  const route = useRoute();
  const {userData}: any = route.params;
  const callerId = userData._id;
  const calleeId = '66987275960c36dd115564e7';
  const agoraEngineRef = useRef<IRtcEngine>();
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);
  // const [message, setMessage] = useState('');
  const [token, setToken]= useState("");
  const [callId, setCallId]= useState("");
  useEffect(() => {
    setupVideoSDKEngine();
  }, []);
  const setupVideoSDKEngine = async () => {
    try {
      if (Platform.OS === 'android') {
        await getPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      agoraEngine.initialize({
        appId: appId,
      });
      agoraEngine.enableVideo();
      agoraEngine.enableAudio();
      agoraEngineRef.current?.startPreview();
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          // showMessage('Successfully joined the channel: ' + channelName);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          // showMessage('Remote user ' + Uid + ' has joined');
          setRemoteUid(Uid);
        },
        onUserOffline: (_connection, Uid) => {
          // showMessage('Remote user ' + Uid + ' has left the channel');
          setRemoteUid(0);
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  const join = async () => {
    if (isJoined) {
      return;
    }
    try {
      console.log('uid lấy từ params', uid);

      const tokenData = await getToken(uid, channelName);
      console.log("toke ", tokenData.token);
      
      setToken(tokenData.token);
      const callId = await startCall(callerId, calleeId, channelName);
      setCallId(callId);
      console.log('Call started successfully:', callId);
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );

      agoraEngineRef.current?.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
      setTimeout(async () => {
        const callStatus = await fetchCallStatus(callId);
        if (callStatus.callStatus === 'ended' || callStatus.callStatus === 'declined') {
          leaves();
        }
      }, 3000);
    } catch (e) {
      console.log(e);
    }
  };

  const leaves = () => {
    try {
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      navigate("Login")
    } catch (e) {
      console.log(e);
    }
  };
  const leave = async() => {
    try {
      await endCall(callId)
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      navigate("Login")
    } catch (e) {
      console.log(e);
    }
  };
  const switchCamera = () => {
    try {
      agoraEngineRef.current?.switchCamera();
      // showMessage('Switched camera');
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <SafeAreaView style={styles.main}>
      {!isJoined ? (
        <View style={{flex: 1}}>
          <View style={styles.btnContainer}>
            <Text onPress={join} style={styles.button}>
              Join Channel
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContainer}>
          {isJoined ? (
            <RtcSurfaceView style={styles.videoView} canvas={{uid: 0}} />
          ) : null}
          {isJoined && remoteUid !== 0 ? (
            <RtcSurfaceView
              style={styles.videoView}
              canvas={{uid: remoteUid}}
            />
          ) : null}
          <View style={styles.event}>
          <Text onPress={leave} style={styles.button}>
            Leave Channel
          </Text>
          <Text onPress={switchCamera} style={styles.button}>
            Switch Camera
          </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );

  // function showMessage(msg: string) {
  //   setMessage(msg);
  // }
};

const styles = StyleSheet.create({
  event:{
    flexDirection:"row"
  },
  button: {
    paddingHorizontal: 25,
    paddingVertical: 4,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#0055cc',
    margin: 5,
  },
  main: {flex: 1, alignItems: 'center'},
  scroll: {
    flex: 1,
  },
  scrollContainer: {alignItems: 'center'},
  videoView: {width: '50%', height: 200},
  btnContainer: {flexDirection: 'row', justifyContent: 'center'},
  head: {fontSize: 20},
});

const getPermission = async () => {
  if (Platform.OS === 'android') {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.CAMERA,
    ]);
  }
};

export default Call;
