// src/hooks/useAxios.ts
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const useAxios = () => {
  const navigate = useNavigate();

  const axiosInstance = axios.create({
    baseURL: "https://blockvote.site/api",
  });

  useEffect(() => {
    // Add response interceptor on mount
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;

        if (status === 401) {
          // Unauthorized – clear local storage and redirect
          localStorage.removeItem("adminToken");
          localStorage.removeItem("deviceId");
          navigate("/login"); // ✅ React Router navigate
        }

        return Promise.reject(error);
      }
    );

    // Clean up interceptor when component unmounts
    return () => {
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  return axiosInstance;
};

export default useAxios;
