import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { ApiError, apiRequest } from "../../services/apiClient";
import { auth, ensureFirebaseReady } from "../../services/firebase";
import { PadelUser } from "../users/usersTypes";

export const authStateChanged = (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback);

export async function loadUserProfile(): Promise<PadelUser> {
  ensureFirebaseReady();
  return apiRequest<PadelUser>("/admin/me");
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
  if (error instanceof ApiError && error.status === 403) {
    return "No tienes permisos para acceder al panel de administracion.";
  }
  if (error instanceof ApiError && error.status === 401) {
    return "Sesion no autorizada. Vuelve a iniciar sesion.";
  }
  if (error instanceof ApiError) {
    return error.message;
  }

  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Email o contrasena incorrectos.";
  }
  if (code.includes("too-many-requests")) {
    return "Demasiados intentos. Espera unos minutos antes de volver a probar.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "No se pudo iniciar sesion.";
}
