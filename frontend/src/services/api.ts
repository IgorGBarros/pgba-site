// src/services/api.ts
import axios, { AxiosError } from "axios";

const rawBaseUrl =(import.meta as any).env?.VITE_API_BASE_URL || "https://gestao-estoque-k5vy.onrender.com";

// garante que termine em /api/
const finalBaseUrl = rawBaseUrl.endsWith("/api")
  ? `${rawBaseUrl}/`
  : rawBaseUrl.endsWith("/api/")
  ? rawBaseUrl
  : `${rawBaseUrl}/api/`;

// 🔐 pega e manipula token
function getToken() {
  return localStorage.getItem("auth_token");
}

function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}

function clearToken() {
  localStorage.removeItem("auth_token");
}

// 🚀 instância principal
export const api = axios.create({
  baseURL: finalBaseUrl,
  headers: { "Content-Type": "application/json" },
});

// 🔁 Interceptador de REQUEST – adiciona Token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// 🚨 Interceptador de RESPONSE – trata erros comuns
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = "/auth"; // redireciona login
      console.error("Sessão expirada");
    } else if (error.response) {
      console.error(
        `API Error ${error.response.status}:`,
        (error.response.data as any)?.detail || error.message
      );
    } else {
      console.error("Erro de rede:", error.message);
    }
    return Promise.reject(error);
  }
);

export { getToken, setToken, clearToken };