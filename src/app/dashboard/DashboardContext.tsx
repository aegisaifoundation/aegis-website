"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db, auth } from "@/config/firebase";
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export interface UserProfile {
  userId: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface AINode {
  id: string;
  name: string;
  country: string;
  latency: number;
  status: "online" | "offline";
  capabilities: string;
  lastHeartbeat: string;
  flag?: string;
  region?: string;
  uptime?: string;
  vram?: string;
  lastSeen?: string;
  ipAddress?: string;
  registeredOn?: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  os?: string;
  computeHrs?: string;
}

export interface PendingRequest {
  id: string;
  name: string;
  country: string;
  gpuSpecs: string;
  status: "pending" | "approved" | "rejected" | "quarantined";
  date: string;
  subtitle?: string;
  time?: string;
}

export type WorkflowType = "api-key" | "download" | "request" | "upgrade" | "support" | "organization" | "project" | "agent" | "danger";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export interface DashboardContextProps {
  profile: UserProfile | null;
  userNodes: AINode[];
  userRequests: PendingRequest[];
  loading: boolean;
  error: string;
  setError: (err: string) => void;
  handleLogout: () => Promise<void>;
  
  // Registration form
  nodeName: string;
  setNodeName: (val: string) => void;
  nodeLocation: string;
  setNodeLocation: (val: string) => void;
  gpuSpecs: string;
  setGpuSpecs: (val: string) => void;
  regError: string;
  regSuccess: string;
  regLoading: boolean;
  handleRegisterNode: (e: React.FormEvent) => Promise<void>;
  
  // Password change form
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  passError: string;
  passSuccess: string;
  passLoading: boolean;
  handlePasswordChange: (e: React.FormEvent) => Promise<void>;

  // Modal workflows
  openWorkflow: (workflow: WorkflowType) => void;
  activeWorkflow: WorkflowType | null;
  setActiveWorkflow: (workflow: WorkflowType | null) => void;
  
  // Settings Tab
  settingsTab: string;
  setSettingsTab: (val: string) => void;
}

export const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState("");
  const [settingsTab, setSettingsTab] = useState<string>("profile");
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowType | null>(null);

  // Real-time Lists from Firestore
  const [userNodes, setUserNodes] = useState<AINode[]>([]);
  const [userRequests, setUserRequests] = useState<PendingRequest[]>([]);

  // Node registration form state
  const [nodeName, setNodeName] = useState("");
  const [nodeLocation, setNodeLocation] = useState("");
  const [gpuSpecs, setGpuSpecs] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  const openWorkflow = (workflow: WorkflowType) => {
    setActiveWorkflow(workflow);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          const qUser = query(collection(db, "users"), where("email", "==", user.email));
          const snapUser = await getDocs(qUser);
          
          if (snapUser.empty) {
            setError("User profile not found. Please contact support.");
            setLoading(false);
            return;
          }
          
          const userData = snapUser.docs[0].data();
          if (userData.status === "disabled") {
            setError("Your account has been disabled. Please contact support.");
            await signOut(auth);
            router.push("/login");
            return;
          }
          
          setProfile({
            userId: user.uid,
            email: user.email || "",
            role: userData.role || "node_operator",
            status: userData.status || "active",
            createdAt: userData.createdAt || new Date().toISOString(),
          });
          setLoading(false);
          return;
        }

        const userData = userSnap.data();
        if (userData.status === "disabled") {
          setError("Your account has been disabled. Please contact support.");
          await signOut(auth);
          router.push("/login");
          return;
        }

        setProfile({
          userId: user.uid,
          email: user.email || "",
          role: userData.role || "node_operator",
          status: userData.status || "active",
          createdAt: userData.createdAt || new Date().toISOString(),
        });
      } catch (err: unknown) {
        console.error("Session verification failed:", err);
        setError("Database validation failed. Please reload or login again.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (!profile) return;

    // 1. Sync Nodes owned by this operator
    const nodesQuery = query(collection(db, "nodes"), where("ownerId", "==", profile.userId));
    const unsubscribeNodes = onSnapshot(
      nodesQuery,
      (snapshot) => {
        const list: AINode[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as AINode);
        });
        setUserNodes(list);
      },
      (err) => {
        console.error("Failed to sync user nodes:", err);
      },
    );

    // 2. Sync Pending/All Node requests submitted by this operator
    const requestsQuery = query(
      collection(db, "node_requests"),
      where("userId", "==", profile.userId),
      where("type", "==", "node_registration"),
    );
    const unsubscribeRequests = onSnapshot(
      requestsQuery,
      (snapshot) => {
        const list: PendingRequest[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            name: data.name || "",
            country: data.country || "",
            gpuSpecs: data.gpuSpecs || "",
            status: data.status || "pending",
            date: data.date || "",
          });
        });
        setUserRequests(list);
      },
      (err) => {
        console.error("Failed to sync user requests:", err);
      },
    );

    return () => {
      unsubscribeNodes();
      unsubscribeRequests();
    };
  }, [profile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Failed to sign out on Firebase Auth:", err);
    }
    window.dispatchEvent(new Event("aegis-user-login-changed"));
    router.push("/");
  };

  const handleRegisterNode = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");
    if (!profile) return;

    const name = nodeName.trim();
    const country = nodeLocation.trim();
    const gpu = gpuSpecs.trim();

    if (!name || !country || !gpu) {
      setRegError("All fields are required.");
      return;
    }

    setRegLoading(true);
    try {
      const colRef = collection(db, "node_requests");
      await addDoc(colRef, {
        name,
        email: profile.email,
        country,
        gpuSpecs: gpu,
        userId: profile.userId,
        type: "node_registration",
        status: "pending",
        role: "Operator Node",
        institution: gpu,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: Date.now(),
      });

      setRegSuccess(`Successfully submitted node registration request for "${name}". Pending admin approval.`);
      setNodeName("");
      setNodeLocation("");
      setGpuSpecs("");
    } catch (err: unknown) {
      setRegError("Failed to submit node request: " + getErrorMessage(err));
    } finally {
      setRegLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!profile) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError("All fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("Passwords do not match.");
      return;
    }

    setPassLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setPassError("User session not found. Please log in again.");
        return;
      }

      const credential = EmailAuthProvider.credential(user.email || "", currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setPassSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Password change failed:", err);
      setPassError(err.message || "Failed to update password.");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        profile,
        userNodes,
        userRequests,
        loading,
        error,
        setError,
        handleLogout,
        
        nodeName,
        setNodeName,
        nodeLocation,
        setNodeLocation,
        gpuSpecs,
        setGpuSpecs,
        regError,
        regSuccess,
        regLoading,
        handleRegisterNode,

        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        passError,
        passSuccess,
        passLoading,
        handlePasswordChange,

        openWorkflow,
        activeWorkflow,
        setActiveWorkflow,

        settingsTab,
        setSettingsTab
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
