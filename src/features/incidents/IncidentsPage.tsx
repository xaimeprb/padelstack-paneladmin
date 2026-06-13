import { useEffect, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { Badge, toneForStatus } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Loading } from "../../components/ui/Loading";
import { Modal } from "../../components/ui/Modal";
import { Column, Table } from "../../components/ui/Table";
import { includesSearch } from "../../services/dataHelpers";
import { useAuth } from "../auth/useAuth";
import { INCIDENT_STATUSES, Incident, listIncidents, updateIncidentStatus } from "./incidentsService";

export function IncidentsPage() {
  const { profile } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [selected, setSelected] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setIncidents(await listIncidents());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "No se pudieron cargar incidencias.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const communityOptions = useMemo(() => Array.from(new Set(incidents.map((incident) => incident.communityId).filter(Boolean))).sort() as string[], [incidents]);

  const filtered = useMemo(
    () =>
      incidents.filter((incident) => {
        const matchesSearch =
          !search ||
          includesSearch(incident.title, search) ||
          includesSearch(incident.description, search) ||
          includesSearch(incident.createdByName, search) ||
          includesSearch(incident.createdByEmail, search) ||
          includesSearch(incident.incidentId, search);
        const matchesStatus = !status || incident.status === status;
        const matchesCommunity = !communityId || incident.communityId === communityId;
        return matchesSearch && matchesStatus && matchesCommunity;
      }),
    [incidents, search, status, communityId],
  );

  async function handleStatusChange(incident: Incident, nextStatus: string) {
    setError(null);
    try {
      await updateIncidentStatus(incident.incidentId, nextStatus, profile?.uid);
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "No se pudo actualizar la incidencia.");
    }
  }

  const columns: Column<Incident>[] = [
    { key: "id", header: "Incidencia", render: (incident) => <code>{incident.incidentId}</code> },
    { key: "title", header: "Titulo", render: (incident) => incident.title || "Sin titulo" },
    { key: "author", header: "Usuario", render: (incident) => incident.createdByEmail || incident.createdByName || incident.createdByUid || "Sin usuario" },
    { key: "community", header: "Comunidad", render: (incident) => incident.communityId || "Sin comunidad" },
    {
      key: "status",
      header: "Estado",
      render: (incident) => (
        <select
          className="status-select"
          value={incident.status || "OPEN"}
          onChange={(event) => void handleStatusChange(incident, event.target.value)}
        >
          {INCIDENT_STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ),
    },
    { key: "created", header: "Creada", render: (incident) => incident.createdAt || "Sin fecha" },
    {
      key: "badge",
      header: "Vista",
      render: (incident) => <Badge tone={toneForStatus(incident.status)}>{incident.status || "Sin estado"}</Badge>,
    },
    {
      key: "actions",
      header: "Acciones",
      render: (incident) => (
        <Button variant="secondary" type="button" onClick={() => setSelected(incident)}>
          <Eye size={15} />
          Detalle
        </Button>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1>Incidencias</h1>
          <p>Listado y cambio de estado con modelo real `OPEN`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`.</p>
        </div>
      </header>

      <div className="notice notice--warning">
        La especificacion menciona `CLOSED`, pero el backend actual no lo acepta. Se usa `REJECTED` para no romper `IncidentStatus.valueOf`.
      </div>

      <section className="toolbar">
        <label className="search-field">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar incidencia" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Todos los estados</option>
          {INCIDENT_STATUSES.map((option) => (
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
        <Loading label="Cargando incidencias" />
      ) : error ? (
        <div className="notice notice--error">{error}</div>
      ) : (
        <Table
          columns={columns}
          rows={filtered}
          getRowKey={(incident) => incident.incidentId}
          empty={<EmptyState title="Sin incidencias" message="No hay incidencias o no coinciden con los filtros." />}
        />
      )}

      {selected && (
        <Modal title="Detalle de incidencia" onClose={() => setSelected(null)}>
          <div className="detail-grid">
            {Object.entries(selected).map(([key, value]) => (
              <div className="detail-line" key={key}>
                <span>{key}</span>
                <strong>{String(value ?? "N/A")}</strong>
              </div>
            ))}
          </div>
          {selected.photoUrl && (
            <a className="text-link" href={selected.photoUrl} target="_blank" rel="noreferrer">
              Abrir foto adjunta
            </a>
          )}
        </Modal>
      )}
    </div>
  );
}
