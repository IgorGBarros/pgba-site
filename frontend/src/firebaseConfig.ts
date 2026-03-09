// src/firebaseConfig.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  Auth 
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOr4MnI-k7ViDfEuGqeyVSpsMmU7JUgZM",
  authDomain: "plataforma-financeira-29a27.firebaseapp.com",
  projectId: "plataforma-financeira-29a27",
  storageBucket: "plataforma-financeira-29a27.firebasestorage.app",
  messagingSenderId: "461985552736",
  appId: "1:461985552736:web:227065bc459298fcc7a605",
  measurementId: "G-8YLH4GBPK5",
};

// Inicializa o app Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Configura o Firebase Authentication
const auth: Auth = getAuth(app);

// Configura os provedores de autenticação
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Função para autenticar com o Google usando pop-up
export const signInWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

// Função para autenticar com o GitHub usando pop-up
export const signInWithGithub = async () => {
  return await signInWithPopup(auth, githubProvider);
};

// Função para autenticar com o Google usando redirecionamento
export const signInWithGoogleRedirect = () => {
  signInWithRedirect(auth, googleProvider);
};

// Função para autenticar com o GitHub usando redirecionamento
export const signInWithGithubRedirect = () => {
  signInWithRedirect(auth, githubProvider);
};

// Configura o Firestore
const db: Firestore = getFirestore(app);

// Exporte as funções e os provedores para que possam ser usados em outras partes do aplicativo
// Exporte as funções e os provedores para que possam ser usados em outras partes do aplicativo
export { auth, googleProvider, githubProvider, db, signInWithPopup };