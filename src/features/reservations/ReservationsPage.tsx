import { useEffect, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { Badge, toneForStatus } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Loading } from "../../components/ui/Loading";
import { Modal } from "../../components/ui/Modal";
import { Column, Table } from "../../components/ui/Table";
import { includesSearch } from "../../services/firestoreHelpers";
import { listReservations, Reservation } from "./reservationsService";

export function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setReservations(await listReservations());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "No se pudieron cargar reservas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const resourceOptions = useMemo(() => Array.from(new Set(reservations.map((reservation) => reservation.resourceId).filter(Boolean))).sort() as string[], [reservations]);
  const communityOptions = useMemo(() => Array.from(new Set(reservations.map((reservation) => reservation.communityId).filter(Boolean))).sort() as string[], [reservations]);

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
        return matchesSearch && matchesDate && matchesResource && matchesCommunity;
      }),
    [reservations, search, date, resourceId, communityId],
  );

  const columns: Column<Reservation>[] = [
    { key: "id", header: "Reserva", render: (reservation) => <code>{reservation.reservationId}</code> },
    { key: "user", header: "Usuario", render: (reservation) => reservation.userEmail || reservation.userFullName || reservation.userId || "Sin usuario" },
    { key: "resource", header: "Recurso", render: (reservation) => reservation.resourceId || "Sin recurso" },
    { key: "date", header: "Fecha", render: (reservation) => reservation.date || "Sin fecha" },
    { key: "slot", header: "Horario", render: (reservation) => reservation.allDay ? "Dia completo" : reservation.slotLabel || `${reservation.startTime ?? ""} - ${reservation.endTime ?? ""}` },
    { key: "community", header: "Comunidad", render: (reservation) => reservation.communityId || "Sin comunidad" },
    { key: "status", header: "Estado", render: (reservation) => <Badge tone={toneForStatus(reservation.status)}>{reservation.status || "Sin estado"}</Badge> },
    { key: "created", header: "Creada", render: (reservation) => reservation.createdAt || "Sin fecha" },
    {
      key: "actions",
      header: "Acciones",
      render: (reservation) => (
        <Button variant="secondary" type="button" onClick={() => setSelected(reservation)}>
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
          <h1>Reservas globales</h1>
          <p>Lectura de `reservations`. La cancelacion admin queda pendiente de endpoint seguro.</p>
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
            {Object.entries(selected).map(([key, value]) => (
              <div className="detail-line" key={key}>
                <span>{key}</span>
                <strong>{String(value ?? "N/A")}</strong>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
