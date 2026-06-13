import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import { authStateChanged, loadUserProfile, loginWithEmail, logout as firebaseLogout, normalizeAuthError } from "./authService";
import { PadelUser } from "../users/usersTypes";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "forbidden";

type AuthContextValue = {
  firebaseUser: User | null;
  profile: PadelUser | null;
  status: AuthStatus;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const FORBIDDEN_MESSAGE = "No tienes permisos para acceder al panel de administración.";

function canAccessPanel(profile: PadelUser | null) {
  return profile?.role === "SUPERADMIN" && profile.active !== false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PadelUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const validateUser = useCallback(async (user: User | null) => {
    setFirebaseUser(user);
    setError(null);

    if (!user) {
      setProfile(null);
      setStatus("unauthenticated");
      return;
    }

    setStatus("loading");
    try {
      const nextProfile = await loadUserProfile(user.uid);
      setProfile(nextProfile);
      if (canAccessPanel(nextProfile)) {
        setStatus("authenticated");
      } else {
        setStatus("forbidden");
        setError(FORBIDDEN_MESSAGE);
      }
    } catch (nextError) {
      setProfile(null);
      setStatus("forbidden");
      setError(normalizeAuthError(nextError));
    }
  }, []);

  useEffect(() => {
    const unsubscribe = authStateChanged((user) => {
      void validateUser(user);
    });
    return unsubscribe;
  }, [validateUser]);

  const login = useCallback(async (email: string, password: string) => {
    setStatus("loading");
    setError(null);
    try {
      const user = await loginWithEmail(email.trim(), password);
      const nextProfile = await loadUserProfile(user.uid);
      if (!canAccessPanel(nextProfile)) {
        await firebaseLogout();
        setFirebaseUser(null);
        setProfile(null);
        setStatus("forbidden");
        setError(FORBIDDEN_MESSAGE);
        throw new Error(FORBIDDEN_MESSAGE);
      }
      setFirebaseUser(user);
      setProfile(nextProfile);
      setStatus("authenticated");
    } catch (nextError) {
      const message = normalizeAuthError(nextError);
      setStatus("unauthenticated");
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    await firebaseLogout();
    setFirebaseUser(null);
    setProfile(null);
    setStatus("unauthenticated");
  }, []);

  const refreshProfile = useCallback(async () => {
    await validateUser(firebaseUser);
  }, [firebaseUser, validateUser]);

  const value = useMemo(
    () => ({ firebaseUser, profile, status, error, login, logout, refreshProfile }),
    [firebaseUser, profile, status, error, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
