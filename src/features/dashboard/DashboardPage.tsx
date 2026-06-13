import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, Megaphone, ShieldAlert, Users } from "lucide-react";
import { Badge, toneForStatus } from "../../components/ui/Badge";
import { Card, MetricCard } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Loading } from "../../components/ui/Loading";
import { formatDateTime, resourceDisplayName, statusLabel } from "../../services/dataHelpers";
import { DashboardData, getDashboard } from "./dashboardService";

const emptyState: DashboardData = {
  totals: {
    users: 0,
    reservations: 0,
    announcements: 0,
    incidents: 0,
    communities: 0,
    resources: 0,
  },
  usersByRole: {},
  latestReservations: [],
  latestAnnouncements: [],
  latestIncidents: [],
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardData>(emptyState);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErrors([]);
      try {
        const dashboard = await getDashboard();
        if (!mounted) return;
        setData(dashboard);
      } catch (nextError) {
        if (!mounted) return;
        setErrors([nextError instanceof Error ? nextError.message : "No se pudo cargar el dashboard."]);
        setData(emptyState);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const latestReservations = useMemo(() => data.latestReservations.slice(0, 5), [data.latestReservations]);

  if (loading) return <Loading label="Cargando resumen global" />;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1>Dashboard principal</h1>
          <p>Resumen operativo global de PADELSTACK.</p>
        </div>
      </header>

      {!!errors.length && (
        <div className="notice notice--warning">
          <AlertCircle size={18} />
          No se pudo cargar el resumen. {errors[0]}
        </div>
      )}

      <div className="metric-grid">
        <MetricCard label="Usuarios" value={data.totals.users} hint="Usuarios registrados en el sistema." />
        <MetricCard label="Reservas" value={data.totals.reservations} hint="Reservas gestionadas por la plataforma." />
        <MetricCard label="Anuncios" value={data.totals.announcements} hint="Comunicaciones publicadas." />
        <MetricCard label="Incidencias" value={data.totals.incidents} hint="Incidencias recibidas." />
        <MetricCard label="Comunidades" value={data.totals.communities} hint="Comunidades activas." />
      </div>

      <div className="dashboard-grid">
        <Card>
          <div className="section-title">
            <CalendarDays size={18} />
            <h2>Ultimas reservas</h2>
          </div>
          {latestReservations.length ? (
            <div className="list-stack">
              {latestReservations.map((reservation) => (
                <article className="compact-row" key={reservation.reservationId}>
                  <div>
                    <strong>{resourceDisplayName(reservation.resourceId, reservation.resourceName)}</strong>
                    <span>{reservation.date || "Sin fecha"} - {reservation.slotLabel || `${reservation.startTime ?? ""} ${reservation.endTime ?? ""}`}</span>
                  </div>
                  <Badge tone={toneForStatus(reservation.status)}>{statusLabel(reservation.status)}</Badge>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin reservas" message="Todavia no hay reservas registradas." />
          )}
        </Card>

        <Card>
          <div className="section-title">
            <Megaphone size={18} />
            <h2>Ultimos anuncios</h2>
          </div>
          {data.latestAnnouncements.slice(0, 5).length ? (
            <div className="list-stack">
              {data.latestAnnouncements.slice(0, 5).map((announcement) => (
                <article className="compact-row" key={announcement.announcementId}>
                  <div>
                    <strong>{announcement.title || "Sin titulo"}</strong>
                    <span>{announcement.communityId || "Sin comunidad"} - {formatDateTime(announcement.publishedAt)}</span>
                  </div>
                  <Badge tone={announcement.visible === false ? "danger" : "success"}>
                    {announcement.visible === false ? "Oculto" : "Visible"}
                  </Badge>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin anuncios" message="No hay comunicaciones publicadas todavia." />
          )}
        </Card>

        <Card>
          <div className="section-title">
            <ShieldAlert size={18} />
            <h2>Ultimas incidencias</h2>
          </div>
          {data.latestIncidents.slice(0, 5).length ? (
            <div className="list-stack">
              {data.latestIncidents.slice(0, 5).map((incident) => (
                <article className="compact-row" key={incident.incidentId}>
                  <div>
                    <strong>{incident.title || "Sin titulo"}</strong>
                    <span>{incident.createdByName || incident.createdByEmail || "Sin autor"} - {formatDateTime(incident.createdAt)}</span>
                  </div>
                  <Badge tone={toneForStatus(incident.status)}>{statusLabel(incident.status)}</Badge>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin incidencias" message="No hay incidencias recibidas todavia." />
          )}
        </Card>

        <Card>
          <div className="section-title">
            <Users size={18} />
            <h2>Usuarios por rol</h2>
          </div>
          <div className="role-summary">
            {["SUPERADMIN", "ADMIN", "NEIGHBOR"].map((role) => (
              <article key={role}>
                <span>{role}</span>
                <strong>{data.usersByRole[role] || 0}</strong>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
