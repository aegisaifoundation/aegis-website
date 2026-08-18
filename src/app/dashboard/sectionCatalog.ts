import {
  CloudDownload, CircleEllipsis, PackageOpen, KeyRound, Activity, BookOpen, WalletCards, CreditCard,
  FileText, User, Shield, Bell, Headphones, Bot, Database, Monitor, BriefcaseBusiness, Terminal,
  Cpu, ShieldCheck, Sparkles, Building2, MessageSquare, Copy, Trash2, Gauge, Layers, Download
} from "lucide-react";

export type DashboardView =
  | "dashboard"
  | "my-nodes"
  | "downloads"
  | "requests"
  | "marketplace"
  | "api"
  | "usage"
  | "documentation"
  | "plans"
  | "billing"
  | "invoices"
  | "profile"
  | "security"
  | "notifications"
  | "support"
  | "settings";

export type WorkflowType = "api-key" | "download" | "request" | "upgrade" | "support" | "organization" | "project" | "agent" | "danger";

export const sectionCatalog: Record<
  Exclude<DashboardView, "dashboard" | "settings" | "my-nodes">,
  {
    title: string;
    eyebrow: string;
    description: string;
    primaryAction: string;
    workflow: WorkflowType;
    icon: any;
    filters: string[];
    cards: Array<{
      title: string;
      meta: string;
      description: string;
      action: string;
      icon: any;
    }>;
    table: Array<{ name: string; detail: string; status: string; updated: string }>;
  }
> = {
  downloads: {
    title: "AEGIS Component Center",
    eyebrow: "Downloads",
    description: "Search components, compare versions, inspect requirements, and request secure access.",
    primaryAction: "Request access",
    workflow: "request",
    icon: CloudDownload,
    filters: ["Agent", "Server", "Client", "CLI", "SDK", "Docker", "Linux", "macOS", "Windows"],
    cards: [
      { title: "Agent Runtime", meta: "v2.4 · Linux, macOS", description: "Autonomous agent runtime with release notes, integrity checks, and installation guide.", action: "Download", icon: Bot },
      { title: "Server Container", meta: "v3.1 · Docker", description: "Private deployment image with checksums, dependencies, and architecture notes.", action: "Verify integrity", icon: Database },
      { title: "Desktop Client", meta: "v1.8 · Windows, macOS", description: "Client installer with supported OS matrix, changelog, and FAQ.", action: "View docs", icon: Monitor },
    ],
    table: [
      { name: "aegis-agent-runtime", detail: "SHA256 verified · 182 MB", status: "Available", updated: "Today" },
      { name: "aegis-server-docker", detail: "Requires access approval", status: "Restricted", updated: "2 days ago" },
      { name: "aegis-cli", detail: "npm install command ready", status: "Available", updated: "Jun 28" },
    ],
  },
  requests: {
    title: "Request Center",
    eyebrow: "Approvals",
    description: "Manage approval pipelines with comments, attachments, reviewer context, and activity history.",
    primaryAction: "New request",
    workflow: "request",
    icon: CircleEllipsis,
    filters: ["Pending", "Under Review", "Security Review", "Approved", "Rejected", "Expired"],
    cards: [
      { title: "Approval Pipeline", meta: "Pending > Review > Security > Approved", description: "Track stages, current reviewer, expected approval time, and status history.", action: "View timeline", icon: Layers },
      { title: "Reviewer Thread", meta: "Comments and attachments", description: "Add context, upload evidence, duplicate requests, or contact the reviewer.", action: "Add comment", icon: MessageSquare },
      { title: "Export Center", meta: "CSV, PDF, audit bundle", description: "Bulk select requests and export approval history for compliance.", action: "Export", icon: Download },
    ],
    table: [
      { name: "Server access request", detail: "Reviewer: AEGIS Operations", status: "Under Review", updated: "24-48h ETA" },
      { name: "Agent runtime request", detail: "Security review complete", status: "Approved", updated: "Yesterday" },
      { name: "Hybrid deployment", detail: "Needs justification", status: "Pending", updated: "Today" },
    ],
  },
  marketplace: {
    title: "Marketplace",
    eyebrow: "Discover",
    description: "Featured, verified, partner, and community components for AI deployment workflows.",
    primaryAction: "Open listing",
    workflow: "download",
    icon: PackageOpen,
    filters: ["Featured", "Trending", "Official", "Verified", "Partners", "Collections"],
    cards: [
      { title: "Private Agent Pack", meta: "Official · 4.9 rating", description: "Screenshots, roadmap, pricing, dependencies, reviews, and changelog included.", action: "Install", icon: Bot },
      { title: "Edge Runtime", meta: "Verified · Jetson ready", description: "Deploy lightweight AI services to edge hardware with support documentation.", action: "Request", icon: Cpu },
      { title: "Security Pack", meta: "Partner · Enterprise", description: "Policy checks, audit recipes, and private deployment hardening templates.", action: "Purchase", icon: Shield },
    ],
    table: [
      { name: "Private Agent Pack", detail: "Official · 18k downloads", status: "Verified", updated: "New release" },
      { name: "Docker Image Suite", detail: "Community · MIT license", status: "Compatible", updated: "3 days ago" },
      { name: "Security Pack", detail: "Partner · Paid", status: "Enterprise", updated: "Jun 30" },
    ],
  },
  api: {
    title: "API Keys",
    eyebrow: "Developer",
    description: "Generate, rotate, restrict, copy, and audit API keys with Stripe-like controls.",
    primaryAction: "Generate key",
    workflow: "api-key",
    icon: KeyRound,
    filters: ["Production", "Development", "Testing", "Enabled", "Disabled", "Expiring"],
    cards: [
      { title: "Production Key", meta: "Last used 12 minutes ago", description: "Read/write scopes, IP restrictions, webhooks, and audit logs.", action: "Copy", icon: Copy },
      { title: "SDK Access", meta: "Python, JavaScript, Go", description: "Download SDKs, copy starter code, and open examples in playground.", action: "Download SDK", icon: BookOpen },
      { title: "Danger Zone", meta: "Rotation and deletion", description: "Regenerate, disable, delete, or restrict credentials with confirmation.", action: "Rotate", icon: Trash2 },
    ],
    table: [
      { name: "prod_aegis_live", detail: "Scopes: inference, downloads", status: "Enabled", updated: "12m ago" },
      { name: "dev_workspace", detail: "Restricted to 2 IPs", status: "Enabled", updated: "Today" },
      { name: "test_webhooks", detail: "Expires in 30 days", status: "Expiring", updated: "Yesterday" },
    ],
  },
  usage: {
    title: "Usage Analytics",
    eyebrow: "Insights",
    description: "Understand API calls, inference, training, bandwidth, success rate, latency, credits, and cost.",
    primaryAction: "Export report",
    workflow: "download",
    icon: Activity,
    filters: ["API Calls", "Inference", "Training", "Bandwidth", "Projects", "Models"],
    cards: [
      { title: "API Calls", meta: "42k this month", description: "Hourly graph, monthly comparison, top endpoints, and success rate.", action: "Export CSV", icon: Activity },
      { title: "Latency", meta: "18 ms avg", description: "Geographic requests and endpoint-level latency distribution.", action: "View graph", icon: Gauge },
      { title: "Credits", meta: "12.80 AGS", description: "Credit usage, cost allocation, and billing projection.", action: "Export PDF", icon: WalletCards },
    ],
    table: [
      { name: "/v1/agents/run", detail: "18k calls · 99.9% success", status: "Healthy", updated: "Live" },
      { name: "/v1/models/infer", detail: "22k calls · 44ms p95", status: "Healthy", updated: "Live" },
      { name: "/v1/downloads", detail: "2k calls · cached", status: "Optimized", updated: "Live" },
    ],
  },
  documentation: {
    title: "Documentation",
    eyebrow: "Learn",
    description: "A searchable documentation portal for quick starts, SDKs, APIs, examples, and troubleshooting.",
    primaryAction: "Open quick start",
    workflow: "download",
    icon: BookOpen,
    filters: ["Quick Start", "CLI", "SDK", "REST", "GraphQL", "Security", "FAQ"],
    cards: [
      { title: "Quick Start", meta: "10 minute setup", description: "Install, authenticate, create a project, and run your first private agent.", action: "Run example", icon: Sparkles },
      { title: "API Reference", meta: "REST, GraphQL, WebSocket", description: "Copy examples, open playground, or report documentation issues.", action: "Copy", icon: Copy },
      { title: "Security Guide", meta: "Enterprise controls", description: "Authentication, scopes, audit logging, and privacy recommendations.", action: "Download PDF", icon: Shield },
    ],
    table: [
      { name: "Authentication", detail: "API keys, scopes, rotation", status: "Updated", updated: "Today" },
      { name: "Python SDK", detail: "Examples and notebooks", status: "Popular", updated: "Jun 29" },
      { name: "Troubleshooting", detail: "Common deployment fixes", status: "Maintained", updated: "Jun 22" },
    ],
  },
  plans: {
    title: "Plans",
    eyebrow: "Subscription",
    description: "Compare monthly, yearly, and enterprise plans with limits, benefits, support, and trials.",
    primaryAction: "Upgrade",
    workflow: "upgrade",
    icon: WalletCards,
    filters: ["Monthly", "Yearly", "Enterprise", "API Limits", "Support", "Compute"],
    cards: [
      { title: "AEGIS Pro", meta: "Current plan", description: "Premium downloads, API access, priority support, and team-ready controls.", action: "Manage", icon: ShieldCheck },
      { title: "Enterprise", meta: "Custom limits", description: "Organizations, SSO, audit exports, dedicated support, and training.", action: "Contact sales", icon: Building2 },
      { title: "Trial", meta: "14 days", description: "Evaluate marketplace components, SDKs, and protected deployment workflows.", action: "Start trial", icon: Sparkles },
    ],
    table: [
      { name: "API Limits", detail: "10k requests/day included", status: "Included", updated: "Current" },
      { name: "Downloads", detail: "Premium component access", status: "Included", updated: "Current" },
      { name: "Support", detail: "Priority response", status: "Included", updated: "Current" },
    ],
  },
  billing: {
    title: "Billing",
    eyebrow: "Payments",
    description: "Manage payment methods, tax, credits, usage, upcoming invoices, and auto-renewal.",
    primaryAction: "Add card",
    workflow: "upgrade",
    icon: CreditCard,
    filters: ["Payments", "Cards", "GST", "Tax", "Refunds", "Credits"],
    cards: [
      { title: "Upcoming Invoice", meta: "24 May 2027", description: "Preview plan, usage, tax, credits, and auto-renewal details.", action: "Preview", icon: FileText },
      { title: "Payment Method", meta: "Visa ending 4242", description: "Add, remove, or update payment methods with secure confirmation.", action: "Update", icon: CreditCard },
      { title: "Credits", meta: "12.8 AGS available", description: "Credit ledger, refunds, and usage allocation for your workspace.", action: "View ledger", icon: WalletCards },
    ],
    table: [
      { name: "AEGIS Pro renewal", detail: "Includes tax estimate", status: "Upcoming", updated: "May 24" },
      { name: "Compute credits", detail: "Applied to workspace", status: "Available", updated: "Today" },
      { name: "Payment method", detail: "Default card active", status: "Verified", updated: "Jun 20" },
    ],
  },
  invoices: {
    title: "Invoices",
    eyebrow: "Receipts",
    description: "Search, export, preview, and download professional invoices and receipts.",
    primaryAction: "Export invoices",
    workflow: "download",
    icon: FileText,
    filters: ["Paid", "Pending", "Refunded", "Failed", "Tax", "Receipt"],
    cards: [
      { title: "Invoice Preview", meta: "INV-2027-024", description: "Preview line items, tax, payment status, and receipt metadata.", action: "Download PDF", icon: Download },
      { title: "Billing History", meta: "24 records", description: "Search, filter, and export invoice history for finance teams.", action: "Export", icon: FileText },
      { title: "Tax Documents", meta: "GST ready", description: "Manage GST, tax details, and invoice profile information.", action: "Update tax", icon: BriefcaseBusiness },
    ],
    table: [
      { name: "INV-2027-024", detail: "AEGIS Pro renewal", status: "Pending", updated: "May 24" },
      { name: "INV-2026-018", detail: "Component access", status: "Paid", updated: "Jun 18" },
      { name: "INV-2026-011", detail: "Compute credits", status: "Paid", updated: "May 12" },
    ],
  },
  profile: {
    title: "Profile",
    eyebrow: "Account",
    description: "Manage identity, company details, timezone, language, developer profile, and API identity.",
    primaryAction: "Edit profile",
    workflow: "organization",
    icon: User,
    filters: ["Identity", "Company", "Organization", "Developer", "Language", "Timezone"],
    cards: [
      { title: "Public Identity", meta: "Verified email", description: "Profile picture, username, email, bio, social links, and developer profile.", action: "Edit", icon: User },
      { title: "Organization", meta: "Personal workspace", description: "Company, role, organization membership, and workspace settings.", action: "Switch", icon: Building2 },
      { title: "API Identity", meta: "Developer profile", description: "Configure how SDK examples and API ownership identify this account.", action: "Verify", icon: KeyRound },
    ],
    table: [
      { name: "Email", detail: "Verified", status: "Active", updated: "Current" },
      { name: "Timezone", detail: "Asia/Calcutta", status: "Configured", updated: "Current" },
      { name: "Language", detail: "English", status: "Configured", updated: "Current" },
    ],
  },
  security: {
    title: "Security Center",
    eyebrow: "Protection",
    description: "Enterprise security for passwords, 2FA, passkeys, sessions, devices, tokens, and audit logs.",
    primaryAction: "Enable 2FA",
    workflow: "danger",
    icon: Shield,
    filters: ["Password", "2FA", "Passkeys", "Devices", "Sessions", "Audit Logs"],
    cards: [
      { title: "Two Factor", meta: "Recommended", description: "Enable 2FA, generate recovery codes, and configure trusted devices.", action: "Enable", icon: ShieldCheck },
      { title: "Active Sessions", meta: "3 devices", description: "Review devices, login history, and suspicious activity.", action: "Review", icon: Monitor },
      { title: "API Tokens", meta: "Audit ready", description: "Download audit logs, revoke tokens, and inspect credential activity.", action: "Download log", icon: KeyRound },
    ],
    table: [
      { name: "Current session", detail: "Windows · Chrome", status: "Trusted", updated: "Now" },
      { name: "Recovery codes", detail: "Not generated", status: "Action needed", updated: "Recommended" },
      { name: "Password", detail: "Last changed recently", status: "Healthy", updated: "Current" },
    ],
  },
  notifications: {
    title: "Notifications",
    eyebrow: "Inbox",
    description: "Filter downloads, API, marketplace, organization, security, billing, mentions, and updates.",
    primaryAction: "Settings",
    workflow: "organization",
    icon: Bell,
    filters: ["Unread", "Downloads", "API", "Security", "Billing", "Mentions"],
    cards: [
      { title: "Approval Update", meta: "Unread", description: "Your latest node request moved into reviewer assignment.", action: "Open", icon: CircleEllipsis },
      { title: "API Usage", meta: "Threshold", description: "Production key usage is trending 12% above last month.", action: "Review", icon: Activity },
      { title: "Security", meta: "Recommended", description: "Enable 2FA to strengthen account protection.", action: "Enable", icon: Shield },
    ],
    table: [
      { name: "Download request updated", detail: "Reviewer assigned", status: "Unread", updated: "Today" },
      { name: "Invoice preview ready", detail: "Upcoming renewal", status: "Read", updated: "Yesterday" },
      { name: "Marketplace release", detail: "Agent Runtime v2.4", status: "Unread", updated: "Jun 28" },
    ],
  },
  support: {
    title: "Help Center",
    eyebrow: "Support",
    description: "Create support tickets, open live chat, report bugs, request features, and check system status.",
    primaryAction: "Create ticket",
    workflow: "support",
    icon: Headphones,
    filters: ["Tickets", "Live Chat", "Community", "Bug Report", "Feature Request", "Status"],
    cards: [
      { title: "Support Ticket", meta: "Priority support", description: "Describe an issue, attach logs, and route it to the right AEGIS team.", action: "Create", icon: MessageSquare },
      { title: "Knowledge Base", meta: "Guides and fixes", description: "Search troubleshooting, architecture, and deployment guides.", action: "Search", icon: BookOpen },
      { title: "System Status", meta: "All systems normal", description: "Monitor incidents, uptime, and service health.", action: "Open status", icon: Activity },
    ],
    table: [
      { name: "Live chat", detail: "Available for Pro plans", status: "Online", updated: "Now" },
      { name: "Community", detail: "Discord and GitHub", status: "Open", updated: "Always" },
      { name: "Bug report", detail: "Attach logs and screenshots", status: "Ready", updated: "Now" },
    ],
  },
};
