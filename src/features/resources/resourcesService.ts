import { collection, getDocs } from "firebase/firestore";
import { db, ensureFirebaseReady } from "../../services/firebase";
import { docData } from "../../services/firestoreHelpers";

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
  ensureFirebaseReady();
  const snapshot = await getDocs(collection(db, "resources"));
  return snapshot.docs
    .map((item) => docData<Resource>(item, "resourceId"))
    .sort((a, b) => a.resourceId.localeCompare(b.resourceId));
}
