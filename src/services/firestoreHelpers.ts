import { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";

export function readIsoDate(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  return String(value);
}

export function docData<T extends Record<string, unknown>>(snapshot: QueryDocumentSnapshot<DocumentData>, idKey: keyof T) {
  const data = snapshot.data() as T;
  return {
    ...data,
    [idKey]: data[idKey] || snapshot.id,
  } as T;
}

export function nowIso() {
  return new Date().toISOString();
}

export function byDateDesc<T>(getter: (item: T) => string | undefined) {
  return (a: T, b: T) => (getter(b) ?? "").localeCompare(getter(a) ?? "");
}

export function includesSearch(value: unknown, search: string) {
  return String(value ?? "").toLowerCase().includes(search.trim().toLowerCase());
}
