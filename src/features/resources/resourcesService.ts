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

export type ResourceUpdateInput = Omit<Resource, "resourceId">;

export async function listResources() {
  const resources = await apiRequest<Resource[]>("/admin/resources");
  return resources.sort((a, b) => a.resourceId.localeCompare(b.resourceId));
}

export async function updateResource(resourceId: string, input: ResourceUpdateInput) {
  return apiRequest<Resource>(`/admin/resources/${resourceId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function updateResourceStatus(resourceId: string, active: boolean) {
  return apiRequest<Resource>(`/admin/resources/${resourceId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}
