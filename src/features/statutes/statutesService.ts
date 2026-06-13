import { apiRequest } from "../../services/apiClient";
import { readIsoDate } from "../../services/dataHelpers";

export type Statute = {
  communityId: string;
  title?: string;
  content?: string;
  version?: number;
  updatedAt?: string;
  updatedByUid?: string;
};

export type StatuteInput = {
  communityId: string;
  title: string;
  content: string;
  version: number;
  updatedByUid?: string;
};

export async function listStatutes() {
  const statutes = await apiRequest<Statute[]>("/admin/statutes");
  return statutes
    .map((statute) => ({ ...statute, updatedAt: readIsoDate(statute.updatedAt) }))
    .sort((a, b) => a.communityId.localeCompare(b.communityId));
}

export async function saveStatute(input: StatuteInput) {
  const payload = {
    title: input.title,
    content: input.content,
    version: input.version,
  };

  return apiRequest<Statute>(`/admin/statutes/${input.communityId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
