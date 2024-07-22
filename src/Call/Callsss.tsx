import React, {useRef, useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  ChannelProfileType,
  RtcSurfaceView,
  AudienceLatencyLevelType,
} from 'react-native-agora';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import getToken from '../../Hooks/useGetToken';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import startCall from '../../Hooks/useStartCall';
interface Resolution {
  width: number;
  height: number;
}
const audienceLatencyLevel = AudienceLatencyLevelType.UltraLowLatency;
const appId = '525b25314fab435ea7ae75cf2dfde684';
const channelName = 'Testing';
const Call = () => {
  const route = useRoute();
  const {userData}:any = route.params;
  const uid = userData._id;
  const callerId = userData._id;
  const calleeId ="667762680cd574491a3f9987";
  const agoraEngineRef = useRef<IRtcEngine>();
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);
  const [message, setMessage] = useState('');
  const [isHost, setIsHost] = useState(true);
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(false);
  const [isCameraMuted, setIsCameraMuted] = useState(false);
  const [token, setToken]= useState("");
  useEffect(() => {
    setupVideoSDKEngine();
  }, []);

  const setupVideoSDKEngine = async () => {
    try {
      if (Platform.OS === 'android') {
        const permissions = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ]);
        if (
          !(
            permissions['android.permission.RECORD_AUDIO'] === 'granted' &&
            permissions['android.permission.CAMERA'] === 'granted'
          )
        ) {
          throw new Error('Camera or microphone permission denied');
        }
      }
      const agoraEngine = createAgoraRtcEngine();
      agoraEngineRef.current = agoraEngine;

      agoraEngine.initialize({
        appId: appId,
      });

      agoraEngine.enableVideo();
      agoraEngine.enableAudio();

      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          setTimeout(() => {
            showMessage('Successfully joined the channel: ' + channelName);
            setIsJoined(true);
          }, 0);
        },
        onUserJoined: (_connection, Uid) => {
          setTimeout(() => {
            showMessage('Remote user ' + Uid + ' has joined');
            setRemoteUid(Uid);
          }, 0);
        },
        onUserOffline: (_connection, Uid) => {
          setTimeout(() => {
            showMessage('Remote user ' + Uid + ' has left the channel');
            setRemoteUid(0);
          }, 0);
        },
      });

      // Ensure that the preview is started after the engine is initialized
      agoraEngine.startPreview();
    } catch (e) {
      console.log(e);
    }
  };

  const join = async () => {
    if (isJoined) {
      return;
    }
    try {
      console.log("uid lấy từ params", uid);
      
      const dataCall = await getToken(uid, channelName);
      console.log("lấy token khi join ", dataCall.token);
      setToken(dataCall.token)
      const callId = await startCall(callerId, calleeId, channelName);
      console.log("Call started successfully:", callId);
      const agoraEngine = agoraEngineRef.current;
      if (!agoraEngine) {
        throw new Error('Agora engine is not initialized');
      }

      agoraEngine.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );

      const videoConfig = {
        bitrate: 200000,
        frameRate: 10,
        resolution: {width: 320, height: 240} as Resolution,
      };
      agoraEngine.setVideoEncoderConfiguration(videoConfig);

      if (isHost) {
        agoraEngine.joinChannel(token, channelName, uid, {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        });
      } else {
        agoraEngine.joinChannel(token, channelName, uid, {
          clientRoleType: ClientRoleType.ClientRoleAudience,
          audienceLatencyLevel: audienceLatencyLevel,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const leave = () => {
    try {
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      showMessage('Left the channel');
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
  const MuteMicrophone = () => {
    const agoraEngine = agoraEngineRef.current;
    if (agoraEngine) {
      agoraEngine.muteLocalAudioStream(!isMicrophoneMuted);
      setIsMicrophoneMuted(!isMicrophoneMuted);
      showMessage(
        isMicrophoneMuted ? 'Microphone unmuted' : 'Microphone muted',
      );
    }
  };
  const MuteCamera = () => {
    const agoraEngine = agoraEngineRef.current;
    if (agoraEngine) {
      agoraEngine.muteLocalVideoStream(!isCameraMuted);
      setIsCameraMuted(!isCameraMuted);
      showMessage(isCameraMuted ? 'Camera Muted' : 'Camera Muted');
    }
  };
  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.scroll}>
        {isJoined ? (
          <>
            <Text>Local user UID: {uid}</Text>
            <RtcSurfaceView style={styles.videoView} canvas={{uid: 0}} />
          </>
        ) : (
          <Text>Join a channel</Text>
        )}
        {isJoined && remoteUid !== 0 ? (
          <>
            <Text>Remote user UID: {remoteUid}</Text>
            <RtcSurfaceView
              style={styles.videoView}
              canvas={{uid: remoteUid}}
            />
          </>
        ) : (
          <Text>Waiting for remote users to join</Text>
        )}
        <Text>{message}</Text>
      </View>

      <View style={styles.btnContainer}>
        {isJoined ? (
          <View style={styles.buttonContainer}>
            <Pressable onPress={switchCamera} style={styles.iconButton}>
              <Ionicons name="camera-reverse" size={20} color={'white'} />
            </Pressable>
            <Pressable onPress={MuteCamera} style={styles.iconButton}>
              <FontAwesome5
                name={!isCameraMuted ? 'video' : 'video-slash'}
                size={20}
                color={'white'}
              />
            </Pressable>
            <Pressable onPress={MuteMicrophone} style={styles.iconButton}>
              <FontAwesome
                name={!isMicrophoneMuted ? 'microphone' : 'microphone-slash'}
                size={20}
                color={'white'}
              />
            </Pressable>
            <Pressable
              onPress={leave}
              style={[styles.iconButton, {backgroundColor: 'red'}]}>
              <MaterialIcons name="phone-missed" size={25} color={'white'} />
            </Pressable>
          </View>
        ) : (
          <>
            <Text onPress={join} style={styles.button}>
              Join Channel
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );

  function showMessage(msg: string) {
    setMessage(msg);
  }
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 25,
    paddingVertical: 4,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#0055cc',
    margin: 5,
  },
  main: {flex: 1, alignItems: 'center'},
  scroll: {backgroundColor: '#ddeeff', width: '100%', flex: 8.5},
  scrollContainer: {alignItems: 'center'},
  videoView: {width: '100%', height: '50%'},
  btnContainer: {
    justifyContent: 'space-between',
    width: '100%',
    flex: 1.5,
    height: '100%',
    backgroundColor: '#333333',
  },
  head: {fontSize: 20},
  buttonContainer: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    backgroundColor: '#4a4a4a',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    width: 60,
    height: 60,
  },
});

export default Call;
