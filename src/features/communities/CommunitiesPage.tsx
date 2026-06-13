import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Loading } from "../../components/ui/Loading";
import { Column, Table } from "../../components/ui/Table";
import { includesSearch } from "../../services/dataHelpers";
import { CommunitySummary, listCommunitySummaries } from "./communitiesService";

export function CommunitiesPage() {
  const [communities, setCommunities] = useState<CommunitySummary[]>([]);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setCommunities(await listCommunitySummaries());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "No se pudieron cargar comunidades.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () =>
      communities.filter((community) => {
        const matchesSearch =
          !search || includesSearch(community.communityId, search) || includesSearch(community.name, search);
        const matchesActive = !active || String(community.active !== false) === active;
        return matchesSearch && matchesActive;
      }),
    [communities, search, active],
  );

  const columns: Column<CommunitySummary>[] = [
    { key: "id", header: "Community ID", render: (community) => <code>{community.communityId}</code> },
    { key: "name", header: "Nombre", render: (community) => community.name || "Sin nombre" },
    {
      key: "active",
      header: "Estado",
      render: (community) => <Badge tone={community.active === false ? "danger" : "success"}>{community.active === false ? "Inactiva" : "Activa"}</Badge>,
    },
    { key: "users", header: "Usuarios", render: (community) => community.usersCount },
    { key: "resources", header: "Recursos", render: (community) => community.resourcesCount },
    {
      key: "units",
      header: "Viviendas",
      render: (community) => (community.units?.length ? `${community.units.length} unidades` : "Sin unidades"),
    },
  ];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1>Gestion de comunidades</h1>
          <p>Visualizacion de `communities` y conteos calculados por backend.</p>
        </div>
      </header>

      <div className="notice notice--info">
        No se implementa creacion/eliminacion porque el modelo de alta de comunidades no esta definido en endpoints admin.
      </div>

      <section className="toolbar">
        <label className="search-field">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar comunidad" />
        </label>
        <select value={active} onChange={(event) => setActive(event.target.value)}>
          <option value="">Todos los estados</option>
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>
        <Button variant="secondary" type="button" onClick={() => void load()}>
          Refrescar
        </Button>
      </section>

      {loading ? (
        <Loading label="Cargando comunidades" />
      ) : error ? (
        <div className="notice notice--error">{error}</div>
      ) : (
        <Table
          columns={columns}
          rows={filtered}
          getRowKey={(community) => community.communityId}
          empty={<EmptyState title="Sin comunidades" message="No hay comunidades o no coinciden con los filtros." />}
        />
      )}
    </div>
  );
}
