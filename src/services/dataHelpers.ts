export function readIsoDate(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return normalizeIsoDate(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date ? date.toISOString() : String(date);
  }
  return String(value);
}

export function docData<T extends Record<string, unknown>>(
  snapshot: { id: string; data: () => Record<string, unknown> },
  idKey: keyof T,
) {
  const data = snapshot.data() as T;
  return {
    ...data,
    [idKey]: data[idKey] || snapshot.id,
  } as T;
}

export function nowIso() {
  return new Date().toISOString();
}

export function byDateDesc<T>(getter: (item: T) => string | undefined) {
  return (a: T, b: T) => (getter(b) ?? "").localeCompare(getter(a) ?? "");
}

export function includesSearch(value: unknown, search: string) {
  return String(value ?? "").toLowerCase().includes(search.trim().toLowerCase());
}

export function formatDateTime(value?: string) {
  const date = parseDate(value);
  if (!date) return "Sin fecha";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(value?: string) {
  const date = parseDate(value);
  if (!date) return "Sin fecha";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function booleanLabel(value?: boolean, labels: [string, string] = ["Si", "No"]) {
  return value === false ? labels[1] : labels[0];
}

export function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Activa",
    CANCELLED: "Cancelada",
    OPEN: "Abierta",
    IN_PROGRESS: "En curso",
    RESOLVED: "Resuelta",
    REJECTED: "Rechazada",
    VISIBLE: "Visible",
    HIDDEN: "Oculto",
  };
  return status ? labels[status] || status : "Sin estado";
}

export function roleLabelText(role?: string) {
  const labels: Record<string, string> = {
    NEIGHBOR: "Vecino",
    ADMIN: "Administrador comunidad",
    SUPERADMIN: "Superadministrador",
  };
  return role ? labels[role] || role : "Sin rol";
}

export function resourceDisplayName(resourceId?: string, resourceName?: string) {
  return resourceName || resourceId || "Sin recurso";
}

export function communityDisplayName(communityId?: string, communityName?: string) {
  return communityName || communityId || "Sin comunidad";
}

export function auditActionLabel(action?: string) {
  const labels: Record<string, string> = {
    ADMIN_USER_UPDATED: "Usuario actualizado",
    ADMIN_USER_ROLE_UPDATED: "Rol actualizado",
    ADMIN_USER_STATUS_UPDATED: "Estado de usuario actualizado",
    ADMIN_RESOURCE_UPDATED: "Recurso actualizado",
    ADMIN_RESOURCE_STATUS_UPDATED: "Estado de recurso actualizado",
    ADMIN_RESERVATION_CANCELLED: "Reserva cancelada",
    ADMIN_RESERVATION_STATUS_UPDATED: "Estado de reserva actualizado",
    ADMIN_ANNOUNCEMENT_VISIBILITY_UPDATED: "Visibilidad de anuncio actualizada",
    RESOURCE_RULES_UPDATED: "Reglas de recurso actualizadas",
    ANNOUNCEMENT_CREATED: "Anuncio creado",
    ANNOUNCEMENT_UPDATED: "Anuncio actualizado",
    ANNOUNCEMENT_DELETED: "Anuncio ocultado",
    STATUTE_UPDATED: "Estatutos actualizados",
    INCIDENT_STATUS_UPDATED: "Incidencia actualizada",
  };
  return action ? labels[action] || action : "Accion registrada";
}

export function entityTypeLabel(entityType?: string) {
  const labels: Record<string, string> = {
    user: "Usuario",
    resource: "Recurso",
    reservation: "Reserva",
    announcement: "Anuncio",
    statute: "Estatutos",
    incident: "Incidencia",
    community: "Comunidad",
  };
  return entityType ? labels[entityType] || entityType : "Registro";
}

export function normalizeErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  if (!error.message || error.message === "Failed to fetch") return fallback;
  return error.message;
}

function parseDate(value?: string) {
  if (!value) return null;
  const normalized = normalizeIsoDate(value);
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeIsoDate(value: string) {
  return value.replace(/\.(\d{3})\d+(Z|[+-]\d\d:\d\d)$/, ".$1$2");
}
