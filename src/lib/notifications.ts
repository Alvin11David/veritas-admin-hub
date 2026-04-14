import { db } from "@/config/firebase";
import { addDoc, collection } from "firebase/firestore";

export type NotificationType = "create" | "update" | "delete";

export interface NotificationPayload {
  action: string;
  target: string;
  type: NotificationType;
  module:
    | "faculty"
    | "events"
    | "programs"
    | "gallery"
    | "faqs"
    | "quick-links"
    | "research"
    | "alumni"
    | "scholarships";
  user?: string;
}

export async function createAdminNotification(payload: NotificationPayload) {
  const now = new Date();
  await addDoc(collection(db, "notifications"), {
    action: payload.action,
    target: payload.target,
    type: payload.type,
    module: payload.module,
    user: payload.user || "Admin",
    timestamp: now.toISOString(),
    createdAt: now.toISOString(),
  });
}
