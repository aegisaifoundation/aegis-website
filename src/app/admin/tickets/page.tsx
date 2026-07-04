"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { 
  ClipboardCheck, Plus, Search, Filter, Play, CheckCircle2, AlertOctagon, 
  Clock, CheckSquare, Layers, Shield, User, ArrowRight, Save, Trash2, 
  MessageSquare, History, FileText, BarChart3, TrendingUp, RefreshCw, X,
  Folder, Calendar, CheckCircle, Tag, GitBranch, AlertTriangle, Paperclip,
  Check, UserCheck, Inbox, Activity
} from "lucide-react";
import { db, auth } from "@/config/firebase";
import { 
  collection, doc, setDoc, addDoc, getDocs, deleteDoc, updateDoc, 
  query, where, onSnapshot, orderBy, limit, writeBatch, getDoc 
} from "firebase/firestore";
import { getOrCreateUserProfile, UserProfile, UserRole, getUserDepartment } from "@/config/userRoles";
import { logActivity, addNotification } from "@/config/activityLogger";

// Core models
interface DepartmentMember {
  uid: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  avatarUrl: string;
  availability: "Available" | "Busy" | "On Leave";
  onlineStatus: "Online" | "Offline";
  workloadPoints: number;
  activeTicketsCount: number;
  completedTicketsCount: number;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  department: string;
  project: string;
  module: string;
  type: "Epic" | "Story" | "Feature" | "Task" | "Bug" | "Improvement" | "Research" | "Documentation" | "Security" | "Maintenance";
  priority: "Critical" | "High" | "Medium" | "Low";
  severity: "Blocker" | "Major" | "Minor" | "Trivial";
  status: "Backlog" | "Ready" | "In Progress" | "Review" | "Testing" | "Blocked" | "Completed";
  sprint: string;
  milestone: string;
  labels: string[];
  storyPoints: number;
  estimatedHours: number;
  startDate: string;
  dueDate: string;
  assigneeId: string;
  assigneeName: string;
  reporterId: string;
  reporterName: string;
  acceptanceCriteria: string;
  technicalNotes: string;
  definitionOfDone: string;
  branchName: string;
  commitMessage: string;
  pullRequestTitle: string;
  createdAt: string;
  updatedAt: string;
  timestamp: number;
}

interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}

interface TicketActivity {
  id: string;
  ticketId: string;
  user: string;
  action: string;
  details: string;
  timestamp: number;
}

interface TicketAttachment {
  id: string;
  ticketId: string;
  name: string;
  size: string;
  url: string;
  uploadedBy: string;
  timestamp: number;
}



const isManagerOfDept = (role: string, department: string): boolean => {
  if (['super_admin', 'admin', 'co_admin', 'ceo'].includes(role)) return true;
  
  if (department === 'Technology & AI') return ['cto', 'vp_engineering', 'engineering_manager', 'chief_ai_officer'].includes(role);
  if (department === 'Product & UX') return ['cpo', 'product_manager', 'product_owner'].includes(role);
  if (department === 'Cybersecurity & SOC') return ['ciso', 'security_officer'].includes(role);
  if (department === 'Sales & Marketing') return ['cro', 'cmo', 'marketing_director', 'enterprise_sales_manager'].includes(role);
  if (department === 'Operations & Finance') return ['coo', 'cfo', 'operations_manager', 'finance_manager'].includes(role);
  if (department === 'HR & Legal') return ['chro', 'hr_manager', 'general_counsel'].includes(role);
  if (department === 'Research') return ['research_director', 'research_manager'].includes(role);
  
  return false;
};

export default function TicketManagementPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "workspace" | "board" | "directory" | "create" | "analytics">("dashboard");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Firestore Sync collections state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [activities, setActivities] = useState<TicketActivity[]>([]);

  // Metadata dropdown options
  const [projects, setProjects] = useState<string[]>([]);
  const [sprints, setSprints] = useState<string[]>([]);
  const [milestones, setMilestones] = useState<string[]>([]);

  // Metadata Creator controls
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectInput, setNewProjectInput] = useState("");
  
  const [showAddSprint, setShowAddSprint] = useState(false);
  const [newSprintInput, setNewSprintInput] = useState("");

  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestoneInput, setNewMilestoneInput] = useState("");

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProject, setFilterProject] = useState("ALL");
  const [filterSprint, setFilterSprint] = useState("ALL");
  const [filterMilestone, setFilterMilestone] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [filterAssignee, setFilterAssignee] = useState("ALL");

  // Selection Detail Overlay state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [newAttachmentName, setNewAttachmentName] = useState("");
  const [newAttachmentSize, setNewAttachmentSize] = useState("1.2 MB");
  const [ticketTimeline, setTicketTimeline] = useState<TicketActivity[]>([]);

  // Workspace subtab state
  const [workspaceSubtab, setWorkspaceSubtab] = useState<"assigned" | "progress" | "review" | "blocked" | "completed">("assigned");

  // Ticket creation form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDept, setFormDept] = useState("Technology & AI");
  const [formProject, setFormProject] = useState("");
  const [formModule, setFormModule] = useState("");
  const [formType, setFormType] = useState<Ticket["type"]>("Task");
  const [formPriority, setFormPriority] = useState<Ticket["priority"]>("Medium");
  const [formSeverity, setFormSeverity] = useState<Ticket["severity"]>("Minor");
  const [formSprint, setFormSprint] = useState("");
  const [formMilestone, setFormMilestone] = useState("");
  const [formLabels, setFormLabels] = useState("");
  const [formStoryPoints, setFormStoryPoints] = useState(3);
  const [formEstHours, setFormEstHours] = useState(8);
  const [formStartDate, setFormStartDate] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formAssigneeId, setFormAssigneeId] = useState("");
  const [formCriteria, setFormCriteria] = useState("");
  const [formTechNotes, setFormTechNotes] = useState("");
  const [formDoneDef, setFormDoneDef] = useState("");
  const [formBranchName, setFormBranchName] = useState("");
  const [formCommitMsg, setFormCommitMsg] = useState("");
  const [formPrTitle, setFormPrTitle] = useState("");

  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  // Derived user parameters
  const userDept = useMemo(() => profile ? getUserDepartment(profile.role) : "", [profile]);
  const isUserExec = useMemo(() => profile ? ['super_admin', 'admin', 'co_admin', 'ceo'].includes(profile.role) : false, [profile]);
  const isUserMngr = useMemo(() => (profile && userDept) ? isManagerOfDept(profile.role, userDept) : false, [profile, userDept]);

  // Authenticate session
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const prof = await getOrCreateUserProfile(user.uid, user.email || "");
          setProfile(prof);
          setFormDept(getUserDepartment(prof.role) === "Executive" ? "Technology & AI" : getUserDepartment(prof.role));
        } catch (err) {
          console.error("Failed to load user permissions for tickets:", err);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Sync core collections
  useEffect(() => {
    if (!profile) return;

    // 1. Sync tickets from database
    let ticketsQuery = query(collection(db, "tickets"));
    if (!isUserExec) {
      ticketsQuery = query(collection(db, "tickets"), where("department", "==", userDept));
    }

    const unsubTickets = onSnapshot(ticketsQuery, (snapshot) => {
      const list: Ticket[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Ticket;
        // Enforce employee specific filter
        if (isUserExec || isUserMngr || data.assigneeId === profile.uid || data.reporterId === profile.uid) {
          list.push({ ...data, id: doc.id });
        }
      });
      list.sort((a, b) => b.timestamp - a.timestamp);
      setTickets(list);
    }, (err) => console.error("Sync tickets failed:", err));

    // 2. Sync real members directly from the "admins" database collection
    const unsubMembers = onSnapshot(collection(db, "admins"), (snapshot) => {
      const list: DepartmentMember[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const email = data.email || "";
        const role = data.role || "viewer";
        const status = data.status || "active";
        const dept = getUserDepartment(role);

        // Filter based on user's department boundary
        if (isUserExec || dept === userDept) {
          list.push({
            uid: docSnap.id,
            employeeId: `EMP-${docSnap.id.substring(0, 4).toUpperCase()}`,
            name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
            role: role.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
            department: dept,
            avatarUrl: "",
            availability: status === "disabled" ? "On Leave" : "Available",
            onlineStatus: status === "disabled" ? "Offline" : "Online",
            workloadPoints: 0, 
            activeTicketsCount: 0,
            completedTicketsCount: 0
          });
        }
      });
      setMembers(list);
    }, (err) => console.error("Sync admins as members failed:", err));

    // 3. Sync metadata lists
    const unsubProjects = onSnapshot(collection(db, "ticket_projects"), (snap) => {
      const items: string[] = [];
      snap.forEach(d => items.push(d.data().name));
      setProjects(items);
      if (items.length > 0 && !formProject) setFormProject(items[0]);
    });

    const unsubSprints = onSnapshot(collection(db, "ticket_sprints"), (snap) => {
      const items: string[] = [];
      snap.forEach(d => items.push(d.data().name));
      setSprints(items);
      if (items.length > 0 && !formSprint) setFormSprint(items[0]);
    });

    const unsubMilestones = onSnapshot(collection(db, "ticket_milestones"), (snap) => {
      const items: string[] = [];
      snap.forEach(d => items.push(d.data().name));
      setMilestones(items);
      if (items.length > 0 && !formMilestone) setFormMilestone(items[0]);
    });

    // 4. Sync activities
    const qActivities = query(collection(db, "ticket_activity"), orderBy("timestamp", "desc"), limit(20));
    const unsubActivities = onSnapshot(qActivities, (snap) => {
      const list: TicketActivity[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as TicketActivity));
      setActivities(list);
    });

    return () => {
      unsubTickets();
      unsubMembers();
      unsubProjects();
      unsubSprints();
      unsubMilestones();
      unsubActivities();
    };
  }, [profile, userDept, isUserExec, isUserMngr]);

  // Sync comments & timelines when a ticket is selected
  useEffect(() => {
    if (!selectedTicket) return;

    const qComments = query(collection(db, "ticket_comments"), where("ticketId", "==", selectedTicket.id));
    const unsubComments = onSnapshot(qComments, (snap) => {
      const list: TicketComment[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as TicketComment));
      list.sort((a, b) => a.timestamp - b.timestamp);
      setComments(list);
    });

    const qTimeline = query(collection(db, "ticket_activity"), where("ticketId", "==", selectedTicket.id));
    const unsubTimeline = onSnapshot(qTimeline, (snap) => {
      const list: TicketActivity[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as TicketActivity));
      list.sort((a, b) => b.timestamp - a.timestamp);
      setTicketTimeline(list);
    });

    const qAttach = query(collection(db, "ticket_attachments"), where("ticketId", "==", selectedTicket.id));
    const unsubAttach = onSnapshot(qAttach, (snap) => {
      const list: TicketAttachment[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as TicketAttachment));
      list.sort((a, b) => a.timestamp - b.timestamp);
      setAttachments(list);
    });

    return () => {
      unsubComments();
      unsubTimeline();
      unsubAttach();
    };
  }, [selectedTicket]);

  // Dynamically compute workloads for department members based on actual tickets
  const membersWithWorkload = useMemo(() => {
    return members.map(m => {
      const memberTickets = tickets.filter(t => t.assigneeId === m.uid);
      const active = memberTickets.filter(t => t.status !== "Completed" && t.status !== "Blocked");
      const completed = memberTickets.filter(t => t.status === "Completed");
      const workload = active.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
      
      return {
        ...m,
        workloadPoints: workload,
        activeTicketsCount: active.length,
        completedTicketsCount: completed.length
      };
    });
  }, [members, tickets]);

  // Create Metadata Helpers
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectInput.trim()) return;
    try {
      const id = `proj-${Date.now()}`;
      await setDoc(doc(db, "ticket_projects", id), { name: newProjectInput.trim() });
      setFormProject(newProjectInput.trim());
      setNewProjectInput("");
      setShowAddProject(false);
    } catch (err: any) {
      alert("Failed to add project: " + err.message);
    }
  };

  const handleAddSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintInput.trim()) return;
    try {
      const id = `sprint-${Date.now()}`;
      await setDoc(doc(db, "ticket_sprints", id), { name: newSprintInput.trim() });
      setFormSprint(newSprintInput.trim());
      setNewSprintInput("");
      setShowAddSprint(false);
    } catch (err: any) {
      alert("Failed to add sprint: " + err.message);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneInput.trim()) return;
    try {
      const id = `milestone-${Date.now()}`;
      await setDoc(doc(db, "ticket_milestones", id), { name: newMilestoneInput.trim() });
      setFormMilestone(newMilestoneInput.trim());
      setNewMilestoneInput("");
      setShowAddMilestone(false);
    } catch (err: any) {
      alert("Failed to add milestone: " + err.message);
    }
  };

  // Create Ticket Submit
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const currentDept = isUserExec ? formDept : userDept;

    if (!isUserExec && !isUserMngr) {
      alert("Permission Denied: Only Department Managers or Executives can create tickets.");
      return;
    }

    if (!formTitle.trim()) {
      alert("Please enter a ticket title.");
      return;
    }

    if (!formProject) {
      alert("Please select a Project from the database. If none exist, create one using '+ Add Project' first.");
      return;
    }

    if (!formSprint) {
      alert("Please select a Sprint from the database. If none exist, create one using '+ Add Sprint' first.");
      return;
    }

    if (!formMilestone) {
      alert("Please select a Milestone from the database. If none exist, create one using '+ Add Milestone' first.");
      return;
    }

    const matchedAssignee = members.find(m => m.uid === formAssigneeId);
    if (formAssigneeId && !matchedAssignee) {
      alert("Invalid employee assignment.");
      return;
    }

    try {
      const randIdNum = Math.floor(1000 + Math.random() * 9000);
      const ticketId = `AGS-${randIdNum}`;
      
      const newTicket: Ticket = {
        id: ticketId,
        title: formTitle.trim(),
        description: formDesc.trim(),
        department: currentDept,
        project: formProject,
        module: formModule.trim(),
        type: formType,
        priority: formPriority,
        severity: formSeverity,
        status: "Backlog",
        sprint: formSprint,
        milestone: formMilestone,
        labels: formLabels ? formLabels.split(",").map(l => l.trim()).filter(Boolean) : [],
        storyPoints: Number(formStoryPoints),
        estimatedHours: Number(formEstHours),
        startDate: formStartDate || new Date().toISOString().split("T")[0],
        dueDate: formDueDate || new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
        assigneeId: formAssigneeId || "",
        assigneeName: matchedAssignee ? matchedAssignee.name : "Unassigned",
        reporterId: profile.uid,
        reporterName: profile.email.split("@")[0],
        acceptanceCriteria: formCriteria.trim(),
        technicalNotes: formTechNotes.trim(),
        definitionOfDone: formDoneDef.trim(),
        branchName: formBranchName.trim(),
        commitMessage: formCommitMsg.trim(),
        pullRequestTitle: formPrTitle.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timestamp: Date.now()
      };

      await setDoc(doc(db, "tickets", ticketId), newTicket);

      // Log activity
      await addDoc(collection(db, "ticket_activity"), {
        ticketId,
        user: profile.email,
        action: "TICKET_CREATED",
        details: `Created ticket ${ticketId}: "${formTitle.trim()}" in ${currentDept}`,
        timestamp: Date.now()
      });

      await logActivity("CREATE_TICKET", `Created ticket ${ticketId} in ${currentDept}`);

      if (formAssigneeId) {
        await addNotification("TICKET_ASSIGNED", `Ticket ${ticketId} has been assigned to you by manager ${profile.email}`);
      }

      // Reset form
      setFormTitle("");
      setFormDesc("");
      setFormModule("");
      setFormAssigneeId("");
      setAssigneeSearch("");
      setFormCriteria("");
      setFormTechNotes("");
      setFormDoneDef("");
      setFormBranchName("");
      setFormCommitMsg("");
      setFormPrTitle("");
      
      alert(`Ticket ${ticketId} created successfully!`);
      setActiveTab("dashboard");
    } catch (err: any) {
      alert("Failed to create ticket: " + err.message);
    }
  };

  // Workflow transitions
  const handleWorkflowTransition = async (ticket: Ticket, nextStatus: Ticket["status"]) => {
    if (!profile) return;

    try {
      const ticketRef = doc(db, "tickets", ticket.id);
      await updateDoc(ticketRef, {
        status: nextStatus,
        updatedAt: new Date().toISOString()
      });

      await addDoc(collection(db, "ticket_activity"), {
        ticketId: ticket.id,
        user: profile.email,
        action: "STATUS_CHANGED",
        details: `Advanced status from ${ticket.status} to ${nextStatus}`,
        timestamp: Date.now()
      });

      await logActivity("TICKET_STATUS_CHANGED", `Updated status of ${ticket.id} to ${nextStatus}`);
      await addNotification("TICKET_STATUS", `Ticket ${ticket.id} status updated to [${nextStatus}]`);

      if (selectedTicket && selectedTicket.id === ticket.id) {
        setSelectedTicket(prev => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (err: any) {
      alert("Failed to advance workflow: " + err.message);
    }
  };

  // Submit Comments
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedTicket || !newCommentText.trim()) return;

    try {
      const commentId = `comment-${Date.now()}`;
      await setDoc(doc(db, "ticket_comments", commentId), {
        id: commentId,
        ticketId: selectedTicket.id,
        userId: profile.uid,
        userName: profile.email.split("@")[0],
        content: newCommentText.trim(),
        timestamp: Date.now()
      });

      await addDoc(collection(db, "ticket_activity"), {
        ticketId: selectedTicket.id,
        user: profile.email,
        action: "COMMENT_ADDED",
        details: `Added a comment on ${selectedTicket.id}`,
        timestamp: Date.now()
      });

      await addNotification("TICKET_COMMENT", `New comment posted on ${selectedTicket.id} by ${profile.email}`);
      setNewCommentText("");
    } catch (err: any) {
      alert("Failed to post comment: " + err.message);
    }
  };

  // Attachments Upload
  const handleUploadAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedTicket || !newAttachmentName.trim()) return;

    try {
      const id = `attach-${Date.now()}`;
      await setDoc(doc(db, "ticket_attachments", id), {
        id,
        ticketId: selectedTicket.id,
        name: newAttachmentName.trim(),
        size: newAttachmentSize,
        url: "#",
        uploadedBy: profile.email,
        timestamp: Date.now()
      });

      await addDoc(collection(db, "ticket_activity"), {
        ticketId: selectedTicket.id,
        user: profile.email,
        action: "ATTACHMENT_UPLOADED",
        details: `Uploaded file attachment "${newAttachmentName.trim()}"`,
        timestamp: Date.now()
      });

      setNewAttachmentName("");
      alert("Attachment registered successfully!");
    } catch (err: any) {
      alert("Failed to upload attachment: " + err.message);
    }
  };

  // Delete Ticket
  const handleDeleteTicket = async (id: string) => {
    if (!profile) return;
    const isUserExec = ['super_admin', 'admin', 'co_admin', 'ceo'].includes(profile.role);
    if (!isUserExec && !isManagerOfDept(profile.role, getUserDepartment(profile.role))) {
      alert("Permission Denied: Only Managers can delete tickets.");
      return;
    }

    if (confirm(`Are you sure you want to permanently delete ticket ${id}?`)) {
      try {
        await deleteDoc(doc(db, "tickets", id));
        setSelectedTicket(null);
        await logActivity("DELETE_TICKET", `Permanently deleted ticket record: ${id}`);
        alert(`Ticket ${id} deleted.`);
      } catch (err: any) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  // Filters computed logic
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch = 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.assigneeName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProject = filterProject === "ALL" || t.project === filterProject;
      const matchesSprint = filterSprint === "ALL" || t.sprint === filterSprint;
      const matchesMilestone = filterMilestone === "ALL" || t.milestone === filterMilestone;
      const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
      const matchesPriority = filterPriority === "ALL" || t.priority === filterPriority;
      const matchesType = filterType === "ALL" || t.type === filterType;
      const matchesAssignee = filterAssignee === "ALL" || t.assigneeId === filterAssignee;

      return matchesSearch && matchesProject && matchesSprint && matchesMilestone && matchesStatus && matchesPriority && matchesType && matchesAssignee;
    });
  }, [tickets, searchTerm, filterProject, filterSprint, filterMilestone, filterStatus, filterPriority, filterType, filterAssignee]);

  // Employee workspace logic
  const workspaceTickets = useMemo(() => {
    if (!profile) return [];
    return tickets.filter(t => t.assigneeId === profile.uid || t.reporterId === profile.uid);
  }, [tickets, profile]);

  const workspaceCategoryTickets = useMemo(() => {
    return workspaceTickets.filter(t => {
      if (workspaceSubtab === "assigned") return t.status === "Backlog" || t.status === "Ready";
      if (workspaceSubtab === "progress") return t.status === "In Progress";
      if (workspaceSubtab === "review") return t.status === "Review" || t.status === "Testing";
      if (workspaceSubtab === "blocked") return t.status === "Blocked";
      return t.status === "Completed";
    });
  }, [workspaceTickets, workspaceSubtab]);

  // Aggregate stats counters
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === "Ready" || t.status === "Backlog").length;
    const progress = tickets.filter(t => t.status === "In Progress").length;
    const review = tickets.filter(t => t.status === "Review" || t.status === "Testing").length;
    const blocked = tickets.filter(t => t.status === "Blocked").length;
    const completed = tickets.filter(t => t.status === "Completed").length;
    const highPriority = tickets.filter(t => t.priority === "High" || t.priority === "Critical").length;

    const today = new Date().toISOString().split("T")[0];
    const overdue = tickets.filter(t => t.status !== "Completed" && t.dueDate && t.dueDate < today).length;

    return { total, open, progress, review, blocked, completed, overdue, highPriority };
  }, [tickets]);

  // SVG stats logic: Status distribution
  const statusChartData = useMemo(() => {
    const backlog = tickets.filter(t => t.status === "Backlog").length;
    const ready = tickets.filter(t => t.status === "Ready").length;
    const progress = tickets.filter(t => t.status === "In Progress").length;
    const review = tickets.filter(t => t.status === "Review").length;
    const testing = tickets.filter(t => t.status === "Testing").length;
    const blocked = tickets.filter(t => t.status === "Blocked").length;
    const completed = tickets.filter(t => t.status === "Completed").length;

    const values = [backlog, ready, progress, review, testing, blocked, completed];
    const labels = ["Backlog", "Ready", "Progress", "Review", "Testing", "Blocked", "Completed"];
    return { values, labels };
  }, [tickets]);

  // SVG stats logic: Priority distribution
  const priorityChartData = useMemo(() => {
    const critical = tickets.filter(t => t.priority === "Critical").length;
    const high = tickets.filter(t => t.priority === "High").length;
    const medium = tickets.filter(t => t.priority === "Medium").length;
    const low = tickets.filter(t => t.priority === "Low").length;

    const values = [critical, high, medium, low];
    const labels = ["Critical", "High", "Medium", "Low"];
    return { values, labels };
  }, [tickets]);

  // Team search filtering
  const filteredSearchMembers = useMemo(() => {
    if (!assigneeSearch.trim()) return members;
    return members.filter(m => m.name.toLowerCase().includes(assigneeSearch.toLowerCase()));
  }, [members, assigneeSearch]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-mono text-gray-500 animate-pulse">
        Connecting to ticket ledger enclaves...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 font-body">
      
      {/* Header Banner */}
      <header className="border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#7DD3FC] mb-1.5">
            <ClipboardCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest font-heading">AEGIS Cooperative</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-white">TICKET MANAGEMENT</h1>
          <p className="text-xs text-gray-400 mt-1">
            Live database segmentation, sprint boards, and employee workload directories.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 shrink-0 overflow-x-auto max-w-full">
          {["dashboard", "workspace", "board", "directory", "create", "analytics"].map((tabName) => {
            if (tabName === "create" && !isUserExec && !isUserMngr) return null;
            return (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName as any)}
                className={`px-3 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tabName ? "bg-[#4D7CFE] text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {tabName === "workspace" ? `My Workspace (${workspaceTickets.filter(t => t.status !== "Completed").length})` : tabName === "board" ? "Sprint Board" : tabName}
              </button>
            );
          })}
        </div>
      </header>

      {/* ==========================================
          TAB 1: DASHBOARD VIEW
          ========================================== */}
      {activeTab === "dashboard" && (
        <div className="flex flex-col gap-6">
          
          {/* Summary counters grid */}
          <div className="grid grid-cols-2 lg:grid-cols-8 gap-4">
            {[
              { label: "Total Tickets", val: stats.total, style: "border-white/5 bg-white/[0.01]" },
              { label: "Open", val: stats.open, style: "border-[#4D7CFE]/20 bg-[#4D7CFE]/5 text-[#7DD3FC]" },
              { label: "In Progress", val: stats.progress, style: "border-purple-500/20 bg-purple-500/5 text-purple-400" },
              { label: "In Review", val: stats.review, style: "border-yellow-500/20 bg-yellow-500/5 text-yellow-400" },
              { label: "Blocked", val: stats.blocked, style: "border-red-500/20 bg-red-500/5 text-red-400" },
              { label: "Completed", val: stats.completed, style: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" },
              { label: "Overdue", val: stats.overdue, style: "border-rose-500/20 bg-rose-500/5 text-rose-400" },
              { label: "High Priority", val: stats.highPriority, style: "border-amber-500/20 bg-amber-500/5 text-amber-400" }
            ].map((card, idx) => (
              <div key={idx} className={`glass-card p-4 rounded-xl border ${card.style}`}>
                <span className="block text-2xl font-bold font-heading text-white">{card.val}</span>
                <span className="block text-[8px] text-gray-500 uppercase font-bold tracking-wider mt-1">{card.label}</span>
              </div>
            ))}
          </div>

          {/* Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Status distribution SVG Chart */}
            <div className="glass-card p-5 rounded-2xl border border-white/10 bg-[#030712]/40 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4.5 h-4.5 text-[#7DD3FC]" />
                <span className="text-xs font-heading font-bold text-white uppercase tracking-wider">Ticket Status Distribution</span>
              </div>
              {tickets.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-gray-600 italic">No tickets in database.</div>
              ) : (
                <>
                  <div className="relative h-44 w-full flex items-end">
                    <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                      {statusChartData.values.map((val, idx) => {
                        const maxVal = Math.max(...statusChartData.values, 1);
                        const barHeight = (val / maxVal) * 110 + 5;
                        const xCoord = 25 + idx * 65;
                        const yCoord = 130 - barHeight;
                        return (
                          <g key={idx} className="group">
                            <rect
                              x={xCoord}
                              y={yCoord}
                              width="24"
                              height={barHeight}
                              rx="3"
                              fill="url(#blueGrad)"
                              className="hover:fill-blue-400 transition-all duration-300"
                            />
                            <text
                              x={xCoord + 12}
                              y={yCoord - 5}
                              fill="white"
                              textAnchor="middle"
                              className="text-[9px] font-bold font-mono"
                            >
                              {val}
                            </text>
                          </g>
                        );
                      })}
                      <defs>
                        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4D7CFE" />
                          <stop offset="100%" stopColor="#3b66d9" stopOpacity="0.3" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="flex justify-between px-2 text-[8px] text-gray-500 font-mono font-bold uppercase">
                    {statusChartData.labels.map((l, i) => (
                      <span key={i} className="w-[55px] text-center truncate">{l}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Priority distribution donut */}
            <div className="glass-card p-5 rounded-2xl border border-white/10 bg-[#030712]/40 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-purple-400" />
                <span className="text-xs font-heading font-bold text-white uppercase tracking-wider">Ticket Priority Distribution</span>
              </div>
              {tickets.length === 0 ? (
                <div className="h-36 flex items-center justify-center text-xs text-gray-600 italic">No tickets in database.</div>
              ) : (
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="relative h-32 w-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-24 h-24 transform -rotate-90">
                      <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="15" />
                      {priorityChartData.values.map((val, idx) => {
                        const total = tickets.length || 1;
                        const pct = val / total;
                        const strokeDash = pct * 220; 
                        const colors = ["#ef4444", "#f97316", "#eab308", "#3b82f6"];
                        let offset = 0;
                        for (let i = 0; i < idx; i++) {
                          offset += (priorityChartData.values[i] / total) * 220;
                        }
                        return (
                          <circle
                            key={idx}
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke={colors[idx]}
                            strokeWidth="15"
                            strokeDasharray={`${strokeDash} 220`}
                            strokeDashoffset={-offset}
                            className="transition-all duration-500"
                          />
                        );
                      })}
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2 font-mono text-[10px]">
                    {priorityChartData.labels.map((lbl, idx) => {
                      const count = priorityChartData.values[idx];
                      const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500"];
                      return (
                        <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${colors[idx]}`} />
                            <span className="text-gray-400 font-bold">{lbl}</span>
                          </div>
                          <span className="text-white font-bold">{count} tickets</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Activities list and recently assigned */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Activities list */}
            <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Ticket Stream Activity Feed</h3>
              </div>
              <div className="flex flex-col gap-3.5 max-h-72 overflow-y-auto pr-1">
                {activities.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-500">No ticket activities recorded.</div>
                ) : (
                  activities.map((act) => (
                    <div key={act.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.01] flex flex-col gap-1 text-[11px] leading-relaxed">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-gray-500">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="px-1.5 py-0.5 rounded border border-[#7DD3FC]/10 bg-[#7DD3FC]/5 text-[#7DD3FC] text-[8px] font-bold uppercase font-mono">
                          {act.action}
                        </span>
                      </div>
                      <p className="text-gray-300">
                        <strong className="text-white">{act.user.split("@")[0]}</strong>: {act.details}
                      </p>
                      {act.ticketId !== "system" && (
                        <button
                          onClick={() => {
                            const tk = tickets.find(t => t.id === act.ticketId);
                            if (tk) setSelectedTicket(tk);
                          }}
                          className="self-start text-[9px] text-[#7DD3FC] hover:text-white font-bold tracking-wider mt-0.5 flex items-center gap-1 cursor-pointer"
                        >
                          View Ticket {act.ticketId} <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recently Assigned */}
            <div className="lg:col-span-1 glass-card p-5 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Recently Assigned</h3>
              </div>
              <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
                {tickets.filter(t => t.assigneeId && t.status !== "Completed").slice(0, 5).length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-500">No active assigned tickets.</div>
                ) : (
                  tickets.filter(t => t.assigneeId && t.status !== "Completed").slice(0, 5).map((tk) => (
                    <div 
                      key={tk.id} 
                      onClick={() => setSelectedTicket(tk)}
                      className="p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-xs text-[#7DD3FC]">{tk.id}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          tk.priority === "Critical" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          tk.priority === "High" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                          "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}>
                          {tk.priority}
                        </span>
                      </div>
                      <span className="block text-xs font-semibold text-white truncate">{tk.title}</span>
                      <span className="block text-[9px] text-gray-500">Assignee: {tk.assigneeName}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          TAB 2: EMPLOYEE WORKSPACE VIEW ("MY TICKETS")
          ========================================== */}
      {activeTab === "workspace" && (
        <div className="flex flex-col gap-6">
          <header className="border-b border-white/5 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold font-heading text-white">Personal task Workspace</h2>
              <p className="text-xs text-gray-500 mt-1">Verify and update status benchmarks of tickets assigned to your node credential.</p>
            </div>
            
            <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5 font-mono text-[9px]">
              {["assigned", "progress", "review", "blocked", "completed"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setWorkspaceSubtab(cat as any)}
                  className={`px-3 py-1.5 rounded font-bold uppercase transition-all cursor-pointer ${
                    workspaceSubtab === cat ? "bg-[#4D7CFE] text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {cat === "progress" ? "In Progress" : cat === "review" ? "Under Review" : cat}
                </button>
              ))}
            </div>
          </header>

          {workspaceCategoryTickets.length === 0 ? (
            <div className="py-24 text-center flex flex-col items-center gap-4 glass-card border border-white/5 rounded-2xl">
              <Inbox className="w-10 h-10 text-gray-600" />
              <div className="text-sm text-gray-500 font-semibold">Workspace column is clear.</div>
              <p className="text-xs text-gray-600 max-w-xs leading-normal">
                No active tickets in this category match your assignee profile.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaceCategoryTickets.map((tk) => (
                <div
                  key={tk.id}
                  className="glass-card p-5 rounded-2xl border border-white/10 bg-[#030712]/30 flex flex-col justify-between gap-4 hover:border-[#4D7CFE]/30 transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-[#7DD3FC]">{tk.id}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                        tk.priority === "Critical" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        tk.priority === "High" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                        "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>
                        {tk.priority}
                      </span>
                    </div>
                    
                    <h3 
                      onClick={() => setSelectedTicket(tk)}
                      className="font-semibold text-sm text-white hover:text-[#7DD3FC] transition-colors cursor-pointer line-clamp-2"
                    >
                      {tk.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed font-light">{tk.description}</p>
                  </div>

                  <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                    <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                      <span>Due: {tk.dueDate || "N/A"}</span>
                      <span>Estimate: {tk.storyPoints} SP ({tk.estimatedHours} hrs)</span>
                    </div>
                    
                    <div className="flex gap-2 mt-1">
                      {tk.status === "Backlog" && (
                        <button
                          onClick={() => handleWorkflowTransition(tk, "Ready")}
                          className="flex-1 py-1.5 rounded bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase tracking-wider text-white transition-all cursor-pointer text-center"
                        >
                          Mark Ready
                        </button>
                      )}
                      {(tk.status === "Backlog" || tk.status === "Ready") && (
                        <button
                          onClick={() => handleWorkflowTransition(tk, "In Progress")}
                          className="flex-1 py-1.5 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-[9px] font-bold uppercase tracking-wider text-purple-200 transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" /> Accept Work
                        </button>
                      )}
                      {tk.status === "In Progress" && (
                        <>
                          <button
                            onClick={() => handleWorkflowTransition(tk, "Blocked")}
                            className="flex-1 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[9px] font-bold uppercase tracking-wider text-red-200 transition-all cursor-pointer text-center"
                          >
                            Block Task
                          </button>
                          <button
                            onClick={() => handleWorkflowTransition(tk, "Review")}
                            className="flex-1 py-1.5 rounded bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-[9px] font-bold uppercase tracking-wider text-yellow-200 transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                          >
                            <CheckSquare className="w-3 h-3" /> Submit Review
                          </button>
                        </>
                      )}
                      {tk.status === "Blocked" && (
                        <button
                          onClick={() => handleWorkflowTransition(tk, "In Progress")}
                          className="flex-1 py-1.5 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-[9px] font-bold uppercase tracking-wider text-purple-200 transition-all cursor-pointer text-center"
                        >
                          Resume Task
                        </button>
                      )}
                      {(tk.status === "Review" || tk.status === "Testing") && (isUserExec || isUserMngr) && (
                        <button
                          onClick={() => handleWorkflowTransition(tk, "Completed")}
                          className="flex-1 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider text-emerald-200 transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Approve & Complete
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedTicket(tk)}
                        className="py-1.5 px-3 rounded border border-white/10 hover:bg-white/5 text-[9px] font-bold uppercase tracking-wider text-gray-300 transition-all cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 3: DEPARTMENT SPRINT BOARD VIEW (KANBAN)
          ========================================== */}
      {activeTab === "board" && (
        <div className="flex flex-col gap-6">
          
          {/* Advanced Filter Bar */}
          <div className="glass-card p-4 rounded-xl border border-white/10 bg-[#030712]/40 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400 shrink-0">
              <Filter className="w-4 h-4 text-[#7DD3FC]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Search Filters</span>
            </div>

            <div className="flex flex-wrap gap-3 items-center flex-1 justify-end">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ID, Title, Assignee..."
                  className="w-full rounded bg-white/5 border border-white/10 pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-[#4D7CFE]"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded bg-black border border-white/10 px-2 py-1.5 text-xs text-gray-300 outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Backlog">Backlog</option>
                <option value="Ready">Ready</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Testing">Testing</option>
                <option value="Blocked">Blocked</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="rounded bg-black border border-white/10 px-2 py-1.5 text-xs text-gray-300 outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded bg-black border border-white/10 px-2 py-1.5 text-xs text-gray-300 outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="Epic">Epic</option>
                <option value="Story">Story</option>
                <option value="Feature">Feature</option>
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
                <option value="Improvement">Improvement</option>
                <option value="Research">Research</option>
                <option value="Security">Security</option>
                <option value="Maintenance">Maintenance</option>
              </select>

              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="rounded bg-black border border-white/10 px-2 py-1.5 text-xs text-gray-300 outline-none max-w-[120px]"
              >
                <option value="ALL">All Assignees</option>
                {members.map(m => (
                  <option key={m.uid} value={m.uid}>{m.name}</option>
                ))}
              </select>

              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="rounded bg-black border border-white/10 px-2 py-1.5 text-xs text-gray-300 outline-none max-w-[120px]"
              >
                <option value="ALL">All Projects</option>
                {projects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterProject("ALL");
                  setFilterSprint("ALL");
                  setFilterMilestone("ALL");
                  setFilterStatus("ALL");
                  setFilterPriority("ALL");
                  setFilterType("ALL");
                  setFilterAssignee("ALL");
                }}
                className="p-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Reset Filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Kanban Columns */}
          {tickets.length === 0 ? (
            <div className="py-24 text-center text-xs text-gray-500 italic glass-card border border-white/5 rounded-2xl">
              No tickets recorded in database. Click "+ Create Ticket" to start.
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 items-stretch select-none">
              {(["Backlog", "Ready", "In Progress", "Review", "Testing", "Blocked", "Completed"] as Ticket["status"][]).map((colStatus) => {
                const colTickets = filteredTickets.filter(t => t.status === colStatus);
                
                const statusColors: Record<string, string> = {
                  Backlog: "border-gray-500/20 text-gray-400 bg-gray-500/5",
                  Ready: "border-blue-500/20 text-blue-400 bg-blue-500/5",
                  "In Progress": "border-purple-500/20 text-purple-400 bg-purple-500/5",
                  Review: "border-yellow-500/20 text-yellow-400 bg-yellow-500/5",
                  Testing: "border-cyan-500/20 text-cyan-400 bg-cyan-500/5",
                  Blocked: "border-red-500/20 text-red-400 bg-red-500/5",
                  Completed: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
                };

                return (
                  <div 
                    key={colStatus} 
                    className="flex flex-col gap-3 min-w-[260px] max-w-[320px] flex-1 rounded-xl p-3 border border-white/5 bg-[#030712]/20"
                  >
                    <div className={`p-2.5 rounded-lg border flex justify-between items-center ${statusColors[colStatus]}`}>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider font-heading">{colStatus}</span>
                      <span className="font-mono text-xs font-bold bg-white/5 px-1.5 py-0.5 rounded">{colTickets.length}</span>
                    </div>

                    <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[60vh] pr-1 flex-1">
                      {colTickets.length === 0 ? (
                        <div className="py-8 text-center text-[10px] text-gray-600 italic">No tickets.</div>
                      ) : (
                        colTickets.map((tk) => (
                          <div
                            key={tk.id}
                            onClick={() => setSelectedTicket(tk)}
                            className="p-3.5 rounded-lg border border-white/5 bg-[#030712]/50 hover:bg-white/[0.03] transition-all cursor-pointer flex flex-col gap-2"
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-mono text-[10px] font-bold text-[#7DD3FC]">{tk.id}</span>
                              <span className={`text-[8px] font-bold px-1 py-0.5 rounded border uppercase shrink-0 ${
                                tk.priority === "Critical" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                tk.priority === "High" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              }`}>
                                {tk.priority}
                              </span>
                            </div>

                            <span className="text-xs font-semibold text-white line-clamp-2 leading-snug">{tk.title}</span>

                            <div className="flex justify-between items-center text-[9px] text-gray-500 border-t border-white/5 pt-2 mt-1">
                              <span className="truncate max-w-[120px]">👤 {tk.assigneeName.split(" ")[0]}</span>
                              <span className="font-mono font-bold bg-white/5 px-1 rounded">{tk.storyPoints} SP</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 4: TEAM DIRECTORY VIEW
          ========================================== */}
      {activeTab === "directory" && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <h2 className="text-xl font-bold font-heading text-white">Departmental Team Directory</h2>
              <p className="text-xs text-gray-500 mt-1">
                {isUserExec 
                  ? "Unrestricted Access: Viewing all operational teams across AEGIS."
                  : `Isolated Access: Viewing employees in the ${userDept} department.`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {membersWithWorkload.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500 col-span-3">
                No active users registered in this department directory.
              </div>
            ) : (
              membersWithWorkload.map((m) => {
                const availabilityColors = {
                  Available: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5",
                  Busy: "border-yellow-500/20 text-yellow-400 bg-yellow-500/5",
                  "On Leave": "border-gray-500/20 text-gray-400 bg-gray-500/5"
                };

                return (
                  <div 
                    key={m.uid} 
                    className="glass-card p-5 rounded-2xl border border-white/10 bg-[#030712]/30 flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-full bg-[#4D7CFE]/10 border border-[#4D7CFE]/20 text-white font-extrabold flex items-center justify-center text-sm">
                          {m.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#030712] ${
                          m.onlineStatus === "Online" ? "bg-emerald-400" : "bg-gray-500"
                        }`} />
                      </div>
                      <div>
                        <strong className="text-sm font-semibold text-white block">{m.name}</strong>
                        <span className="text-[10px] text-gray-400 font-medium">{m.role}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-3 font-mono text-[10px]">
                      <div>
                        <span className="block text-gray-500 uppercase tracking-wider text-[8px] font-bold">Employee ID</span>
                        <span className="text-white font-bold mt-0.5 block">{m.employeeId}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 uppercase tracking-wider text-[8px] font-bold">Availability</span>
                        <span className={`inline-block border text-[8px] px-1 rounded uppercase mt-0.5 font-bold ${availabilityColors[m.availability]}`}>
                          {m.availability}
                        </span>
                      </div>
                      <div>
                        <span className="block text-gray-500 uppercase tracking-wider text-[8px] font-bold">Active Tasks</span>
                        <span className="text-[#7DD3FC] font-bold mt-0.5 block">{m.activeTicketsCount} open</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 uppercase tracking-wider text-[8px] font-bold">Completed</span>
                        <span className="text-emerald-400 font-bold mt-0.5 block">{m.completedTicketsCount} tasks</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-[10px] font-mono">
                      <div className="flex justify-between items-center text-gray-500 font-medium">
                        <span>Workload Points</span>
                        <span className="text-white font-bold">{m.workloadPoints} Story Points</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${m.workloadPoints > 10 ? "bg-red-500" : m.workloadPoints > 5 ? "bg-yellow-500" : "bg-[#4D7CFE]"}`} 
                          style={{ width: `${Math.min(100, (m.workloadPoints / 15) * 100)}%` }} 
                        />
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 5: CREATE TICKET FORM VIEW
          ========================================== */}
      {activeTab === "create" && (isUserExec || isUserMngr) && (
        <form onSubmit={handleCreateTicket} className="glass-card p-6 rounded-3xl border border-white/10 bg-[#030712]/50 flex flex-col gap-6 max-w-4xl mx-auto w-full">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold font-heading text-white">Create New Enterprise Ticket</h2>
            <p className="text-xs text-gray-500 mt-1">Specify technical requirements, dependencies, and pull branches.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Ticket Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Implement consensus weight scaling checks"
                className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-[#4D7CFE] text-xs text-white"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Description</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Detailed explanation of task reasoning and implementation goals..."
                rows={4}
                className="rounded-lg bg-white/5 border border-white/10 p-4 outline-none focus:border-[#4D7CFE] text-xs text-white leading-relaxed"
                required
              />
            </div>

            {isUserExec ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Department</label>
                <select
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="rounded-lg bg-[#030712] border border-white/10 p-3 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Technology & AI">Technology & AI</option>
                  <option value="Product & UX">Product & UX</option>
                  <option value="Cybersecurity & SOC">Cybersecurity & SOC</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                  <option value="Operations & Finance">Operations & Finance</option>
                  <option value="HR & Legal">HR & Legal</option>
                  <option value="Research">Research</option>
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Department</label>
                <input
                  type="text"
                  value={userDept}
                  disabled
                  className="rounded-lg bg-white/[0.02] border border-white/5 p-3 text-xs text-gray-500 outline-none"
                />
              </div>
            )}

            {/* Project drop-down & inline creator */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Project</label>
                <button
                  type="button"
                  onClick={() => setShowAddProject(!showAddProject)}
                  className="text-[8px] text-[#7DD3FC] font-bold uppercase hover:text-white"
                >
                  {showAddProject ? "Cancel" : "+ Add Project"}
                </button>
              </div>
              {showAddProject ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProjectInput}
                    onChange={(e) => setNewProjectInput(e.target.value)}
                    placeholder="New Project Name"
                    className="flex-1 rounded bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white outline-none"
                  />
                  <button onClick={handleAddProject} className="rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-1 text-xs border border-emerald-500/20">Add</button>
                </div>
              ) : (
                <select
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                  className="rounded-lg bg-[#030712] border border-white/10 p-3 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              )}
            </div>

            {/* Sprint drop-down & inline creator */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Sprint</label>
                <button
                  type="button"
                  onClick={() => setShowAddSprint(!showAddSprint)}
                  className="text-[8px] text-[#7DD3FC] font-bold uppercase hover:text-white"
                >
                  {showAddSprint ? "Cancel" : "+ Add Sprint"}
                </button>
              </div>
              {showAddSprint ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSprintInput}
                    onChange={(e) => setNewSprintInput(e.target.value)}
                    placeholder="e.g. Sprint 26"
                    className="flex-1 rounded bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white outline-none"
                  />
                  <button onClick={handleAddSprint} className="rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-1 text-xs border border-emerald-500/20">Add</button>
                </div>
              ) : (
                <select
                  value={formSprint}
                  onChange={(e) => setFormSprint(e.target.value)}
                  className="rounded-lg bg-[#030712] border border-white/10 p-3 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="">Select Sprint</option>
                  {sprints.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
            </div>

            {/* Milestone drop-down & inline creator */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Milestone</label>
                <button
                  type="button"
                  onClick={() => setShowAddMilestone(!showAddMilestone)}
                  className="text-[8px] text-[#7DD3FC] font-bold uppercase hover:text-white"
                >
                  {showAddMilestone ? "Cancel" : "+ Add Milestone"}
                </button>
              </div>
              {showAddMilestone ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMilestoneInput}
                    onChange={(e) => setNewMilestoneInput(e.target.value)}
                    placeholder="Milestone Title"
                    className="flex-1 rounded bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white outline-none"
                  />
                  <button onClick={handleAddMilestone} className="rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-1 text-xs border border-emerald-500/20">Add</button>
                </div>
              ) : (
                <select
                  value={formMilestone}
                  onChange={(e) => setFormMilestone(e.target.value)}
                  className="rounded-lg bg-[#030712] border border-white/10 p-3 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="">Select Milestone</option>
                  {milestones.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Ticket Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="rounded-lg bg-[#030712] border border-white/10 p-3 text-xs text-white outline-none cursor-pointer"
              >
                <option value="Epic">Epic</option>
                <option value="Story">Story</option>
                <option value="Feature">Feature</option>
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
                <option value="Improvement">Improvement</option>
                <option value="Research">Research</option>
                <option value="Security">Security</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Priority Level</label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as any)}
                className="rounded-lg bg-[#030712] border border-white/10 p-3 text-xs text-white outline-none cursor-pointer"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Severity Level</label>
              <select
                value={formSeverity}
                onChange={(e) => setFormSeverity(e.target.value as any)}
                className="rounded-lg bg-[#030712] border border-white/10 p-3 text-xs text-white outline-none cursor-pointer"
              >
                <option value="Blocker">Blocker</option>
                <option value="Major">Major</option>
                <option value="Minor">Minor</option>
                <option value="Trivial">Trivial</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Assign To (Searchable Directory)</label>
              <div className="relative">
                <input
                  type="text"
                  value={assigneeSearch}
                  onFocus={() => setShowAssigneeDropdown(true)}
                  onChange={(e) => {
                    setAssigneeSearch(e.target.value);
                    setFormAssigneeId("");
                  }}
                  placeholder={formAssigneeId ? members.find(m => m.uid === formAssigneeId)?.name : "Search employee name..."}
                  className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                />
                {showAssigneeDropdown && (
                  <div className="absolute top-12 left-0 w-full rounded-lg border border-white/10 bg-black max-h-40 overflow-y-auto z-40 p-1 flex flex-col gap-1">
                    {filteredSearchMembers.length === 0 ? (
                      <span className="text-[10px] text-gray-500 p-2 italic">No employees found.</span>
                    ) : (
                      filteredSearchMembers.map(m => (
                        <button
                          key={m.uid}
                          type="button"
                          onClick={() => {
                            setFormAssigneeId(m.uid);
                            setAssigneeSearch(m.name);
                            setShowAssigneeDropdown(false);
                          }}
                          className="w-full text-left p-2 hover:bg-white/5 rounded text-xs text-white transition-colors"
                        >
                          {m.name} ({m.role})
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Story Points</label>
              <input
                type="number"
                value={formStoryPoints}
                onChange={(e) => setFormStoryPoints(Number(e.target.value))}
                min={0}
                max={21}
                className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Estimated Hours</label>
              <input
                type="number"
                value={formEstHours}
                onChange={(e) => setFormEstHours(Number(e.target.value))}
                min={0}
                className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Start Date</label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="rounded-lg bg-[#030712] border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Due Date</label>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="rounded-lg bg-[#030712] border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Module Tag</label>
              <input
                type="text"
                value={formModule}
                onChange={(e) => setFormModule(e.target.value)}
                placeholder="e.g. Consensus / Database"
                className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Labels (comma-separated)</label>
              <input
                type="text"
                value={formLabels}
                onChange={(e) => setFormLabels(e.target.value)}
                placeholder="ZKP, Optimization, UI"
                className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Acceptance Criteria</label>
              <textarea
                value={formCriteria}
                onChange={(e) => setFormCriteria(e.target.value)}
                placeholder="Specify criteria to mark this ticket as successful..."
                rows={2}
                className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Technical Notes</label>
              <textarea
                value={formTechNotes}
                onChange={(e) => setFormTechNotes(e.target.value)}
                placeholder="Any references to codebases, endpoints, or repositories..."
                rows={2}
                className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Definition of Done</label>
              <input
                type="text"
                value={formDoneDef}
                onChange={(e) => setFormDoneDef(e.target.value)}
                placeholder="Code passes unit testing, PR approved..."
                className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Branch Name</label>
              <input
                type="text"
                value={formBranchName}
                onChange={(e) => setFormBranchName(e.target.value)}
                placeholder="feature/cons-weight-scaling"
                className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Commit Message template</label>
              <input
                type="text"
                value={formCommitMsg}
                onChange={(e) => setFormCommitMsg(e.target.value)}
                placeholder="feat: consensus weight scaling"
                className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Pull Request Title</label>
              <input
                type="text"
                value={formPrTitle}
                onChange={(e) => setFormPrTitle(e.target.value)}
                placeholder="PR: implementing scaling weights to node capsules"
                className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE] font-mono"
              />
            </div>

          </div>

          <button 
            type="submit" 
            className="rounded bg-[#4D7CFE] hover:bg-[#3b66d9] py-3 text-xs font-bold transition-all shadow-[0_0_15px_rgba(77,124,254,0.3)] cursor-pointer text-white tracking-widest uppercase mt-4"
          >
            DISPATCH ENTERPRISE TICKET
          </button>
        </form>
      )}

      {/* ==========================================
          TAB 6: ANALYTICS VIEW
          ========================================== */}
      {activeTab === "analytics" && (
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#030712]/30 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold font-heading text-white">Operational Productivity Index</h2>
              <p className="text-xs text-gray-500 mt-1">Review velocity metrics, employee workloads, and completion ratios.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-white/5 bg-white/[0.01] p-5 rounded-xl flex flex-col gap-3">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-mono">Completion Velocity Ratio</span>
                <div className="text-3xl font-extrabold text-white">
                  {tickets.length > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-[10px] text-gray-400 font-light">Total finished tasks compared to accumulated catalog.</p>
              </div>

              <div className="border border-white/5 bg-white/[0.01] p-5 rounded-xl flex flex-col gap-3">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-mono">Sprint Overload Index</span>
                <div className="text-3xl font-extrabold text-yellow-400">
                  {stats.blocked} blocked
                </div>
                <p className="text-[10px] text-gray-400 font-light">Active tickets currently flagged as blocked by dependency loops.</p>
              </div>

              <div className="border border-white/5 bg-white/[0.01] p-5 rounded-xl flex flex-col gap-3">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-mono">Average Estimates</span>
                <div className="text-3xl font-extrabold text-[#7DD3FC]">
                  {(tickets.reduce((acc, t) => acc + (t.storyPoints || 0), 0) / (tickets.length || 1)).toFixed(1)} SP
                </div>
                <p className="text-[10px] text-gray-400 font-light">Average complexity metrics calculated per ticket.</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 font-mono text-xs text-gray-400 mt-4">
              <span className="font-body text-xs font-semibold text-white uppercase">Productivity balance by type</span>
              {["Feature", "Bug", "Task", "Security"].map((type) => {
                const typeCount = tickets.filter(t => t.type === type).length;
                const pct = tickets.length > 0 ? (typeCount / tickets.length) * 100 : 0;
                return (
                  <div key={type} className="flex flex-col gap-1.5 p-3.5 border border-white/5 bg-[#030712]/40 rounded-xl">
                    <div className="flex justify-between font-bold">
                      <span>{type}</span>
                      <span className="text-white">{typeCount} tasks ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#4D7CFE] h-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TICKET DETAIL SHEET/MODAL OVERLAY
          ========================================== */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="glass-card max-w-5xl w-full rounded-3xl border border-white/10 bg-[#030712] p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto relative animate-fade-in">
            
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <header className="border-b border-white/5 pb-4 pr-10">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="font-mono text-sm font-extrabold text-[#7DD3FC]">{selectedTicket.id}</span>
                <span className="px-2 py-0.5 rounded border border-white/5 bg-white/[0.02] text-[9px] font-semibold text-gray-400 uppercase">
                  {selectedTicket.project}
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                  selectedTicket.priority === "Critical" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                  selectedTicket.priority === "High" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                  "bg-blue-500/10 text-blue-400 border-blue-500/20"
                }`}>
                  {selectedTicket.priority}
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                  selectedTicket.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  selectedTicket.status === "Blocked" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                  "bg-purple-500/10 text-purple-400 border-purple-500/20"
                }`}>
                  {selectedTicket.status}
                </span>
              </div>
              <h2 className="font-heading font-bold text-xl text-white mt-1">{selectedTicket.title}</h2>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div>
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Description
                  </h4>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-xs text-gray-300 leading-relaxed font-light whitespace-pre-wrap">
                    {selectedTicket.description}
                  </div>
                </div>

                {selectedTicket.acceptanceCriteria && (
                  <div>
                    <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Acceptance Criteria
                    </h4>
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-xs text-gray-300 leading-relaxed font-light whitespace-pre-wrap">
                      {selectedTicket.acceptanceCriteria}
                    </div>
                  </div>
                )}

                {(selectedTicket.technicalNotes || selectedTicket.branchName) && (
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-3 font-mono text-[11px] leading-relaxed">
                    <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-body">
                      Developer Technical Specs
                    </h4>
                    
                    {selectedTicket.branchName && (
                      <div className="flex items-center gap-2 text-purple-400">
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>Branch: <strong>{selectedTicket.branchName}</strong></span>
                      </div>
                    )}

                    {selectedTicket.commitMessage && (
                      <div className="text-gray-400">
                        Commit template: <code className="text-white bg-white/5 px-1 rounded">{selectedTicket.commitMessage}</code>
                      </div>
                    )}

                    {selectedTicket.technicalNotes && (
                      <div className="text-gray-300 font-light border-t border-white/5 pt-3 mt-1 font-body text-xs">
                        <p className="font-mono text-[10px] font-bold text-gray-500 uppercase mb-1">Architecture Notes</p>
                        {selectedTicket.technicalNotes}
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5" /> File Attachments ({attachments.length})
                  </h4>
                  
                  <form onSubmit={handleUploadAttachment} className="flex gap-2 mb-3 max-w-md">
                    <input
                      type="text"
                      value={newAttachmentName}
                      onChange={(e) => setNewAttachmentName(e.target.value)}
                      placeholder="e.g. logs.txt / mockup.png"
                      className="flex-1 rounded bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white outline-none"
                    />
                    <select
                      value={newAttachmentSize}
                      onChange={(e) => setNewAttachmentSize(e.target.value)}
                      className="rounded bg-black border border-white/10 px-2 py-1.5 text-xs text-gray-300 outline-none"
                    >
                      <option value="1.2 MB">1.2 MB</option>
                      <option value="4.5 MB">4.5 MB</option>
                      <option value="12.0 MB">12.0 MB</option>
                    </select>
                    <button className="rounded bg-white/5 border border-white/10 px-4 py-1.5 text-xs text-white hover:bg-white/10 cursor-pointer">
                      Upload
                    </button>
                  </form>

                  {attachments.length === 0 ? (
                    <span className="text-[10px] text-gray-600 italic">No files attached.</span>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {attachments.map(att => (
                        <div key={att.id} className="p-3 border border-white/5 bg-white/[0.01] rounded-lg flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-white block truncate max-w-[160px]">{att.name}</span>
                            <span className="text-[9px] text-gray-500">Size: {att.size} | By: {att.uploadedBy.split("@")[0]}</span>
                          </div>
                          <span className="text-[#7DD3FC] text-[10px] font-bold">Attached</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Comments Discussion Thread ({comments.length})
                  </h4>

                  <div className="flex flex-col gap-3 mb-4">
                    {comments.map((com) => (
                      <div key={com.id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-1.5 animate-fade-in">
                        <div className="flex justify-between items-center text-[10px]">
                          <strong className="text-white">{com.userName}</strong>
                          <span className="text-gray-500">{new Date(com.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-300 font-light">{com.content}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddComment} className="flex flex-col gap-2.5 max-w-xl">
                    <textarea
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Post a reply or status update..."
                      rows={2}
                      className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-white outline-none focus:border-[#4D7CFE]"
                      required
                    />
                    <button className="self-end rounded bg-[#4D7CFE] hover:bg-[#3b66d9] px-6 py-2 text-[10px] font-bold text-white uppercase tracking-wider cursor-pointer">
                      Send Reply
                    </button>
                  </form>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 flex flex-col gap-5">
                <div className="glass-card p-5 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold border-b border-white/5 pb-2">
                    Ticket Parameters
                  </h4>

                  <div className="flex flex-col gap-3.5 font-mono text-[10px] text-gray-400">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span>Assignee</span>
                      <span className="text-white font-bold">{selectedTicket.assigneeName}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span>Reporter</span>
                      <span className="text-white font-bold">{selectedTicket.reporterName}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span>Type</span>
                      <span className="text-white font-bold">{selectedTicket.type}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span>Severity</span>
                      <span className="text-white font-bold">{selectedTicket.severity}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span>Story Points</span>
                      <span className="text-white font-bold">{selectedTicket.storyPoints} SP</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span>Estimate</span>
                      <span className="text-white font-bold">{selectedTicket.estimatedHours} Hours</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span>Start Date</span>
                      <span className="text-white font-bold">{selectedTicket.startDate}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span>Due Date</span>
                      <span className="text-white font-bold text-[#7DD3FC]">{selectedTicket.dueDate}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Created</span>
                      <span className="text-gray-500">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold border-b border-white/5 pb-2">
                    Workflow Actions
                  </h4>
                  
                  {(isUserExec || isUserMngr) && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[8px] font-bold text-gray-500 uppercase">Override Status</label>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleWorkflowTransition(selectedTicket, e.target.value as any)}
                        className="rounded bg-black border border-white/10 p-2 text-xs text-white cursor-pointer outline-none w-full"
                      >
                        <option value="Backlog">Backlog</option>
                        <option value="Ready">Ready</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Testing">Testing</option>
                        <option value="Blocked">Blocked</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {selectedTicket.status === "Backlog" && (
                      <button
                        onClick={() => handleWorkflowTransition(selectedTicket, "Ready")}
                        className="w-full py-2.5 rounded bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider text-blue-200 cursor-pointer"
                      >
                        Activate ready state
                      </button>
                    )}
                    {(selectedTicket.status === "Backlog" || selectedTicket.status === "Ready") && (
                      <button
                        onClick={() => handleWorkflowTransition(selectedTicket, "In Progress")}
                        className="w-full py-2.5 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/20 text-[10px] font-bold uppercase tracking-wider text-purple-200 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" /> Start Work
                      </button>
                    )}
                    {selectedTicket.status === "In Progress" && (
                      <>
                        <button
                          onClick={() => handleWorkflowTransition(selectedTicket, "Blocked")}
                          className="w-full py-2.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider text-red-200 cursor-pointer"
                        >
                          Flag Blocked
                        </button>
                        <button
                          onClick={() => handleWorkflowTransition(selectedTicket, "Review")}
                          className="w-full py-2.5 rounded bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-[10px] font-bold uppercase tracking-wider text-yellow-200 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <CheckSquare className="w-3 h-3" /> Submit for Review
                        </button>
                      </>
                    )}
                    {selectedTicket.status === "Blocked" && (
                      <button
                        onClick={() => handleWorkflowTransition(selectedTicket, "In Progress")}
                        className="w-full py-2.5 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider text-purple-200 cursor-pointer"
                      >
                        Unblock Task
                      </button>
                    )}
                    {(selectedTicket.status === "Review" || selectedTicket.status === "Testing") && (isUserExec || isUserMngr) && (
                      <button
                        onClick={() => handleWorkflowTransition(selectedTicket, "Completed")}
                        className="w-full py-2.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider text-emerald-200 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Close
                      </button>
                    )}
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-white/10 bg-[#030712]/50 flex flex-col gap-4">
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold border-b border-white/5 pb-2">
                    History Timeline
                  </h4>

                  <div className="flex flex-col gap-3 max-h-40 overflow-y-auto pr-1">
                    {ticketTimeline.map((item) => (
                      <div key={item.id} className="text-[10px] border-b border-white/5 pb-2 flex flex-col gap-0.5 leading-relaxed font-light">
                        <div className="flex justify-between items-center text-gray-500 font-mono">
                          <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-[#7DD3FC]">{item.action}</span>
                        </div>
                        <p className="text-gray-300">
                          <strong className="text-white">{item.user.split("@")[0]}</strong>: {item.details}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {(isUserExec || isUserMngr) && (
                  <button
                    onClick={() => handleDeleteTicket(selectedTicket.id)}
                    className="w-full py-2.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Ticket Record
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
