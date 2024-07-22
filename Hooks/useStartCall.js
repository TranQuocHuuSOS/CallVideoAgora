import axios from 'axios';
const startCall = async (callerId, calleeId, channelName) => {
  console.log("Thao tác API",callerId, calleeId, channelName);
  try {
    const response = await axios.post('https://5adc-117-2-164-127.ngrok-free.app/api/call/start-call', {
      callerId, 
      calleeId, 
      channelName,  
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = response.data;
    console.log("hello ", data);
    if (data.success) {
      console.log('Call started successfully:', data.callId);
      return data.callId;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error starting call:', error);
    throw error;
  }
};
export default startCall;