import axios from "axios";
import router from "../router";

const api = axios.create({
  baseURL: "http://localhost:8080/",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⬅️ Перехват ответов — проверяем на 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("401 Unauthorized — токен, вероятно, устарел.");
      alert("Токен устарел");
      // Очистка токенов
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      clearInterval(localStorage.getItem("refreshTimer"));

      // Перенаправляем на логин
      router.push("/authorization");
    }

    return Promise.reject(error);
  }
);

export default api;
