import { LogOut, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";
import { useAuth } from "../../features/auth/useAuth";
import { displayNameForUser } from "../../features/users/usersTypes";

export function Topbar() {
  const { profile, logout, refreshProfile } = useAuth();

  return (
    <header className="topbar">
      <div>
        <strong>Panel de administracion</strong>
        <span>Datos sincronizados de forma segura.</span>
      </div>
      <div className="topbar-actions">
        <Button variant="secondary" type="button" onClick={() => void refreshProfile()}>
          <RefreshCw size={16} />
          Refrescar sesion
        </Button>
        <div className="user-pill">
          <span>{displayNameForUser(profile ?? {})}</span>
          <small>{profile?.email}</small>
        </div>
        <Button variant="ghost" type="button" onClick={() => void logout()} aria-label="Cerrar sesion">
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  );
}
