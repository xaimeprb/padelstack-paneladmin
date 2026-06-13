import { apiRequest } from "../../services/apiClient";

export type Community = {
  communityId: string;
  name?: string;
  active?: boolean;
  units?: string[];
  usersCount?: number;
  resourcesCount?: number;
  unitsCount?: number;
};

export type CommunitySummary = Community & {
  usersCount: number;
  resourcesCount: number;
};

export async function listCommunities() {
  const communities = await apiRequest<CommunitySummary[]>("/admin/communities");
  return communities.sort((a, b) => (a.name ?? a.communityId).localeCompare(b.name ?? b.communityId));
}

export async function listCommunitySummaries(): Promise<CommunitySummary[]> {
  return listCommunities();
}
