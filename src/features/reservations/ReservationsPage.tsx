import { useEffect, useMemo, useState } from "react";
import { Eye, Search, XCircle } from "lucide-react";
import { Badge, toneForStatus } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Loading } from "../../components/ui/Loading";
import { Modal } from "../../components/ui/Modal";
import { Column, Table } from "../../components/ui/Table";
import {
  communityDisplayName,
  formatDate,
  formatDateTime,
  includesSearch,
  normalizeErrorMessage,
  resourceDisplayName,
  statusLabel,
} from "../../services/dataHelpers";
import { cancelReservation, listReservations, Reservation } from "./reservationsService";

export function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [savingCancel, setSavingCancel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setReservations(await listReservations());
    } catch (nextError) {
      setError(normalizeErrorMessage(nextError, "No se pudieron cargar reservas."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const resourceOptions = useMemo(() => Array.from(new Set(reservations.map((reservation) => reservation.resourceId).filter(Boolean))).sort() as string[], [reservations]);
  const communityOptions = useMemo(() => Array.from(new Set(reservations.map((reservation) => reservation.communityId).filter(Boolean))).sort() as string[], [reservations]);
  const statusOptions = useMemo(() => Array.from(new Set(reservations.map((reservation) => reservation.status).filter(Boolean))).sort() as string[], [reservations]);

  const filtered = useMemo(
    () =>
      reservations.filter((reservation) => {
        const matchesSearch =
          !search ||
          includesSearch(reservation.userEmail, search) ||
          includesSearch(reservation.userFullName, search) ||
          includesSearch(reservation.userId, search) ||
          includesSearch(reservation.reservationId, search);
        const matchesDate = !date || reservation.date === date;
        const matchesResource = !resourceId || reservation.resourceId === resourceId;
        const matchesCommunity = !communityId || reservation.communityId === communityId;
        const matchesStatus = !status || reservation.status === status;
        return matchesSearch && matchesDate && matchesResource && matchesCommunity && matchesStatus;
      }),
    [reservations, search, date, resourceId, communityId, status],
  );

  const columns: Column<Reservation>[] = [
    { key: "id", header: "Reserva", render: (reservation) => <code>{reservation.reservationId}</code> },
    { key: "user", header: "Usuario", render: (reservation) => reservation.userEmail || reservation.userFullName || reservation.userId || "Sin usuario" },
    { key: "resource", header: "Recurso", render: (reservation) => resourceDisplayName(reservation.resourceId, reservation.resourceName) },
    { key: "date", header: "Fecha", render: (reservation) => formatDate(reservation.date) },
    { key: "slot", header: "Horario", render: (reservation) => reservation.allDay ? "Dia completo" : reservation.slotLabel || `${reservation.startTime ?? ""} - ${reservation.endTime ?? ""}` },
    { key: "community", header: "Comunidad", render: (reservation) => communityDisplayName(reservation.communityId) },
    { key: "status", header: "Estado", render: (reservation) => <Badge tone={toneForStatus(reservation.status)}>{statusLabel(reservation.status)}</Badge> },
    { key: "created", header: "Creada", render: (reservation) => formatDateTime(reservation.createdAt) },
    {
      key: "actions",
      header: "Acciones",
      render: (reservation) => (
        <div className="row-actions">
          <Button variant="secondary" type="button" onClick={() => setSelected(reservation)}>
            <Eye size={15} />
            Detalle
          </Button>
          <Button
            variant="danger"
            type="button"
            onClick={() => {
              setCancelTarget(reservation);
              setCancelReason("");
            }}
            disabled={reservation.status !== "ACTIVE"}
          >
            <XCircle size={15} />
            Cancelar
          </Button>
        </div>
      ),
    },
  ];

  async function handleCancel() {
    if (!cancelTarget || !cancelReason.trim()) return;
    setSavingCancel(true);
    setError(null);
    try {
      await cancelReservation(cancelTarget.reservationId, cancelReason.trim());
      setCancelTarget(null);
      setCancelReason("");
      await load();
    } catch (nextError) {
      setError(normalizeErrorMessage(nextError, "No se pudo cancelar la reserva."));
    } finally {
      setSavingCancel(false);
    }
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1>Reservas globales</h1>
          <p>Consulta y supervision de reservas realizadas por los usuarios. Las cancelaciones se registran manteniendo el historico.</p>
        </div>
      </header>

      <section className="toolbar">
        <label className="search-field">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar usuario o reserva" />
        </label>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Filtrar por fecha" />
        <select value={resourceId} onChange={(event) => setResourceId(event.target.value)}>
          <option value="">Todos los recursos</option>
          {resourceOptions.map((option) => (
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
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Todos los estados</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {statusLabel(option)}
            </option>
          ))}
        </select>
        <Button variant="secondary" type="button" onClick={() => void load()}>
          Refrescar
        </Button>
      </section>

      {loading ? (
        <Loading label="Cargando reservas" />
      ) : error ? (
        <div className="notice notice--error">{error}</div>
      ) : (
        <Table
          columns={columns}
          rows={filtered}
          getRowKey={(reservation) => reservation.reservationId}
          empty={<EmptyState title="Sin reservas" message="No hay reservas o no coinciden con los filtros." />}
        />
      )}

      {selected && (
        <Modal title="Detalle de reserva" onClose={() => setSelected(null)}>
          <div className="detail-grid">
            <div className="detail-line"><span>Reserva</span><strong>{selected.reservationId}</strong></div>
            <div className="detail-line"><span>Usuario</span><strong>{selected.userEmail || selected.userFullName || selected.userId || "Sin usuario"}</strong></div>
            <div className="detail-line"><span>Recurso</span><strong>{resourceDisplayName(selected.resourceId, selected.resourceName)}</strong></div>
            <div className="detail-line"><span>Comunidad</span><strong>{communityDisplayName(selected.communityId)}</strong></div>
            <div className="detail-line"><span>Fecha</span><strong>{formatDate(selected.date)}</strong></div>
            <div className="detail-line"><span>Horario</span><strong>{selected.allDay ? "Dia completo" : selected.slotLabel || `${selected.startTime ?? ""} - ${selected.endTime ?? ""}`}</strong></div>
            <div className="detail-line"><span>Estado</span><strong>{statusLabel(selected.status)}</strong></div>
            <div className="detail-line"><span>Creada</span><strong>{formatDateTime(selected.createdAt)}</strong></div>
            <div className="detail-line"><span>Actualizada</span><strong>{formatDateTime(selected.updatedAt)}</strong></div>
            {selected.status === "CANCELLED" && (
              <>
                <div className="detail-line"><span>Cancelada</span><strong>{formatDateTime(selected.cancelledAt)}</strong></div>
                <div className="detail-line"><span>Cancelada por</span><strong>{selected.cancelledByName || selected.cancelledByUid || "Sin dato"}</strong></div>
                <div className="detail-line"><span>Motivo</span><strong>{selected.cancellationReason || "Sin motivo registrado"}</strong></div>
              </>
            )}
          </div>
        </Modal>
      )}

      {cancelTarget && (
        <Modal
          title="Cancelar reserva"
          onClose={() => setCancelTarget(null)}
          footer={
            <>
              <Button variant="secondary" type="button" onClick={() => setCancelTarget(null)}>
                Volver
              </Button>
              <Button variant="danger" type="button" disabled={!cancelReason.trim() || savingCancel} onClick={() => void handleCancel()}>
                {savingCancel ? "Cancelando..." : "Cancelar reserva"}
              </Button>
            </>
          }
        >
          <div className="form-stack">
            <p className="modal-copy">
              La reserva se marcara como cancelada y seguira disponible en el historico.
            </p>
            <label className="field">
              <span>Motivo de cancelacion</span>
              <textarea rows={4} value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} required />
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}
