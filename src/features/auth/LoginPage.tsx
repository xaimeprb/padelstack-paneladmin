import { FormEvent, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { firebaseMissingConfig, isFirebaseConfigured } from "../../services/firebase";
import { useAuth } from "./useAuth";

export function LoginPage() {
  const { login, status, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  if (status === "authenticated") {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (nextError) {
      setLocalError(nextError instanceof Error ? nextError.message : "No se pudo iniciar sesión.");
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-icon">
            <ShieldCheck size={26} />
          </div>
          <h1>PADELSTACK Admin</h1>
          <p>Acceso exclusivo SUPERADMIN</p>
        </div>

        {!isFirebaseConfigured && (
          <div className="notice notice--warning">
            Falta configurar Firebase en `.env`: {firebaseMissingConfig.join(", ")}.
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-stack">
          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="superadmin@padelstack.com"
              required
            />
          </label>
          <label className="field">
            <span>Contraseña</span>
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {localError && <div className="notice notice--error">{localError}</div>}

          <Button type="submit" disabled={status === "loading"} className="button--wide">
            <LockKeyhole size={18} />
            {status === "loading" ? "Validando..." : "Entrar al panel"}
          </Button>
        </form>
      </section>
    </main>
  );
}
