import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "./useAuth";
import { Button } from "../../components/ui/Button";
import { Loading } from "../../components/ui/Loading";

export function ProtectedRoute() {
  const { status, profile, logout } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <Loading label="Validando sesión y permisos" fullScreen />;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (status === "forbidden" || profile?.role !== "SUPERADMIN") {
    return (
      <main className="auth-shell">
        <section className="auth-card auth-card--compact">
          <div className="auth-icon auth-icon--danger">
            <ShieldAlert size={24} />
          </div>
          <h1>Acceso restringido</h1>
          <p>No tienes permisos para acceder al panel de administración.</p>
          <Button onClick={() => void logout()}>Cerrar sesión</Button>
        </section>
      </main>
    );
  }

  return <Outlet />;
}
