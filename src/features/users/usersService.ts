import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db, ensureFirebaseReady } from "../../services/firebase";
import { byDateDesc, docData, nowIso, readIsoDate } from "../../services/firestoreHelpers";
import { PadelUser, UserRole } from "./usersTypes";

function normalizeUser(user: PadelUser): PadelUser {
  return {
    ...user,
    displayName: user.displayName || user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" "),
    createdAt: readIsoDate(user.createdAt),
    updatedAt: readIsoDate(user.updatedAt),
  };
}

export async function listUsers() {
  ensureFirebaseReady();
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs
    .map((item) => normalizeUser(docData<PadelUser>(item, "uid")))
    .sort(byDateDesc((user) => user.createdAt || user.updatedAt));
}

export async function updateUserRole(uid: string, role: UserRole) {
  ensureFirebaseReady();
  await updateDoc(doc(db, "users", uid), {
    role,
    updatedAt: nowIso(),
  });
}

export async function updateUserStatus(uid: string, active: boolean) {
  ensureFirebaseReady();
  await updateDoc(doc(db, "users", uid), {
    active,
    updatedAt: nowIso(),
  });
}
