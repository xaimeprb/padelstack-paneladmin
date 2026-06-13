import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, Megaphone, ShieldAlert, Users } from "lucide-react";
import { Badge, toneForStatus } from "../../components/ui/Badge";
import { Card, MetricCard } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Loading } from "../../components/ui/Loading";
import { listAnnouncements, Announcement } from "../announcements/announcementsService";
import { listCommunities, Community } from "../communities/communitiesService";
import { Incident, listIncidents } from "../incidents/incidentsService";
import { listReservations, Reservation } from "../reservations/reservationsService";
import { listUsers } from "../users/usersService";
import { PadelUser } from "../users/usersTypes";

type DashboardState = {
  users: PadelUser[];
  reservations: Reservation[];
  announcements: Announcement[];
  incidents: Incident[];
  communities: Community[];
};

const emptyState: DashboardState = {
  users: [],
  reservations: [],
  announcements: [],
  incidents: [],
  communities: [],
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardState>(emptyState);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const results = await Promise.allSettled([
        listUsers(),
        listReservations(),
        listAnnouncements(),
        listIncidents(),
        listCommunities(),
      ]);
      if (!mounted) return;

      const nextErrors: string[] = [];
      const [users, reservations, announcements, incidents, communities] = results.map((result) => {
        if (result.status === "fulfilled") return result.value;
        nextErrors.push(result.reason instanceof Error ? result.reason.message : "No se pudo cargar un modulo.");
        return [];
      });

      setData({
        users: users as PadelUser[],
        reservations: reservations as Reservation[],
        announcements: announcements as Announcement[],
        incidents: incidents as Incident[],
        communities: communities as Community[],
      });
      setErrors(nextErrors);
      setLoading(false);
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const latestReservations = useMemo(() => {
    return data.reservations.slice(0, 5);
  }, [data.reservations]);

  if (loading) return <Loading label="Cargando resumen global" />;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1>Dashboard principal</h1>
          <p>Resumen operativo global de PADELSTACK con datos reales disponibles.</p>
        </div>
      </header>

      {!!errors.length && (
        <div className="notice notice--warning">
          <AlertCircle size={18} />
          Algunos modulos no han podido cargar. {errors[0]}
        </div>
      )}

      <div className="metric-grid">
        <MetricCard label="Usuarios" value={data.users.length} hint="Coleccion users" />
        <MetricCard label="Reservas" value={data.reservations.length} hint="Coleccion reservations" />
        <MetricCard label="Anuncios" value={data.announcements.length} hint="Coleccion announcements" />
        <MetricCard label="Incidencias" value={data.incidents.length} hint="Coleccion incidents" />
        <MetricCard label="Comunidades" value={data.communities.length} hint="Coleccion communities" />
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
                    <strong>{reservation.resourceName || reservation.resourceId}</strong>
                    <span>{reservation.date} · {reservation.slotLabel || `${reservation.startTime ?? ""} ${reservation.endTime ?? ""}`}</span>
                  </div>
                  <Badge tone={toneForStatus(reservation.status)}>{reservation.status || "Sin estado"}</Badge>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin reservas" message="No hay reservas o la coleccion aun no tiene datos." />
          )}
        </Card>

        <Card>
          <div className="section-title">
            <Megaphone size={18} />
            <h2>Ultimos anuncios</h2>
          </div>
          {data.announcements.slice(0, 5).length ? (
            <div className="list-stack">
              {data.announcements.slice(0, 5).map((announcement) => (
                <article className="compact-row" key={announcement.announcementId}>
                  <div>
                    <strong>{announcement.title || "Sin titulo"}</strong>
                    <span>{announcement.communityId || "Sin comunidad"} · {announcement.publishedAt || "Sin fecha"}</span>
                  </div>
                  <Badge tone={announcement.visible === false ? "danger" : "success"}>
                    {announcement.visible === false ? "Oculto" : "Visible"}
                  </Badge>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin anuncios" message="No hay anuncios creados todavia." />
          )}
        </Card>

        <Card>
          <div className="section-title">
            <ShieldAlert size={18} />
            <h2>Ultimas incidencias</h2>
          </div>
          {data.incidents.slice(0, 5).length ? (
            <div className="list-stack">
              {data.incidents.slice(0, 5).map((incident) => (
                <article className="compact-row" key={incident.incidentId}>
                  <div>
                    <strong>{incident.title || "Sin titulo"}</strong>
                    <span>{incident.createdByName || incident.createdByEmail || "Sin autor"} · {incident.createdAt || "Sin fecha"}</span>
                  </div>
                  <Badge tone={toneForStatus(incident.status)}>{incident.status || "Sin estado"}</Badge>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin incidencias" message="No hay incidencias registradas o el modulo aun no existe." />
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
                <strong>{data.users.filter((user) => user.role === role).length}</strong>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
