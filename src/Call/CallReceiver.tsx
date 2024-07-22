import React, {useRef, useState, useEffect} from 'react';

import {Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {PermissionsAndroid, Platform} from 'react-native';

import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  ChannelProfileType,
  AudienceLatencyLevelType,
} from 'react-native-agora';
import getToken from '../../Hooks/useGetToken';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { endCall } from '../../Hooks/callAPI';
import { fetchCallStatus } from '../../Hooks/useCallStatus';
import { navigate } from '../../RootNavigation';
const appId = '525b25314fab435ea7ae75cf2dfde684';
const uid = Math.floor(Math.random() * 1000000000);
const channelName= "Testing";
const CallReceiver = ({route}: any) => {
  const {callId}: any = route.params;
  console.log('tham gia', channelName, callId);
  const agoraEngineRef = useRef<IRtcEngine>();
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);
  const [message, setMessage] = useState('');
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(false);
  const [isCameraMuted, setIsCameraMuted] = useState(false);
  const [token, setToken]= useState("");
  useEffect(() => {
    if (!isJoined) {
      join();
    }
    setupVideoSDKEngine();
    const interval = setInterval(async () => {
      try {
        const status = await fetchCallStatus(callId);
        if (status.callStatus === 'ended') {
          off();
          clearInterval(interval);
        }
       
      } catch (error) {
        console.error("Error polling call status:", error);
      }
    }, 3000);
    return () => clearInterval(interval);
  },[]);
  const setupVideoSDKEngine = async () => {
    try {
      if (Platform.OS === 'android') {
        await getPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      agoraEngine.enableVideo();
      agoraEngine.enableAudio();
      agoraEngine.initialize({
        appId: appId,
      });
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          showMessage('Successfully joined the channel: ' + channelName);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          showMessage('Remote user ' + Uid + ' has joined');
          setRemoteUid(Uid);
          setIsJoined(true); // Lưu ý chổ này nghe
        },
        onUserOffline: (_connection, Uid) => {
          showMessage('Remote user ' + Uid + ' has left the channel');
          setRemoteUid(0);
        },
      });
      agoraEngineRef.current?.startPreview();
    } catch (e) {
      console.log(e);
    }
  };
  const join = async () => {
    if (isJoined) {
      return;
    }
    try {
      const tokenData = await getToken(uid, channelName);
      
      console.log('token nè', token);
      setToken(tokenData.token)
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );
      agoraEngineRef.current?.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (e) {
      console.log(e);
    }
  };
  
  const leave = async() => {
    try {
      await endCall(callId);
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      navigate("Login")
    } catch (e) {
      console.log(e);
    }
  };
  const off = async() => {
    try {
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
      showMessage('Switched camera');
    } catch (e) {
      console.log(e);
    }
  };
  const muteMicrophone = () => {
    const agoraEngine = agoraEngineRef.current;
    if (agoraEngine) {
      agoraEngine.muteLocalAudioStream(!isMicrophoneMuted);
      setIsMicrophoneMuted(!isMicrophoneMuted);
      showMessage(
        isMicrophoneMuted ? 'Microphone unmuted' : 'Microphone muted',
      );
    }
  };
  const muteCamera = () => {
    const agoraEngine = agoraEngineRef.current;
    if (agoraEngine) {
      agoraEngine.muteLocalVideoStream(!isCameraMuted);
      setIsCameraMuted(!isCameraMuted);
      showMessage(isCameraMuted ? 'Camera Muted' : 'Camera Muted');
    }
  };
  function showMessage(msg: string) {
    setMessage(msg);
  }
 
  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.scroll}>
        {isJoined ? (
          <>
            <RtcSurfaceView style={styles.videoView} canvas={{ uid: 0 }} />
          </>
        ) : (
         <></>
        )}
        {/* {isJoined && remoteUid !== 0 ? (
          <>
            <RtcSurfaceView
              style={styles.videoView}
              canvas={{ uid: remoteUid }}
            />
          </>
        ) : (
         <></>
        )} */}
      </View>

      <View style={styles.btnContainer}>
        <Pressable
          onPress={leave}
          style={[styles.button, { backgroundColor: 'red' }]}>
          <MaterialIcons name={'call-end'} size={30} color={'white'} />
        </Pressable>
        <Pressable
          onPress={muteMicrophone}
          style={styles.button}>
          <FontAwesome5
            name={isMicrophoneMuted ? 'microphone-slash' : 'microphone'}
            size={30}
            color={'white'}
          />
        </Pressable>
        <Pressable
          onPress={muteCamera}
          style={styles.button}>
          <FontAwesome5
            name={isCameraMuted ? 'video-slash' : 'video'}
            size={30}
            color={'white'}
          />
        </Pressable>
        <Pressable
          onPress={switchCamera}
          style={styles.button}>
          <Ionicons name={'camera-reverse'} size={30} color={'white'} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 9,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoView: {
    width: '100%',
    height: 500,
  },
  button: {
    width: 60,
    height: 60,
    margin: 10,
    borderRadius: 30,
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContainer: {
    flex:1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:"black",
    width:"100%",
    padding:10
  },
});

const getPermission = async () => {
  if (Platform.OS === 'android') {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.CAMERA,
    ]);
  }
};

export default CallReceiver;
