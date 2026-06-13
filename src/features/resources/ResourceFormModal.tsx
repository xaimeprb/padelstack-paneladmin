import { FormEvent, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Community } from "../communities/communitiesService";
import { Resource, ResourceUpdateInput } from "./resourcesService";

export function ResourceFormModal({
  resource,
  communities,
  onClose,
  onSave,
}: {
  resource: Resource;
  communities: Community[];
  onClose: () => void;
  onSave: (values: ResourceUpdateInput) => Promise<void>;
}) {
  const [name, setName] = useState(resource.name || "");
  const [communityId, setCommunityId] = useState(resource.communityId || "");
  const [type, setType] = useState(resource.type || "PADEL");
  const [reservationMode, setReservationMode] = useState(resource.reservationMode || "SLOT");
  const [slotMinutes, setSlotMinutes] = useState(String(resource.slotMinutes || 60));
  const [openTime, setOpenTime] = useState(resource.openTime || "09:00");
  const [closeTime, setCloseTime] = useState(resource.closeTime || "22:00");
  const [rulesText, setRulesText] = useState(resource.rulesText || "");
  const [active, setActive] = useState(resource.active !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name,
        communityId,
        type,
        reservationMode,
        slotMinutes: reservationMode === "SLOT" ? Number(slotMinutes) : undefined,
        openTime: reservationMode === "SLOT" ? openTime : undefined,
        closeTime: reservationMode === "SLOT" ? closeTime : undefined,
        rulesText,
        active,
      });
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "No se pudo guardar el recurso.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Editar recurso"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="resource-form" disabled={saving}>
            {saving ? "Guardando..." : "Guardar recurso"}
          </Button>
        </>
      }
    >
      <form id="resource-form" className="form-stack" onSubmit={handleSubmit}>
        <div className="detail-grid">
          <span>ID exacto</span>
          <strong>{resource.resourceId}</strong>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Nombre</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="field">
            <span>Comunidad</span>
            <select value={communityId} onChange={(event) => setCommunityId(event.target.value)} required>
              <option value="">Selecciona comunidad</option>
              {communities.map((community) => (
                <option key={community.communityId} value={community.communityId}>
                  {community.name || community.communityId}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Tipo</span>
            <select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="PADEL">Padel</option>
              <option value="MERENDERO">Merendero</option>
            </select>
          </label>
          <label className="field">
            <span>Modo de reserva</span>
            <select value={reservationMode} onChange={(event) => setReservationMode(event.target.value)}>
              <option value="SLOT">Por tramos</option>
              <option value="FULL_DAY">Dia completo</option>
            </select>
          </label>
          {reservationMode === "SLOT" && (
            <>
              <label className="field">
                <span>Duracion del tramo</span>
                <input
                  type="number"
                  min={1}
                  value={slotMinutes}
                  onChange={(event) => setSlotMinutes(event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Apertura</span>
                <input type="time" value={openTime} onChange={(event) => setOpenTime(event.target.value)} required />
              </label>
              <label className="field">
                <span>Cierre</span>
                <input type="time" value={closeTime} onChange={(event) => setCloseTime(event.target.value)} required />
              </label>
            </>
          )}
        </div>

        <label className="field">
          <span>Reglas de uso</span>
          <textarea rows={6} value={rulesText} onChange={(event) => setRulesText(event.target.value)} />
        </label>

        <label className="toggle-row">
          <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
          <span>Recurso activo</span>
        </label>

        <div className="notice notice--info">
          Desactivar un recurso bloquea nuevas reservas sin eliminar el historico.
        </div>

        {error && <div className="notice notice--error">{error}</div>}
      </form>
    </Modal>
  );
}
