import { apiRequest } from "../../services/apiClient";
import { byDateDesc, readIsoDate } from "../../services/dataHelpers";

export type Reservation = {
  reservationId: string;
  communityId?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userFullName?: string;
  resourceId?: string;
  resourceName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  slotLabel?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  cancelledAt?: string;
  cancelledByUid?: string;
  cancelledByName?: string;
  cancellationReason?: string;
};

export async function listReservations() {
  const reservations = await apiRequest<Reservation[]>("/admin/reservations");
  return reservations
    .map((reservation) => ({
      ...reservation,
      userFullName: reservation.userFullName || reservation.userName,
      createdAt: readIsoDate(reservation.createdAt),
      updatedAt: readIsoDate(reservation.updatedAt),
      cancelledAt: readIsoDate(reservation.cancelledAt),
    }))
    .sort(byDateDesc((reservation) => reservation.date || reservation.createdAt));
}

export async function cancelReservation(reservationId: string, reason: string) {
  return apiRequest<Reservation>(`/admin/reservations/${reservationId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}
