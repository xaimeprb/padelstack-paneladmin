import { collection, getDocs } from "firebase/firestore";
import { db, ensureFirebaseReady } from "../../services/firebase";
import { byDateDesc, docData, readIsoDate } from "../../services/firestoreHelpers";

export type Reservation = {
  reservationId: string;
  communityId?: string;
  userId?: string;
  userEmail?: string;
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
};

export async function listReservations() {
  ensureFirebaseReady();
  const snapshot = await getDocs(collection(db, "reservations"));
  return snapshot.docs
    .map((item) => {
      const reservation = docData<Reservation>(item, "reservationId");
      return {
        ...reservation,
        createdAt: readIsoDate(reservation.createdAt),
        updatedAt: readIsoDate(reservation.updatedAt),
        cancelledAt: readIsoDate(reservation.cancelledAt),
      };
    })
    .sort(byDateDesc((reservation) => reservation.date || reservation.createdAt));
}
