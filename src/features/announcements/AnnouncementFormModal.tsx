import { FormEvent, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Community } from "../communities/communitiesService";
import { Announcement, AnnouncementInput } from "./announcementsService";

function toDatetimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  return date.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

export function AnnouncementFormModal({
  announcement,
  communities,
  onClose,
  onSave,
}: {
  announcement?: Announcement | null;
  communities: Community[];
  onClose: () => void;
  onSave: (values: AnnouncementInput) => Promise<void>;
}) {
  const [title, setTitle] = useState(announcement?.title || "");
  const [content, setContent] = useState(announcement?.content || "");
  const [communityId, setCommunityId] = useState(announcement?.communityId || communities[0]?.communityId || "");
  const [visible, setVisible] = useState(announcement?.visible !== false);
  const [publishedAt, setPublishedAt] = useState(toDatetimeLocal(announcement?.publishedAt));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        announcementId: announcement?.announcementId,
        communityId,
        title,
        content,
        visible,
        publishedAt: fromDatetimeLocal(publishedAt),
      });
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "No se pudo guardar el anuncio.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={announcement ? "Editar anuncio" : "Crear anuncio"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="announcement-form" disabled={saving}>
            {saving ? "Guardando..." : "Guardar anuncio"}
          </Button>
        </>
      }
    >
      <form id="announcement-form" className="form-stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>Comunidad</span>
          <select value={communityId} onChange={(event) => setCommunityId(event.target.value)} required>
            <option value="" disabled>
              Selecciona comunidad
            </option>
            {communities.map((community) => (
              <option key={community.communityId} value={community.communityId}>
                {community.name || community.communityId}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Titulo</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={120} />
        </label>
        <label className="field">
          <span>Contenido</span>
          <textarea value={content} onChange={(event) => setContent(event.target.value)} required rows={6} />
        </label>
        <label className="field">
          <span>Fecha de publicacion</span>
          <input type="datetime-local" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)} />
        </label>
        <label className="toggle-row">
          <input type="checkbox" checked={visible} onChange={(event) => setVisible(event.target.checked)} />
          <span>Visible para la app movil</span>
        </label>
        {error && <div className="notice notice--error">{error}</div>}
      </form>
    </Modal>
  );
}
