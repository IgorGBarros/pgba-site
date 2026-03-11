// services/api.ts

import axios from "axios";

// Pega a URL do ambiente, garantindo que termine limpa
const rawBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || "https://gestao-estoque-k5vy.onrender.com";

const finalBaseUrl = rawBaseUrl.endsWith("/api") 
  ? `${rawBaseUrl}/` 
  : rawBaseUrl.endsWith("/api/") 
    ? rawBaseUrl 
    : `${rawBaseUrl}/api/`;

export const api = axios.create({
  baseURL: finalBaseUrl,
  headers: { "Content-Type": "application/json" },
});

// 🧠 interceptador global
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});