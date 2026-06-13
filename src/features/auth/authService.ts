import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, ensureFirebaseReady } from "../../services/firebase";
import { PadelUser } from "../users/usersTypes";

export const authStateChanged = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

export async function loadUserProfile(uid: string): Promise<PadelUser | null> {
  ensureFirebaseReady();
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as PadelUser;
  return {
    ...data,
    uid: data.uid || snapshot.id,
  };
}

export async function loginWithEmail(email: string, password: string) {
  ensureFirebaseReady();
  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export function normalizeAuthError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Email o contraseña incorrectos.";
  }
  if (code.includes("too-many-requests")) {
    return "Demasiados intentos. Espera unos minutos antes de volver a probar.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "No se pudo iniciar sesión.";
}
