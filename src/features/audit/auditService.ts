import { apiRequest } from "../../services/apiClient";
import { byDateDesc, readIsoDate } from "../../services/dataHelpers";

export type AuditLog = {
  auditLogId: string;
  createdAt?: string;
  actorUid?: string;
  actorName?: string;
  actorEmail?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
};

export async function listAuditLogs() {
  const logs = await apiRequest<AuditLog[]>("/admin/audit-logs");
  return logs
    .map((log) => ({
      ...log,
      createdAt: readIsoDate(log.createdAt),
    }))
    .sort(byDateDesc((log) => log.createdAt));
}
