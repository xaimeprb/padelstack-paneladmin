import { Inbox } from "lucide-react";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="empty-state">
      <Inbox size={28} />
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}
