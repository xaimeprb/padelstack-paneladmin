import { useEffect, useMemo, useState } from "react";
import { Pencil, Search } from "lucide-react";
import { Badge, toneForRole } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Loading } from "../../components/ui/Loading";
import { Column, Table } from "../../components/ui/Table";
import { communityDisplayName, formatDateTime, includesSearch, normalizeErrorMessage } from "../../services/dataHelpers";
import { useAuth } from "../auth/useAuth";
import { Community, listCommunities } from "../communities/communitiesService";
import { displayNameForUser, PadelUser, REAL_ROLE_OPTIONS, roleLabel } from "./usersTypes";
import { listUsers, updateUserDetails, updateUserRole, updateUserStatus } from "./usersService";
import { UserFormModal, UserFormValues } from "./UserFormModal";

export function UsersPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<PadelUser[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
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
      const [nextUsers, nextCommunities] = await Promise.all([listUsers(), listCommunities()]);
      setUsers(nextUsers);
      setCommunities(nextCommunities);
    } catch (nextError) {
      setError(normalizeErrorMessage(nextError, "No se pudieron cargar usuarios."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

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
    { key: "community", header: "Comunidad", render: (user) => communityDisplayName(user.communityId, user.communityName) },
    { key: "unit", header: "Vivienda", render: (user) => user.unitDisplay || "Sin vivienda" },
    {
      key: "active",
      header: "Activo",
      render: (user) => <Badge tone={user.active === false ? "danger" : "success"}>{user.active === false ? "No" : "Si"}</Badge>,
    },
    { key: "created", header: "Creado", render: (user) => formatDateTime(user.createdAt) },
    { key: "updated", header: "Actualizado", render: (user) => formatDateTime(user.updatedAt) },
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

  async function handleSave(user: PadelUser, values: UserFormValues) {
    const detailsChanged =
      values.username !== (user.username || "") ||
      values.firstName !== (user.firstName || "") ||
      values.lastName !== (user.lastName || "") ||
      values.phone !== (user.phone || "") ||
      values.communityId !== (user.communityId || "") ||
      values.unitDisplay !== (user.unitDisplay || "");
    if (detailsChanged) {
      await updateUserDetails(user.uid, {
        username: values.username,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        communityId: values.communityId,
        unitDisplay: values.unitDisplay,
      });
    }
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
          <p>Gestion de datos, comunidad, vivienda, permisos y estado de acceso.</p>
        </div>
      </header>

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
          {communities.map((option) => (
            <option key={option.communityId} value={option.communityId}>
              {option.name || option.communityId}
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
          communities={communities}
          onClose={() => setEditing(null)}
          onSave={(values) => handleSave(editing, values)}
        />
      )}
    </div>
  );
}
