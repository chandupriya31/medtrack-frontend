import axios from "axios";
import EncryptedStorage from "react-native-encrypted-storage";

const api = axios.create({
  baseURL: "https://medtrack.srinidhi.co/api",
});

api.interceptors.request.use(
  async (config) => {
    const authData = await EncryptedStorage.getItem("authData");

    if (authData) {
      const parsedData = JSON.parse(authData);
      const token = parsedData?.accessToken;

      console.log("Parsed Token:", token);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const authData = await EncryptedStorage.getItem("authData");

        if (!authData) throw new Error("No auth data");

        const parsedData = JSON.parse(authData);
        const refreshToken = parsedData?.refreshToken;

        if (!refreshToken) throw new Error("No refresh token");

        const response = await axios.post(
          "http://192.168.31.156:5001/api/refresh-token",
          { refreshToken }
        );

        const newAccessToken = response.data.accessToken;

        await EncryptedStorage.setItem(
          "authData",
          JSON.stringify({
            ...parsedData,
            accessToken: newAccessToken,
          })
        );
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (err) {
        await EncryptedStorage.removeItem("authData");
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;