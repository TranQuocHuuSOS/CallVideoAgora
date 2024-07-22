import axios from "axios";
const getToken = async(uid,channelName)=>{
    try {
        const response = await axios.post("https://5adc-117-2-164-127.ngrok-free.app/api/agora/token",{
            uid,
            channelName
        })
        return response.data
    } catch (error) {
        console.error("Error fetching token", error);
        return null
    }
}
export default getToken