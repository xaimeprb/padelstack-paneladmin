import { collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { apiRequest, hasApiBaseUrl } from "../../services/apiClient";
import { db, ensureFirebaseReady } from "../../services/firebase";
import { byDateDesc, docData, nowIso, readIsoDate } from "../../services/firestoreHelpers";
import { PadelUser, displayNameForUser } from "../users/usersTypes";

export type Announcement = {
  announcementId: string;
  communityId?: string;
  title?: string;
  content?: string;
  visible?: boolean;
  publishedAt?: string;
  createdByUid?: string;
  createdByName?: string;
  updatedAt?: string;
};

export type AnnouncementInput = {
  announcementId?: string;
  communityId?: string;
  title: string;
  content: string;
  visible: boolean;
  publishedAt?: string;
};

export async function listAnnouncements() {
  ensureFirebaseReady();
  const snapshot = await getDocs(collection(db, "announcements"));
  return snapshot.docs
    .map((item) => {
      const announcement = docData<Announcement>(item, "announcementId");
      return {
        ...announcement,
        publishedAt: readIsoDate(announcement.publishedAt),
        updatedAt: readIsoDate(announcement.updatedAt),
      };
    })
    .sort(byDateDesc((announcement) => announcement.publishedAt || announcement.updatedAt));
}

export async function saveAnnouncement(input: AnnouncementInput, actor: PadelUser | null) {
  ensureFirebaseReady();
  const payload = {
    communityId: input.communityId || "",
    title: input.title,
    content: input.content,
    visible: input.visible,
    publishedAt: input.publishedAt || nowIso(),
  };

  if (hasApiBaseUrl()) {
    if (input.announcementId) {
      return apiRequest<Announcement>(`/admin/announcements/${input.announcementId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    }
    return apiRequest<Announcement>("/admin/announcements", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  const announcementId = input.announcementId || crypto.randomUUID().replace(/-/g, "");
  await setDoc(
    doc(db, "announcements", announcementId),
    {
      announcementId,
      ...payload,
      createdByUid: actor?.uid || "",
      createdByName: actor ? displayNameForUser(actor) : "",
      updatedAt: nowIso(),
    },
    { merge: true },
  );
  return { announcementId, ...payload };
}

export async function hideAnnouncement(announcementId: string) {
  ensureFirebaseReady();
  if (hasApiBaseUrl()) {
    await apiRequest(`/admin/announcements/${announcementId}`, { method: "DELETE" });
    return;
  }
  await updateDoc(doc(db, "announcements", announcementId), {
    visible: false,
    updatedAt: nowIso(),
  });
}
