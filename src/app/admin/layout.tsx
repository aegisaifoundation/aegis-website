"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ArrowLeft, Lock, LogOut, RotateCcw, LayoutDashboard, Edit, 
  Users, History, Image, Mail, Server, BookOpen, Settings, 
  ClipboardCheck, Bell, Shield, Check, User,
  KeyRound, Activity, BarChart3, Scale, HelpCircle, Terminal, 
  Briefcase, AlertOctagon, FileText
} from "lucide-react";
import { defaultCardContent, saveCardContent } from "@/config/cardContent";
import { defaultGeneralContent, saveGeneralContent } from "@/config/generalContent";
import { auth, db } from "@/config/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getOrCreateUserProfile, UserProfile, hasRoleAccess, UserRole } from "@/config/userRoles";
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, getDocs } from "firebase/firestore";
import { logActivity } from "@/config/activityLogger";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showBellDropdown, setShowBellDropdown] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userProfile = await getOrCreateUserProfile(user.uid, user.email || "");
          
          if (userProfile.status === "disabled") {
            setError("Your account has been disabled by an administrator.");
            await signOut(auth);
            setLoggedIn(false);
            setProfile(null);
          } else {
            setProfile(userProfile);
            setLoggedIn(true);
            setError("");
          }
        } catch (err: any) {
          console.error("Failed to load user profile:", err);
          setError(err.message || "Failed to fetch user permissions.");
          await signOut(auth);
          setLoggedIn(false);
          setProfile(null);
        }
      } else {
        setLoggedIn(false);
        setProfile(null);
      }
      setChecking(false);
    });
    return unsubscribe;
  }, []);

  // Sync Notifications
  useEffect(() => {
    if (!loggedIn) return;
    
    try {
      const q = query(
        collection(db, "notifications"),
        orderBy("timestamp", "desc"),
        limit(20)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        setNotifications(list);
      }, (err) => console.error("Notifications sync failed:", err));
      
      return unsubscribe;
    } catch (err) {
      console.error("Notifications query creation failed:", err);
    }
  }, [loggedIn]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setChecking(true);
    
    let emailInput = username.trim();
    if (!emailInput.includes("@")) {
      emailInput = `${emailInput}@aegis.com`;
    }

    try {
      await signInWithEmailAndPassword(auth, emailInput, password);
    } catch (err: any) {
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        try {
          await createUserWithEmailAndPassword(auth, emailInput, password);
        } catch (signUpErr: any) {
          if (signUpErr.code === "auth/email-already-in-use") {
            setError("Incorrect password for this account.");
          } else {
            setError(signUpErr.message || "Failed to sign in.");
          }
          setChecking(false);
        }
      } else {
        setError(err.message || "Failed to sign in.");
        setChecking(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      if (profile) {
        await logActivity("LOGOUT", `User ${profile.email} logged out.`);
      }
      await signOut(auth);
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const handleResetDefaults = () => {
    if (!profile || !hasRoleAccess(profile.role, "admin")) {
      alert("Permission denied. Admin permissions required.");
      return;
    }
    if (confirm("Are you sure you want to reset all content and cards to original defaults? This cannot be undone.")) {
      saveCardContent(defaultCardContent);
      saveGeneralContent(defaultGeneralContent);
      logActivity("RESET_DEFAULTS", "Reset site layout content and cards back to defaults.");
      window.dispatchEvent(new Event("aegis-content-reset"));
      alert("All content has been reset to defaults!");
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read);
      const promises = unread.map((n) => 
        updateDoc(doc(db, "notifications", n.id), { read: true })
      );
      await Promise.all(promises);
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  // Nav list with role gates
  const navigationItems = [
    { name: "Dashboard Overview", href: "/admin", icon: LayoutDashboard, role: "viewer" },
    { name: "Website Content", href: "/admin/content", icon: Edit, role: "viewer" },
    { name: "Approval Queue", href: "/admin/approval", icon: ClipboardCheck, role: "reviewer" },
    { name: "User Directory", href: "/admin/users", icon: Users, role: "admin" },
    { name: "Nodes Registry", href: "/admin/nodes", icon: Server, role: "viewer" },
    { name: "Research Publications", href: "/admin/research", icon: BookOpen, role: "editor" },
    { name: "Media Indexer", href: "/admin/media", icon: Image, role: "editor" },
    { name: "Contact Messages", href: "/admin/messages", icon: Mail, role: "reviewer" },
    { name: "Activity Logs", href: "/admin/logs", icon: History, role: "admin" },
    { name: "Site Settings", href: "/admin/settings", icon: Settings, role: "admin" },
    { name: "API Token Manager", href: "/admin/tokens", icon: KeyRound, role: "security_officer" },
    { name: "Network Diagnostics", href: "/admin/diagnostics", icon: Activity, role: "node_auditor" },
    { name: "Revenue & Audits", href: "/admin/analytics", icon: BarChart3, role: "billing_manager" },
    { name: "DAO Governance", href: "/admin/governance", icon: Scale, role: "governance_delegate" },
    { name: "Helpdesk Support", href: "/admin/support", icon: HelpCircle, role: "support_agent" },
    { name: "Operations Console", href: "/admin/console", icon: Terminal, role: "infrastructure_operator" },
    { name: "Partners Index", href: "/admin/partners", icon: Briefcase, role: "devrel_manager" },
    { name: "Alerts Manager", href: "/admin/alerts", icon: AlertOctagon, role: "node_auditor" },
    { name: "Version Changelog", href: "/admin/changelog", icon: FileText, role: "infrastructure_operator" },
  ];

  // Role Badge Styling helper
  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      super_admin: "bg-red-500/10 text-red-400 border-red-500/20",
      admin: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      co_admin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      editor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      reviewer: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      viewer: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      node_auditor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      billing_manager: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      research_director: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      support_agent: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      security_officer: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      data_curator: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
      devrel_manager: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      governance_delegate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      infrastructure_operator: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      compliance_counsel: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    };
    return styles[role] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-body">
        <div className="text-gray-500 text-sm">Authenticating session...</div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-body">
        <form onSubmit={login} className="glass-card w-full max-w-md p-8 flex flex-col gap-5 border border-white/10">
          <div className="text-center">
            <Lock className="w-8 h-8 text-[#7DD3FC] mx-auto mb-3" />
            <h1 className="font-heading font-bold text-2xl">Admin access</h1>
            <p className="text-sm text-gray-500 mt-2">Sign in to manage the website.</p>
          </div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username or Email (e.g. admin)"
            className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-[#4D7CFE] text-sm text-white"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-[#4D7CFE] text-sm text-white"
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button className="rounded-lg bg-[#4D7CFE] hover:bg-[#3b66d9] py-3 text-sm font-bold tracking-widest transition-colors cursor-pointer">
            SIGN IN
          </button>
          <Link href="/" className="text-center text-sm text-gray-400 hover:text-white transition-colors">
            Back to website
          </Link>
        </form>
      </main>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <main className="min-h-screen bg-black text-white grid lg:grid-cols-[300px_1fr] font-body">
      {/* Sidebar Navigation */}
      <aside className="border-r border-white/10 p-6 flex flex-col justify-between bg-[#030712] max-h-screen overflow-y-auto">
        <div className="flex flex-col gap-8">
          {/* Brand header */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo.png"
              alt="AEGIS Logo"
              className="h-8 w-auto filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
            />
            <div>
              <span className="font-heading font-extrabold text-lg tracking-[0.15em] bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent uppercase">
                AEGIS
              </span>
              <span className="block text-[8px] font-heading font-bold tracking-widest text-[#7DD3FC] uppercase">
                Enterprise Admin
              </span>
            </div>
          </div>

          {/* Active User info */}
          {profile && (
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                <User className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="block text-xs font-semibold text-white truncate">{profile.email}</span>
                <span className={`inline-block border text-[8px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 tracking-wider ${getRoleBadge(profile.role)}`}>
                  {profile.role.replace("_", " ")}
                </span>
              </div>
            </div>
          )}

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5">
            {profile && navigationItems.map((item) => {
                if (!hasRoleAccess(profile.role, item.role as UserRole)) return null;
              
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#4D7CFE] text-white shadow-[0_0_15px_rgba(77,124,254,0.3)]"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Actions Footer */}
        <div className="flex flex-col gap-3 pt-6 border-t border-white/10 mt-8">
          {profile && hasRoleAccess(profile.role, "admin") && (
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Defaults
            </button>
          )}
          <Link
            href="/"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Panel Frame */}
      <div className="grid grid-rows-[70px_1fr] max-h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="border-b border-white/10 px-8 flex items-center justify-between bg-[#030712]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              {pathname === "/admin" ? "Dashboard" : pathname.replace("/admin/", "").replace("-", " ")}
            </span>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Bell Icon / Notifications */}
            <button 
              onClick={() => setShowBellDropdown(!showBellDropdown)}
              className="relative p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[8px] font-bold flex items-center justify-center text-white border border-[#030712]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showBellDropdown && (
              <div className="absolute right-0 top-12 w-80 rounded-xl border border-white/10 bg-[#030712] p-4 shadow-2xl z-50 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-bold font-heading uppercase text-gray-400">Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllNotificationsRead}
                      className="text-[10px] text-[#7DD3FC] hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-500">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-2.5 rounded-lg border text-[11px] leading-relaxed transition-all ${
                          n.read 
                            ? "bg-white/[0.01] border-white/5 text-gray-400" 
                            : "bg-blue-500/5 border-blue-500/10 text-white font-medium"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-[#7DD3FC] uppercase text-[9px]">{n.type}</span>
                          <span className="text-[9px] text-gray-500">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="mt-1">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content scrolling workspace */}
        <div className="overflow-y-auto bg-[#000000]">
          {children}
        </div>
      </div>
    </main>
  );
}
