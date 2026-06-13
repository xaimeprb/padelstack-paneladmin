import { FormEvent, useEffect, useMemo, useState } from "react";
import { Save, Search } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Loading } from "../../components/ui/Loading";
import { useAuth } from "../auth/useAuth";
import { Community, listCommunities } from "../communities/communitiesService";
import { listStatutes, saveStatute, Statute } from "./statutesService";

export function StatutesPage() {
  const { profile } = useAuth();
  const [statutes, setStatutes] = useState<Statute[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState("");
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState(1);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [nextStatutes, nextCommunities] = await Promise.all([listStatutes(), listCommunities()]);
      setStatutes(nextStatutes);
      setCommunities(nextCommunities);
      const firstCommunity = selectedCommunityId || nextStatutes[0]?.communityId || nextCommunities[0]?.communityId || "";
      setSelectedCommunityId(firstCommunity);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "No se pudieron cargar estatutos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const selectedStatute = useMemo(
    () => statutes.find((statute) => statute.communityId === selectedCommunityId),
    [statutes, selectedCommunityId],
  );

  useEffect(() => {
    setTitle(selectedStatute?.title || "Estatutos de la comunidad");
    setVersion(selectedStatute?.version || 1);
    setContent(selectedStatute?.content || "");
  }, [selectedStatute, selectedCommunityId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCommunityId) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await saveStatute({
        communityId: selectedCommunityId,
        title,
        content,
        version,
        updatedByUid: profile?.uid,
      });
      setMessage("Estatutos guardados correctamente.");
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "No se pudieron guardar los estatutos.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1>Gestion de estatutos</h1>
          <p>Modelo detectado: documentos de texto en {"`statutes/{communityId}`"}.</p>
        </div>
      </header>

      <div className="notice notice--info">
        No se detecto Storage ni PDF para estatutos; se edita `title`, `content` y `version` como espera la app/API actual.
      </div>

      {loading ? (
        <Loading label="Cargando estatutos" />
      ) : error ? (
        <div className="notice notice--error">{error}</div>
      ) : communities.length ? (
        <form className="editor-layout" onSubmit={handleSubmit}>
          <aside className="editor-sidebar">
            <label className="search-field">
              <Search size={17} />
              <select value={selectedCommunityId} onChange={(event) => setSelectedCommunityId(event.target.value)}>
                {communities.map((community) => (
                  <option key={community.communityId} value={community.communityId}>
                    {community.name || community.communityId}
                  </option>
                ))}
              </select>
            </label>
            <div className="detail-grid">
              <span>Documento</span>
              <strong>{selectedStatute ? "Existe" : "Sin crear"}</strong>
              <span>Actualizado</span>
              <strong>{selectedStatute?.updatedAt || "Sin fecha"}</strong>
              <span>Actualizado por</span>
              <strong>{selectedStatute?.updatedByUid || "Sin dato"}</strong>
            </div>
          </aside>
          <section className="editor-panel">
            <label className="field">
              <span>Titulo</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label className="field">
              <span>Version</span>
              <input
                type="number"
                min={1}
                value={version}
                onChange={(event) => setVersion(Number(event.target.value))}
                required
              />
            </label>
            <label className="field">
              <span>Contenido</span>
              <textarea rows={18} value={content} onChange={(event) => setContent(event.target.value)} required />
            </label>
            {message && <div className="notice notice--success">{message}</div>}
            <Button type="submit" disabled={saving}>
              <Save size={17} />
              {saving ? "Guardando..." : "Guardar estatutos"}
            </Button>
          </section>
        </form>
      ) : (
        <EmptyState title="Sin comunidades" message="No se pueden editar estatutos hasta que exista al menos una comunidad." />
      )}
    </div>
  );
}
