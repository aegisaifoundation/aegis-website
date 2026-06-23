"use client";

import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, deleteDoc, doc, onSnapshot, getDocs, writeBatch } from "firebase/firestore";

export interface NodeRequest {
  id: string;
  name: string;
  email: string;
  country: string;
  institution: string;
  role: string;
  date: string;
  timestamp: number;
  status?: "pending" | "approved" | "rejected" | "quarantined";
  approvedUserId?: string;
  approvedPassword?: string;
  type?: "new_operator" | "node_registration";
  userId?: string;
  gpuSpecs?: string;
}

const storageKey = "aegis_node_requests";

export function readNodeRequests(): NodeRequest[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

export function saveNodeRequests(requests: NodeRequest[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, JSON.stringify(requests));
    window.dispatchEvent(new Event("aegis-node-requests-changed"));
  }
}

export function addNodeRequest(request: Omit<NodeRequest, "id" | "date" | "timestamp">) {
  const newRequest = {
    ...request,
    status: "pending",
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    timestamp: Date.now(),
  };

  try {
    const colRef = collection(db, "node_requests");
    addDoc(colRef, newRequest).catch((err) => console.error("Firestore addNodeRequest failed:", err));
  } catch (err) {
    console.error("Firestore connection failed in addNodeRequest:", err);
  }
}

export function deleteNodeRequest(id: string) {
  try {
    const docRef = doc(db, "node_requests", id);
    deleteDoc(docRef).catch((err) => console.error("Firestore deleteNodeRequest failed:", err));
  } catch (err) {
    console.error("Firestore connection failed in deleteNodeRequest:", err);
  }
}

export async function clearNodeRequests() {
  try {
    const colRef = collection(db, "node_requests");
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  } catch (err) {
    console.error("Firestore clearNodeRequests failed:", err);
  }
}

export function useNodeRequests() {
  const [requests, setRequests] = useState<NodeRequest[]>(() => readNodeRequests());

  useEffect(() => {
    const sync = () => setRequests(readNodeRequests());
    window.addEventListener("aegis-node-requests-changed", sync);

    let unsubscribe = () => {};
    try {
      const colRef = collection(db, "node_requests");
      unsubscribe = onSnapshot(colRef, (snapshot) => {
        const list: NodeRequest[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            name: data.name || "",
            email: data.email || "",
            country: data.country || "",
            institution: data.institution || "",
            role: data.role || "",
            date: data.date || "",
            timestamp: data.timestamp || 0,
            status: data.status || "pending",
            approvedUserId: data.approvedUserId || "",
            approvedPassword: data.approvedPassword || "",
            type: data.type || "new_operator",
            userId: data.userId || "",
            gpuSpecs: data.gpuSpecs || "",
          });
        });
        list.sort((a, b) => b.timestamp - a.timestamp);
        setRequests(list);
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(list));
        }
      }, (err) => {
        console.warn("Firestore node requests listener warning:", err);
      });
    } catch (err) {
      console.error("Firestore hook listener creation failed:", err);
    }

    return () => {
      window.removeEventListener("aegis-node-requests-changed", sync);
      unsubscribe();
    };
  }, []);

  return requests;
}
