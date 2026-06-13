import { NavLink } from "react-router-dom";
import {
  Bell,
  Building2,
  CalendarDays,
  FileText,
  Gauge,
  History,
  Megaphone,
  ShieldAlert,
  Users,
  Wrench,
} from "lucide-react";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/users", label: "Usuarios", icon: Users },
  { to: "/communities", label: "Comunidades", icon: Building2 },
  { to: "/resources", label: "Recursos", icon: Wrench },
  { to: "/reservations", label: "Reservas", icon: CalendarDays },
  { to: "/announcements", label: "Anuncios", icon: Megaphone },
  { to: "/statutes", label: "Estatutos", icon: FileText },
  { to: "/incidents", label: "Incidencias", icon: ShieldAlert },
  { to: "/audit", label: "Auditoria", icon: History },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">
          <Bell size={22} />
        </div>
        <div>
          <strong>PADELSTACK</strong>
          <span>SuperAdmin</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}>
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
