import { db, auth } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export async function logActivity(action: string, details: string) {
  try {
    const userEmail = auth.currentUser?.email || "system";
    await addDoc(collection(db, "activity_logs"), {
      action,
      user: userEmail,
      time: new Date().toISOString(),
      details,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
}

export async function addNotification(type: string, message: string) {
  try {
    await addDoc(collection(db, "notifications"), {
      type,
      message,
      read: false,
      timestamp: Date.now(),
      date: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to write notification:", err);
  }
}
