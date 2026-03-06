// services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api", // Ajuste para o IP/Porta do seu Django
});

// Opcional: Interceptor para lidar com Token Expirado (Refresh)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirou -> Desloga o usuário
      localStorage.removeItem("@NaturaStock:token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);