import { apiRequest } from "../../services/apiClient";
import { Announcement } from "../announcements/announcementsService";
import { Incident } from "../incidents/incidentsService";
import { Reservation } from "../reservations/reservationsService";

export type DashboardTotals = {
  users: number;
  communities: number;
  resources: number;
  reservations: number;
  announcements: number;
  incidents: number;
};

export type DashboardData = {
  totals: DashboardTotals;
  usersByRole: Record<string, number>;
  latestReservations: Reservation[];
  latestAnnouncements: Announcement[];
  latestIncidents: Incident[];
};

export async function getDashboard() {
  return apiRequest<DashboardData>("/admin/dashboard");
}
