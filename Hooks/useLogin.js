import React, {useState} from 'react';
import axios from 'axios';
const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const login = async (userName, password, fcmToken) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `https://5adc-117-2-164-127.ngrok-free.app/api/auth/login`,
        {
          userName: userName,
          password: password,
          fcmToken: fcmToken
        },
      );
      return response.data;
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  return {login, loading, error};
};
export default useLogin;
