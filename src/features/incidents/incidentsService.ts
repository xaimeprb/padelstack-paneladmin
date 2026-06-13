import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { apiRequest, hasApiBaseUrl } from "../../services/apiClient";
import { db, ensureFirebaseReady } from "../../services/firebase";
import { byDateDesc, docData, nowIso, readIsoDate } from "../../services/firestoreHelpers";

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
  ensureFirebaseReady();
  const snapshot = await getDocs(collection(db, "incidents"));
  return snapshot.docs
    .map((item) => {
      const incident = docData<Incident>(item, "incidentId");
      return {
        ...incident,
        createdAt: readIsoDate(incident.createdAt),
        updatedAt: readIsoDate(incident.updatedAt),
      };
    })
    .sort(byDateDesc((incident) => incident.createdAt || incident.updatedAt));
}

export async function updateIncidentStatus(incidentId: string, status: string, updatedByUid?: string) {
  ensureFirebaseReady();
  if (hasApiBaseUrl()) {
    await apiRequest(`/admin/incidents/${incidentId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    return;
  }

  await updateDoc(doc(db, "incidents", incidentId), {
    status,
    updatedAt: nowIso(),
    updatedByUid: updatedByUid || "",
  });
}
