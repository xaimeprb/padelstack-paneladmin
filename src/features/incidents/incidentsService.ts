import { apiRequest } from "../../services/apiClient";
import { byDateDesc, readIsoDate } from "../../services/dataHelpers";

export type Incident = {
  incidentId: string;
  communityId?: string;
  title?: string;
  description?: string;
  status?: string;
  photoUrl?: string;
  storagePath?: string;
  createdByUid?: string;
  createdByName?: string;
  createdByEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedByUid?: string;
};

export const INCIDENT_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"] as const;

export async function listIncidents() {
  const incidents = await apiRequest<Incident[]>("/admin/incidents");
  return incidents
    .map((incident) => ({
      ...incident,
      createdAt: readIsoDate(incident.createdAt),
      updatedAt: readIsoDate(incident.updatedAt),
    }))
    .sort(byDateDesc((incident) => incident.createdAt || incident.updatedAt));
}

export async function updateIncidentStatus(incidentId: string, status: string, _updatedByUid?: string) {
  await apiRequest(`/admin/incidents/${incidentId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}
