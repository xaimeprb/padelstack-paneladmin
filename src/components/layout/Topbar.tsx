import { LogOut, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";
import { useAuth } from "../../features/auth/useAuth";
import { displayNameForUser } from "../../features/users/usersTypes";

export function Topbar() {
  const { profile, logout, refreshProfile } = useAuth();

  return (
    <header className="topbar">
      <div>
        <strong>Panel de administración</strong>
        <span>Datos sincronizados con Firestore y endpoints disponibles</span>
      </div>
      <div className="topbar-actions">
        <Button variant="secondary" type="button" onClick={() => void refreshProfile()}>
          <RefreshCw size={16} />
          Refrescar sesión
        </Button>
        <div className="user-pill">
          <span>{displayNameForUser(profile ?? {})}</span>
          <small>{profile?.email}</small>
        </div>
        <Button variant="ghost" type="button" onClick={() => void logout()} aria-label="Cerrar sesión">
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  );
}
