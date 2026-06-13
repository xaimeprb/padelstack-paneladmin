import { useEffect, useMemo, useState } from "react";
import { Pencil, Search } from "lucide-react";
import { Badge, toneForRole } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Loading } from "../../components/ui/Loading";
import { Column, Table } from "../../components/ui/Table";
import { includesSearch } from "../../services/firestoreHelpers";
import { useAuth } from "../auth/useAuth";
import { displayNameForUser, PadelUser, REAL_ROLE_OPTIONS, roleLabel } from "./usersTypes";
import { listUsers, updateUserRole, updateUserStatus } from "./usersService";
import { UserFormModal } from "./UserFormModal";

export function UsersPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<PadelUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [editing, setEditing] = useState<PadelUser | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "No se pudieron cargar usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const communityOptions = useMemo(
    () => Array.from(new Set(users.map((user) => user.communityId).filter(Boolean))).sort() as string[],
    [users],
  );

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        const matchesSearch =
          !search ||
          includesSearch(user.email, search) ||
          includesSearch(displayNameForUser(user), search) ||
          includesSearch(user.uid, search);
        const matchesRole = !role || user.role === role;
        const matchesCommunity = !communityId || user.communityId === communityId;
        return matchesSearch && matchesRole && matchesCommunity;
      }),
    [users, search, role, communityId],
  );

  const columns: Column<PadelUser>[] = [
    { key: "uid", header: "UID", render: (user) => <code>{user.uid}</code> },
    { key: "email", header: "Email", render: (user) => user.email || "Sin email" },
    { key: "name", header: "Nombre", render: (user) => displayNameForUser(user) },
    { key: "role", header: "Rol", render: (user) => <Badge tone={toneForRole(user.role)}>{roleLabel(user.role)}</Badge> },
    { key: "community", header: "Comunidad", render: (user) => user.communityId || "Sin comunidad" },
    {
      key: "active",
      header: "Activo",
      render: (user) => <Badge tone={user.active === false ? "danger" : "success"}>{user.active === false ? "No" : "Si"}</Badge>,
    },
    { key: "created", header: "Creado", render: (user) => user.createdAt || "Sin fecha" },
    { key: "updated", header: "Actualizado", render: (user) => user.updatedAt || "Sin fecha" },
    {
      key: "actions",
      header: "Acciones",
      render: (user) => (
        <Button variant="secondary" type="button" onClick={() => setEditing(user)}>
          <Pencil size={15} />
          Editar
        </Button>
      ),
    },
  ];

  async function handleSave(user: PadelUser, values: { role: string; active: boolean }) {
    if (values.role !== user.role) {
      await updateUserRole(user.uid, values.role);
    }
    if (values.active !== (user.active !== false)) {
      await updateUserStatus(user.uid, values.active);
    }
    await load();
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1>Gestion de usuarios</h1>
          <p>Listado real de `users`, filtros por rol/comunidad y edicion controlada de rol y estado.</p>
        </div>
      </header>

      <div className="notice notice--warning">
        No se han detectado endpoints `GET/PATCH /api/v1/admin/users`; este modulo usa Firestore directo y requiere reglas/backend seguros antes de produccion.
      </div>

      <section className="toolbar">
        <label className="search-field">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por email, nombre o uid" />
        </label>
        <select value={role} onChange={(event) => setRole(event.target.value)} aria-label="Filtrar por rol">
          <option value="">Todos los roles</option>
          {REAL_ROLE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {roleLabel(option)}
            </option>
          ))}
        </select>
        <select value={communityId} onChange={(event) => setCommunityId(event.target.value)} aria-label="Filtrar por comunidad">
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
        <Loading label="Cargando usuarios" />
      ) : error ? (
        <div className="notice notice--error">{error}</div>
      ) : (
        <Table
          columns={columns}
          rows={filtered}
          getRowKey={(user) => user.uid}
          empty={<EmptyState title="Sin usuarios" message="No hay usuarios que coincidan con los filtros." />}
        />
      )}

      {editing && (
        <UserFormModal
          user={editing}
          currentUid={profile?.uid}
          onClose={() => setEditing(null)}
          onSave={(values) => handleSave(editing, values)}
        />
      )}
    </div>
  );
}
