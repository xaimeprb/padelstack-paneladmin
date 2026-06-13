import { FormEvent, useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Community } from "../communities/communitiesService";
import {
  PadelUser,
  REAL_ROLE_OPTIONS,
  UserUpdateInput,
  displayNameForUser,
  editableRole,
  roleLabel,
} from "./usersTypes";

const CONFIRM_TEXT = "QUITAR SUPERADMIN";
const ROLE_CONFIRM_TEXT = "CAMBIAR ROL";

export type UserFormValues = UserUpdateInput & {
  role: string;
  active: boolean;
};

export function UserFormModal({
  user,
  currentUid,
  communities,
  onClose,
  onSave,
}: {
  user: PadelUser;
  currentUid?: string;
  communities: Community[];
  onClose: () => void;
  onSave: (values: UserFormValues) => Promise<void>;
}) {
  const [username, setUsername] = useState(user.username || "");
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [communityId, setCommunityId] = useState(user.communityId || "");
  const [unitDisplay, setUnitDisplay] = useState(user.unitDisplay || "");
  const [role, setRole] = useState(editableRole(user.role));
  const [active, setActive] = useState(user.active !== false);
  const [selfConfirmation, setSelfConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCommunity = communities.find((community) => community.communityId === communityId);
  const unitOptions = selectedCommunity?.units || [];
  const roleChanged = role !== (user.role || "NEIGHBOR");
  const activeChanged = active !== (user.active !== false);
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
      await onSave({
        username,
        firstName,
        lastName,
        phone,
        communityId,
        unitDisplay,
        role,
        active,
      });
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
          <span>Nombre actual</span>
          <strong>{displayNameForUser(user)}</strong>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Usuario</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <label className="field">
            <span>Telefono</span>
            <input value={phone} onChange={(event) => setPhone(event.target.value)} />
          </label>
          <label className="field">
            <span>Nombre</span>
            <input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
          </label>
          <label className="field">
            <span>Apellidos</span>
            <input value={lastName} onChange={(event) => setLastName(event.target.value)} />
          </label>
          <label className="field">
            <span>Comunidad</span>
            <select
              value={communityId}
              onChange={(event) => {
                setCommunityId(event.target.value);
                setUnitDisplay("");
              }}
            >
              <option value="">Sin comunidad</option>
              {communities.map((community) => (
                <option key={community.communityId} value={community.communityId}>
                  {community.name || community.communityId}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Vivienda</span>
            {unitOptions.length ? (
              <select value={unitDisplay} onChange={(event) => setUnitDisplay(event.target.value)} disabled={!communityId}>
                <option value="">Sin vivienda</option>
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            ) : (
              <input value={unitDisplay} onChange={(event) => setUnitDisplay(event.target.value)} disabled={!communityId} />
            )}
          </label>
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

        {(roleChanged || activeChanged) && (
          <div className="notice notice--info">
            Los cambios de permisos y estado quedan registrados en auditoria.
          </div>
        )}

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
                ? "Estas intentando retirarte permisos de Superadmin o desactivar tu usuario."
                : "Confirma el cambio de rol antes de guardar."}
            </small>
          </label>
        )}

        {error && <div className="notice notice--error">{error}</div>}
      </form>
    </Modal>
  );
}
