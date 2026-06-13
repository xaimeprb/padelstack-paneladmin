import { apiRequest } from "../../services/apiClient";
import { readIsoDate } from "../../services/dataHelpers";
import { PadelUser, UserRole } from "./usersTypes";

function normalizeUser(user: PadelUser): PadelUser {
  return {
    ...user,
    displayName: user.displayName || user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" "),
    createdAt: readIsoDate(user.createdAt),
    updatedAt: readIsoDate(user.updatedAt),
  };
}

export async function listUsers() {
  const users = await apiRequest<PadelUser[]>("/admin/users");
  return users.map(normalizeUser);
}

export async function updateUserRole(uid: string, role: UserRole) {
  await apiRequest<PadelUser>(`/admin/users/${uid}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function updateUserStatus(uid: string, active: boolean) {
  await apiRequest<PadelUser>(`/admin/users/${uid}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}
