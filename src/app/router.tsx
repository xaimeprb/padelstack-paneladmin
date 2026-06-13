import { createBrowserRouter, Navigate } from "react-router-dom";
import { App } from "./App";
import { AdminLayout } from "../components/layout/AdminLayout";
import { LoginPage } from "../features/auth/LoginPage";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { UsersPage } from "../features/users/UsersPage";
import { CommunitiesPage } from "../features/communities/CommunitiesPage";
import { ResourcesPage } from "../features/resources/ResourcesPage";
import { ReservationsPage } from "../features/reservations/ReservationsPage";
import { AnnouncementsPage } from "../features/announcements/AnnouncementsPage";
import { StatutesPage } from "../features/statutes/StatutesPage";
import { IncidentsPage } from "../features/incidents/IncidentsPage";
import { AuditPage } from "../features/audit/AuditPage";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/login", element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="/dashboard" replace /> },
              { path: "/dashboard", element: <DashboardPage /> },
              { path: "/users", element: <UsersPage /> },
              { path: "/communities", element: <CommunitiesPage /> },
              { path: "/resources", element: <ResourcesPage /> },
              { path: "/reservations", element: <ReservationsPage /> },
              { path: "/announcements", element: <AnnouncementsPage /> },
              { path: "/statutes", element: <StatutesPage /> },
              { path: "/incidents", element: <IncidentsPage /> },
              { path: "/audit", element: <AuditPage /> },
            ],
          },
        ],
      },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
