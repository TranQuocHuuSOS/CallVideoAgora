import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from 'react-native';
import React, { useEffect,  useState} from 'react';
import incoming_call from '../../assets/images/incomingcall.jpg';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {endCall, updateCallStatus} from '../../Hooks/callAPI';
import {navigate} from '../../RootNavigation';
import { fetchCallStatus } from '../../Hooks/useCallStatus';
const IncomingCall = ({route}: any) => {
  const {callerId, channelName, userName, callId, callSound} = route.params;
  console.log(callerId, channelName, userName, callId, callSound);
  
  const [isIncomingCallVisible, setIsIncomingCallVisible] = useState(true);
  const [acceptedOrDeclined, setAcceptedOrDeclined] = useState(false);
  console.log('In com ming', callerId, channelName, userName, callId);

  useEffect(() => {
    if (callSound) {
      callSound.play((success:any) => {
        if (success) {
          console.log('Sound played successfully');
        } else {
          console.log('Sound did not play successfully');
        }
      });
    }
    const timeout = setTimeout(() => {
      if (!acceptedOrDeclined) {
      setIsIncomingCallVisible(false);
      stopSound();
      endCall(callId);
      navigate("Login");
      }
    }, 60000);
    const interval = setInterval(async()=>{
      const status = await fetchCallStatus(callId);
      if(status.callStatus ==="ended"){
        stopSound();
        clearInterval(interval);
        navigate("Login")
      }
    },3000)
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      stopSound();
    };
  }, [acceptedOrDeclined]);
  const stopSound = () => {
    if (callSound) {
      callSound.stop(() => {
        callSound.release();
        console.log('Sound stopped and released');
      });
    }
  };
  const onDecline = async () => {
    const status = 'declined';
    Alert.alert('Notification', 'decline pressed!!!');
    await updateCallStatus(callId, status);
    stopSound();
    setAcceptedOrDeclined(true);
    navigate("Login");
  };
  const onAccept = async () => {
    const status = 'accepted';
    Alert.alert('Notification', 'accept pressed!!!');
    await updateCallStatus(callId, status);
    stopSound();
    setAcceptedOrDeclined(true);
    navigate('CallReceiver', {callerId, channelName, userName, callId});
  };
  return (
    <View style={styles.root}>
      <ImageBackground
        source={incoming_call}
        style={styles.bg}
        resizeMode="cover">
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.phoneNumber}>HouseKeepingApp Call...</Text>
        <View style={[styles.row, {marginTop: 'auto'}]}>
          
        </View>
        <View style={styles.row}>
          {/* Decline button  */}
          <Pressable onPress={onDecline} style={styles.iconContainer}>
            <View style={styles.iconButtonContainer}>
              <AntDesign name="close" size={40} color={'white'} />
            </View>

            <Text style={styles.iconText}>Từ chối</Text>
          </Pressable>
          {/* Accept button */}
          <Pressable onPress={onAccept} style={styles.iconContainer}>
            <View
              style={[
                styles.iconButtonContainer,
                {backgroundColor: '#2e7bff', borderRadius: 50},
              ]}>
              <AntDesign name="check" size={40} color={'white'} />
            </View>

            <Text style={styles.iconText}>Chấp nhận</Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
};

export default IncomingCall;

const styles = StyleSheet.create({
  root: {
    height: '100%',
    backgroundColor: 'red',
  },
  name: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 100,
    marginBottom: 15,
  },
  phoneNumber: {
    fontSize: 20,
    color: 'white',
  },
  bg: {
    flex: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 50,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  iconText: {
    color: 'white',
    marginTop: 10,
  },
  iconButtonContainer: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 50,
    margin: 10,
  },
});
