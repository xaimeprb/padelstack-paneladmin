import { FormEvent, useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { PadelUser, REAL_ROLE_OPTIONS, displayNameForUser, editableRole, roleLabel } from "./usersTypes";

const CONFIRM_TEXT = "QUITAR SUPERADMIN";
const ROLE_CONFIRM_TEXT = "CAMBIAR ROL";

export function UserFormModal({
  user,
  currentUid,
  onClose,
  onSave,
}: {
  user: PadelUser;
  currentUid?: string;
  onClose: () => void;
  onSave: (values: { role: string; active: boolean }) => Promise<void>;
}) {
  const [role, setRole] = useState(editableRole(user.role));
  const [active, setActive] = useState(user.active !== false);
  const [selfConfirmation, setSelfConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roleChanged = role !== (user.role || "NEIGHBOR");
  const isSelfDemotion = currentUid === user.uid && (role !== "SUPERADMIN" || !active);
  const requiredConfirmation = isSelfDemotion ? CONFIRM_TEXT : roleChanged ? ROLE_CONFIRM_TEXT : "";

  const canSubmit = useMemo(() => {
    if (!requiredConfirmation) return true;
    return selfConfirmation === requiredConfirmation;
  }, [requiredConfirmation, selfConfirmation]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({ role, active });
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "No se pudo guardar el usuario.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Editar usuario"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="user-form" disabled={!canSubmit || saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </>
      }
    >
      <form id="user-form" className="form-stack" onSubmit={handleSubmit}>
        <div className="detail-grid">
          <span>UID</span>
          <strong>{user.uid}</strong>
          <span>Email</span>
          <strong>{user.email || "Sin email"}</strong>
          <span>Nombre</span>
          <strong>{displayNameForUser(user)}</strong>
        </div>

        <label className="field">
          <span>Rol</span>
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            {REAL_ROLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {roleLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <label className="toggle-row">
          <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
          <span>Usuario activo</span>
        </label>

        <div className="notice notice--info">
          El backend actual usa `ADMIN` para administracion comunitaria. `PRESIDENT` no se ofrece como rol guardable porque romperia `Role.valueOf`.
        </div>

        {requiredConfirmation && (
          <label className="field field--danger">
            <span>Confirmacion fuerte</span>
            <input
              value={selfConfirmation}
              onChange={(event) => setSelfConfirmation(event.target.value)}
              placeholder={requiredConfirmation}
            />
            <small>
              {isSelfDemotion
                ? "Estas intentando quitarte permisos de SUPERADMIN o desactivar tu usuario."
                : "Estas cambiando un rol. Esta accion puede dar o retirar permisos reales."}
            </small>
          </label>
        )}

        {error && <div className="notice notice--error">{error}</div>}
      </form>
    </Modal>
  );
}
