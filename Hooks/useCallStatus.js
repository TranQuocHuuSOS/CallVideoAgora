import axios from "axios";

export const fetchCallStatus= async(callId)=>{
    try {
        const response = await axios.get(`https://5adc-117-2-164-127.ngrok-free.app/api/call/status/${callId}`)
        return response.data;
    } catch (error) {
        console.error("Error fetching call status", error);
        throw error
    }
}