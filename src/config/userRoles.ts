import { db } from "./firebase";
import { doc, getDoc, setDoc, getDocs, collection, limit, query, where, deleteDoc } from "firebase/firestore";

export type UserRole = 
  | "super_admin" 
  | "admin" 
  | "co_admin" 
  | "editor" 
  | "reviewer" 
  | "viewer"
  | "node_auditor"
  | "billing_manager"
  | "research_director"
  | "support_agent"
  | "security_officer"
  | "data_curator"
  | "devrel_manager"
  | "governance_delegate"
  | "infrastructure_operator"
  | "compliance_counsel";

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  status: "active" | "disabled";
  createdAt: string;
  lastLogin: string;
  password?: string; // SHA-256 hashed password
}

export async function getOrCreateUserProfile(uid: string, email: string): Promise<UserProfile> {
  const userRef = doc(db, "admins", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data() as UserProfile;
    const now = new Date().toISOString();
    await setDoc(userRef, { lastLogin: now }, { merge: true });
    return { ...data, lastLogin: now };
  }

  // Check if there is an invited admin doc with this email
  const adminsRef = collection(db, "admins");
  const emailQuery = query(adminsRef, where("email", "==", email.toLowerCase().trim()));
  const emailSnap = await getDocs(emailQuery);

  if (!emailSnap.empty) {
    const invitedDoc = emailSnap.docs[0];
    const invitedData = invitedDoc.data();
    const now = new Date().toISOString();
    
    const migratedProfile: UserProfile = {
      uid,
      email: invitedData.email || email,
      role: (invitedData.role || "viewer") as UserRole,
      status: (invitedData.status || "active") as "active" | "disabled",
      createdAt: invitedData.createdAt || now,
      lastLogin: now,
      password: invitedData.password || "",
    };

    await setDoc(userRef, migratedProfile);

    if (invitedDoc.id !== uid) {
      await deleteDoc(invitedDoc.ref);
    }

    return migratedProfile;
  }

  const limitQuery = query(adminsRef, limit(1));
  const limitSnap = await getDocs(limitQuery);

  // If the admins collection is completely empty, allow the first user to become super_admin
  if (limitSnap.empty) {
    const newProfile: UserProfile = {
      uid,
      email,
      role: "super_admin",
      status: "active",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  }

  // Otherwise, deny admin panel access completely
  throw new Error("Access Denied: You do not have administrator permissions.");
}

export function hasRoleAccess(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
  const rolesOrder: UserRole[] = [
    "viewer",
    "support_agent",
    "reviewer",
    "compliance_counsel",
    "data_curator",
    "editor",
    "research_director",
    "devrel_manager",
    "node_auditor",
    "billing_manager",
    "governance_delegate",
    "security_officer",
    "co_admin",
    "infrastructure_operator",
    "admin",
    "super_admin"
  ];
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }

  const userIndex = rolesOrder.indexOf(userRole);
  const requiredIndex = rolesOrder.indexOf(requiredRole);
  
  return userIndex >= requiredIndex;
}
