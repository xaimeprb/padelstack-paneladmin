import { useEffect, useMemo, useState } from "react";
import { EyeOff, Pencil, Plus, Search } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { Loading } from "../../components/ui/Loading";
import { Column, Table } from "../../components/ui/Table";
import { includesSearch } from "../../services/dataHelpers";
import { useAuth } from "../auth/useAuth";
import { Community, listCommunities } from "../communities/communitiesService";
import { Announcement, AnnouncementInput, hideAnnouncement, listAnnouncements, saveAnnouncement } from "./announcementsService";
import { AnnouncementFormModal } from "./AnnouncementFormModal";

export function AnnouncementsPage() {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [search, setSearch] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [visibility, setVisibility] = useState("");
  const [editing, setEditing] = useState<Announcement | null | undefined>(undefined);
  const [confirmHide, setConfirmHide] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [nextAnnouncements, nextCommunities] = await Promise.all([listAnnouncements(), listCommunities()]);
      setAnnouncements(nextAnnouncements);
      setCommunities(nextCommunities);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "No se pudieron cargar anuncios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () =>
      announcements.filter((announcement) => {
        const matchesSearch =
          !search ||
          includesSearch(announcement.title, search) ||
          includesSearch(announcement.content, search) ||
          includesSearch(announcement.announcementId, search);
        const matchesCommunity = !communityId || announcement.communityId === communityId;
        const matchesVisibility =
          !visibility || (visibility === "visible" ? announcement.visible !== false : announcement.visible === false);
        return matchesSearch && matchesCommunity && matchesVisibility;
      }),
    [announcements, search, communityId, visibility],
  );

  const columns: Column<Announcement>[] = [
    { key: "title", header: "Titulo", render: (announcement) => announcement.title || "Sin titulo" },
    { key: "content", header: "Contenido", render: (announcement) => <span className="line-clamp">{announcement.content || "Sin contenido"}</span> },
    { key: "community", header: "Comunidad", render: (announcement) => announcement.communityId || "Sin comunidad" },
    { key: "published", header: "Publicado", render: (announcement) => announcement.publishedAt || "Sin fecha" },
    { key: "author", header: "Autor", render: (announcement) => announcement.createdByName || announcement.createdByUid || "Sin autor" },
    {
      key: "visible",
      header: "Estado",
      render: (announcement) => <Badge tone={announcement.visible === false ? "danger" : "success"}>{announcement.visible === false ? "Oculto" : "Visible"}</Badge>,
    },
    {
      key: "actions",
      header: "Acciones",
      render: (announcement) => (
        <div className="row-actions">
          <Button variant="secondary" type="button" onClick={() => setEditing(announcement)}>
            <Pencil size={15} />
            Editar
          </Button>
          <Button variant="danger" type="button" onClick={() => setConfirmHide(announcement)} disabled={announcement.visible === false}>
            <EyeOff size={15} />
            Ocultar
          </Button>
        </div>
      ),
    },
  ];

  async function handleSave(values: AnnouncementInput) {
    await saveAnnouncement(values, profile);
    await load();
  }

  async function handleHide() {
    if (!confirmHide) return;
    setError(null);
    try {
      await hideAnnouncement(confirmHide.announcementId);
      setConfirmHide(null);
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "No se pudo ocultar el anuncio.");
      setConfirmHide(null);
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1>Gestion de anuncios</h1>
          <p>Crea, edita y oculta anuncios respetando campos de `announcements`.</p>
        </div>
        <Button type="button" onClick={() => setEditing(null)}>
          <Plus size={17} />
          Nuevo anuncio
        </Button>
      </header>

      <section className="toolbar">
        <label className="search-field">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar anuncio" />
        </label>
        <select value={communityId} onChange={(event) => setCommunityId(event.target.value)}>
          <option value="">Todas las comunidades</option>
          {communities.map((community) => (
            <option key={community.communityId} value={community.communityId}>
              {community.name || community.communityId}
            </option>
          ))}
        </select>
        <select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
          <option value="">Todos</option>
          <option value="visible">Visibles</option>
          <option value="hidden">Ocultos</option>
        </select>
        <Button variant="secondary" type="button" onClick={() => void load()}>
          Refrescar
        </Button>
      </section>

      {loading ? (
        <Loading label="Cargando anuncios" />
      ) : error ? (
        <div className="notice notice--error">{error}</div>
      ) : (
        <Table
          columns={columns}
          rows={filtered}
          getRowKey={(announcement) => announcement.announcementId}
          empty={<EmptyState title="Sin anuncios" message="No hay anuncios o no coinciden con los filtros." />}
        />
      )}

      {editing !== undefined && (
        <AnnouncementFormModal
          announcement={editing}
          communities={communities}
          onClose={() => setEditing(undefined)}
          onSave={handleSave}
        />
      )}

      {confirmHide && (
        <ConfirmDialog
          title="Ocultar anuncio"
          message="El endpoint actual no elimina fisicamente: marca el anuncio como no visible para no romper historico."
          confirmLabel="Ocultar"
          danger
          onCancel={() => setConfirmHide(null)}
          onConfirm={() => void handleHide()}
        />
      )}
    </div>
  );
}
