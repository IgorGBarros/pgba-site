// src/services/api.ts
import axios, { AxiosError } from "axios";

// 🔧 lê a variável de ambiente e garante formato correto
const rawBaseUrl =(import.meta as any).env?.VITE_API_BASE_URL || "https://gestao-estoque-k5vy.onrender.com";

// garante que o baseURL termine com `/api/`
// garante que termina com /api/
const finalBaseUrl = rawBaseUrl.replace(/\/$/, "") + "/api/";

// 🔐 token helpers
export function getToken(): string | null {
  return localStorage.getItem("auth_token");
}
export function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}
export function clearToken() {
  localStorage.removeItem("auth_token");
}

// 🚀 cria instância principal do Axios
export const api = axios.create({
  baseURL: finalBaseUrl,
  headers: { "Content-Type": "application/json" },
});

// 🔁 Interceptador REQUEST — adiciona Token automaticamente
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    // AxiosHeaders tem o método set, use-o
    if (config.headers?.set) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

// 🚨 Interceptador RESPONSE — trata erros comuns
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken();
      console.warn("Sessão expirada, redirecionando para login.");
      window.location.href = "/auth";
      return Promise.reject(error);
    }

    if (error.response) {
      const detail =
        (error.response.data as any)?.detail ||
        (error.response.data as any)?.error ||
        error.message;
      console.error(`API Error ${error.response.status}:`, detail);
    } else {
      console.error("Erro de rede ou CORS:", error.message);
    }

    return Promise.reject(error);
  }
);