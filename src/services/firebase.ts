import { FirebaseOptions, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const rawFirebaseConfig = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
};

const firebaseConfig: FirebaseOptions = {
  apiKey: rawFirebaseConfig.VITE_FIREBASE_API_KEY || "missing-api-key",
  authDomain: rawFirebaseConfig.VITE_FIREBASE_AUTH_DOMAIN || "missing.firebaseapp.com",
  projectId: rawFirebaseConfig.VITE_FIREBASE_PROJECT_ID || "missing-project",
  storageBucket: rawFirebaseConfig.VITE_FIREBASE_STORAGE_BUCKET || "missing.appspot.com",
  messagingSenderId: rawFirebaseConfig.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: rawFirebaseConfig.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000",
};

export const firebaseMissingConfig = Object.entries(rawFirebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const isFirebaseConfigured = firebaseMissingConfig.length === 0;

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export function ensureFirebaseReady() {
  if (!isFirebaseConfigured) {
    throw new Error(
      `Falta configuración Firebase: ${firebaseMissingConfig.join(", ")}. Revisa .env.`,
    );
  }
}
