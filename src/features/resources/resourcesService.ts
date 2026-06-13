import { apiRequest } from "../../services/apiClient";

export type Resource = {
  resourceId: string;
  communityId?: string;
  name?: string;
  type?: string;
  reservationMode?: string;
  slotMinutes?: number;
  openTime?: string;
  closeTime?: string;
  rulesText?: string;
  active?: boolean;
};

export async function listResources() {
  const resources = await apiRequest<Resource[]>("/admin/resources");
  return resources.sort((a, b) => a.resourceId.localeCompare(b.resourceId));
}
