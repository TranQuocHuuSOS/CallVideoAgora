import axios from "axios";

export const endCall = async(callId) =>{
    console.log("call Id", callId);
    try {
        const response = await axios.post('https://5adc-117-2-164-127.ngrok-free.app/api/call/end-call',{callId});
        console.log('Call ended successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error ending call:', error);
        throw error;
    }
}

export const updateCallStatus = async (callId, status) => {
    try {
      const response = await axios.post('https://5adc-117-2-164-127.ngrok-free.app/api/call/update-call-status', { callId, status });
      console.log('Call status updated successfully:', response.data);
      return response.data; 
    } catch (error) {
      console.error('Error updating call status:', error);
      throw error; 
    }
  };