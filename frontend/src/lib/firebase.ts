import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const apiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Firebase API key não configurada. Adicione VITE_FIREBASE_API_KEY nas variáveis de ambiente."
      );
    }
    app = initializeApp({
      apiKey,
      authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "",
      projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "",
      storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "",
    });
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }
  return authInstance;
}

export function getGoogleProvider(): GoogleAuthProvider {
  if (!googleProviderInstance) {
    googleProviderInstance = new GoogleAuthProvider();
  }
  return googleProviderInstance;
}
