import { collection, getDocs } from "firebase/firestore";
import { db, ensureFirebaseReady } from "../../services/firebase";
import { docData } from "../../services/firestoreHelpers";
import { listResources } from "../resources/resourcesService";
import { listUsers } from "../users/usersService";

export type Community = {
  communityId: string;
  name?: string;
  active?: boolean;
  units?: string[];
};

export type CommunitySummary = Community & {
  usersCount: number;
  resourcesCount: number;
};

export async function listCommunities() {
  ensureFirebaseReady();
  const snapshot = await getDocs(collection(db, "communities"));
  return snapshot.docs
    .map((item) => docData<Community>(item, "communityId"))
    .sort((a, b) => (a.name ?? a.communityId).localeCompare(b.name ?? b.communityId));
}

export async function listCommunitySummaries(): Promise<CommunitySummary[]> {
  const [communities, users, resources] = await Promise.all([listCommunities(), listUsers(), listResources()]);
  return communities.map((community) => ({
    ...community,
    usersCount: users.filter((user) => user.communityId === community.communityId).length,
    resourcesCount: resources.filter((resource) => resource.communityId === community.communityId).length,
  }));
}
