import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Loading } from "../../components/ui/Loading";
import { Column, Table } from "../../components/ui/Table";
import {
  auditActionLabel,
  entityTypeLabel,
  formatDateTime,
  includesSearch,
  normalizeErrorMessage,
} from "../../services/dataHelpers";
import { AuditLog, listAuditLogs } from "./auditService";

export function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setLogs(await listAuditLogs());
    } catch (nextError) {
      setError(normalizeErrorMessage(nextError, "No se pudo cargar la auditoria."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const entityOptions = useMemo(
    () => Array.from(new Set(logs.map((log) => log.entityType).filter(Boolean))).sort() as string[],
    [logs],
  );
  const actionOptions = useMemo(
    () => Array.from(new Set(logs.map((log) => log.action).filter(Boolean))).sort() as string[],
    [logs],
  );

  const filtered = useMemo(
    () =>
      logs.filter((log) => {
        const matchesSearch =
          !search ||
          includesSearch(log.actorName, search) ||
          includesSearch(log.actorEmail, search) ||
          includesSearch(log.actorUid, search) ||
          includesSearch(log.entityId, search) ||
          includesSearch(log.description, search) ||
          includesSearch(log.action, search);
        const matchesEntity = !entityType || log.entityType === entityType;
        const matchesAction = !action || log.action === action;
        return matchesSearch && matchesEntity && matchesAction;
      }),
    [logs, search, entityType, action],
  );

  const columns: Column<AuditLog>[] = [
    { key: "date", header: "Fecha", render: (log) => formatDateTime(log.createdAt) },
    { key: "admin", header: "Administrador", render: (log) => log.actorName || log.actorEmail || log.actorUid || "Sin actor" },
    { key: "action", header: "Accion", render: (log) => auditActionLabel(log.action) },
    {
      key: "entity",
      header: "Entidad",
      render: (log) => <Badge tone="neutral">{entityTypeLabel(log.entityType)}</Badge>,
    },
    { key: "entityId", header: "ID afectado", render: (log) => <code>{log.entityId || log.auditLogId}</code> },
    { key: "detail", header: "Detalle", render: (log) => log.description || "Accion registrada" },
  ];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1>Auditoria</h1>
          <p>Registro de acciones administrativas realizadas en PADELSTACK.</p>
        </div>
      </header>

      <section className="toolbar">
        <label className="search-field">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar accion, administrador o ID" />
        </label>
        <select value={entityType} onChange={(event) => setEntityType(event.target.value)}>
          <option value="">Todas las entidades</option>
          {entityOptions.map((option) => (
            <option key={option} value={option}>
              {entityTypeLabel(option)}
            </option>
          ))}
        </select>
        <select value={action} onChange={(event) => setAction(event.target.value)}>
          <option value="">Todas las acciones</option>
          {actionOptions.map((option) => (
            <option key={option} value={option}>
              {auditActionLabel(option)}
            </option>
          ))}
        </select>
        <Button variant="secondary" type="button" onClick={() => void load()}>
          Refrescar
        </Button>
      </section>

      {loading ? (
        <Loading label="Cargando auditoria" />
      ) : error ? (
        <div className="notice notice--error">{error}</div>
      ) : (
        <Table
          columns={columns}
          rows={filtered}
          getRowKey={(log) => log.auditLogId}
          empty={<EmptyState title="Sin registros" message="Todavia no hay acciones administrativas que coincidan con los filtros." />}
        />
      )}
    </div>
  );
}
