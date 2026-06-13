type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

export function Badge({ children, tone = "neutral" }: { children: string; tone?: BadgeTone }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function toneForStatus(status?: string): BadgeTone {
  if (!status) return "neutral";
  if (["ACTIVE", "VISIBLE", "OPEN"].includes(status)) return "success";
  if (["IN_PROGRESS", "PENDING"].includes(status)) return "warning";
  if (["CANCELLED", "REJECTED"].includes(status)) return "danger";
  if (["RESOLVED", "SUPERADMIN"].includes(status)) return "info";
  return "neutral";
}

export function toneForRole(role?: string): BadgeTone {
  if (role === "SUPERADMIN") return "info";
  if (role === "ADMIN") return "warning";
  if (role === "NEIGHBOR") return "neutral";
  return "danger";
}
