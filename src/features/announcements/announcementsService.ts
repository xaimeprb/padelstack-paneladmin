import { apiRequest } from "../../services/apiClient";
import { byDateDesc, readIsoDate } from "../../services/dataHelpers";
import { PadelUser } from "../users/usersTypes";

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
  const announcements = await apiRequest<Announcement[]>("/admin/announcements");
  return announcements
    .map((announcement) => ({
      ...announcement,
      publishedAt: readIsoDate(announcement.publishedAt),
      updatedAt: readIsoDate(announcement.updatedAt),
    }))
    .sort(byDateDesc((announcement) => announcement.publishedAt || announcement.updatedAt));
}

export async function saveAnnouncement(input: AnnouncementInput, _actor: PadelUser | null) {
  const payload = {
    communityId: input.communityId || "",
    title: input.title,
    content: input.content,
    visible: input.visible,
    publishedAt: input.publishedAt,
  };

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

export async function hideAnnouncement(announcementId: string) {
  await apiRequest(`/admin/announcements/${announcementId}`, { method: "DELETE" });
}

export async function setAnnouncementVisibility(announcementId: string, visible: boolean) {
  return apiRequest<Announcement>(`/admin/announcements/${announcementId}/visibility`, {
    method: "PATCH",
    body: JSON.stringify({ visible }),
  });
}
