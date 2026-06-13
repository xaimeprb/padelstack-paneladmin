import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { apiRequest, hasApiBaseUrl } from "../../services/apiClient";
import { db, ensureFirebaseReady } from "../../services/firebase";
import { docData, nowIso, readIsoDate } from "../../services/firestoreHelpers";

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
  ensureFirebaseReady();
  const snapshot = await getDocs(collection(db, "statutes"));
  return snapshot.docs
    .map((item) => {
      const statute = docData<Statute>(item, "communityId");
      return { ...statute, updatedAt: readIsoDate(statute.updatedAt) };
    })
    .sort((a, b) => a.communityId.localeCompare(b.communityId));
}

export async function saveStatute(input: StatuteInput) {
  ensureFirebaseReady();
  const payload = {
    title: input.title,
    content: input.content,
    version: input.version,
  };

  if (hasApiBaseUrl()) {
    return apiRequest<Statute>(`/admin/statutes/${input.communityId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  await setDoc(
    doc(db, "statutes", input.communityId),
    {
      communityId: input.communityId,
      ...payload,
      updatedAt: nowIso(),
      updatedByUid: input.updatedByUid || "",
    },
    { merge: true },
  );
}
