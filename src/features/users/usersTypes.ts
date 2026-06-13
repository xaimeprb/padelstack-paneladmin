export type UserRole = "NEIGHBOR" | "ADMIN" | "SUPERADMIN" | string;

export type PadelUser = {
  uid: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  displayName?: string;
  phone?: string;
  communityId?: string;
  communityName?: string;
  unitDisplay?: string;
  role?: UserRole;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UserUpdateInput = {
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  communityId?: string;
  unitDisplay?: string;
};

export const REAL_ROLE_OPTIONS = ["NEIGHBOR", "ADMIN", "SUPERADMIN"] as const;

export function displayNameForUser(user: Partial<PadelUser>) {
  return user.displayName || user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || user.email || user.uid || "Sin nombre";
}

export function roleLabel(role?: string) {
  if (role === "ADMIN") return "Administrador comunidad";
  if (role === "PRESIDENT") return "Presidente legacy";
  if (role === "SUPERADMIN") return "Superadministrador";
  if (role === "NEIGHBOR") return "Vecino";
  return role || "Sin rol";
}

export function editableRole(role?: string) {
  if (role === "PRESIDENT") return "ADMIN";
  if (role && REAL_ROLE_OPTIONS.some((option) => option === role)) return role;
  return "NEIGHBOR";
}
