import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Search } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Loading } from "../../components/ui/Loading";
import { Column, Table } from "../../components/ui/Table";
import { includesSearch } from "../../services/dataHelpers";
import { listResources, Resource } from "./resourcesService";

const CRITICAL_RESOURCE_IDS = ["PADEL_1", "MERENDERO_1"];

export function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setResources(await listResources());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "No se pudieron cargar recursos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const typeOptions = useMemo(() => Array.from(new Set(resources.map((resource) => resource.type).filter(Boolean))).sort() as string[], [resources]);
  const communityOptions = useMemo(() => Array.from(new Set(resources.map((resource) => resource.communityId).filter(Boolean))).sort() as string[], [resources]);
  const missingCritical = CRITICAL_RESOURCE_IDS.filter((id) => !resources.some((resource) => resource.resourceId === id));

  const filtered = useMemo(
    () =>
      resources.filter((resource) => {
        const matchesSearch =
          !search ||
          includesSearch(resource.resourceId, search) ||
          includesSearch(resource.name, search) ||
          includesSearch(resource.communityId, search);
        const matchesType = !type || resource.type === type;
        const matchesCommunity = !communityId || resource.communityId === communityId;
        return matchesSearch && matchesType && matchesCommunity;
      }),
    [resources, search, type, communityId],
  );

  const columns: Column<Resource>[] = [
    { key: "id", header: "ID exacto", render: (resource) => <code>{resource.resourceId}</code> },
    { key: "name", header: "Nombre", render: (resource) => resource.name || "Sin nombre" },
    { key: "type", header: "Tipo", render: (resource) => resource.type || "Sin tipo" },
    { key: "community", header: "Comunidad", render: (resource) => resource.communityId || "Sin comunidad" },
    {
      key: "active",
      header: "Estado",
      render: (resource) => <Badge tone={resource.active === false ? "danger" : "success"}>{resource.active === false ? "Inactivo" : "Activo"}</Badge>,
    },
    { key: "mode", header: "Modo", render: (resource) => resource.reservationMode || "Sin modo" },
    { key: "slot", header: "Slot", render: (resource) => (resource.slotMinutes ? `${resource.slotMinutes} min` : "Dia completo / N/A") },
    { key: "hours", header: "Horario", render: (resource) => resource.openTime || resource.closeTime ? `${resource.openTime ?? "--"} - ${resource.closeTime ?? "--"}` : "Sin horario" },
  ];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1>Gestion de recursos</h1>
          <p>Lectura via backend de `resources` respetando IDs criticos de Android.</p>
        </div>
      </header>

      {!!missingCritical.length && (
        <div className="notice notice--warning">
          <AlertTriangle size={18} />
          No se encontraron estos IDs criticos en backend admin: {missingCritical.join(", ")}.
        </div>
      )}

      <section className="toolbar">
        <label className="search-field">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar recurso" />
        </label>
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">Todos los tipos</option>
          {typeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select value={communityId} onChange={(event) => setCommunityId(event.target.value)}>
          <option value="">Todas las comunidades</option>
          {communityOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Button variant="secondary" type="button" onClick={() => void load()}>
          Refrescar
        </Button>
      </section>

      {loading ? (
        <Loading label="Cargando recursos" />
      ) : error ? (
        <div className="notice notice--error">{error}</div>
      ) : (
        <Table
          columns={columns}
          rows={filtered}
          getRowKey={(resource) => resource.resourceId}
          empty={<EmptyState title="Sin recursos" message="No hay recursos o no coinciden con los filtros." />}
        />
      )}
    </div>
  );
}
