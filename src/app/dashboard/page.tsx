"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  Bookmark,
  BookOpen,
  Bot,
  Box,
  Building2,
  BriefcaseBusiness,
  ChevronDown,
  CircleEllipsis,
  CloudDownload,
  Command,
  Copy,
  Cpu,
  CreditCard,
  Database,
  Download,
  ExternalLink,
  FileText,
  Filter,
  FolderOpen,
  Gauge,
  Headphones,
  Home,
  KeyRound,
  Layers,
  Link2,
  Lock,
  LogOut,
  MessageSquare,
  Monitor,
  Moon,
  MoreHorizontal,
  PackageOpen,
  Pause,
  Play,
  Plus,
  PlusCircle,
  RotateCcw,
  Search,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
  Trash2,
  User,
  WalletCards,
  X,
} from "lucide-react";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db, auth } from "@/config/firebase";
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

interface UserProfile {
  userId: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface AINode {
  id: string;
  name: string;
  country: string;
  latency: number;
  status: "online" | "offline";
  capabilities: string;
  lastHeartbeat: string;
}

interface PendingRequest {
  id: string;
  name: string;
  country: string;
  gpuSpecs: string;
  status: "pending" | "approved" | "rejected" | "quarantined";
  date: string;
}

type DashboardView =
  | "dashboard"
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
  | "support";

type WorkflowType =
  | "api-key"
  | "download"
  | "request"
  | "upgrade"
  | "support"
  | "organization"
  | "project"
  | "agent"
  | "danger";

type NavItem = {
  id: DashboardView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type DownloadComponent = {
  name: string;
  category: string;
  description: string;
  version: string;
  publisher: string;
  downloads: string;
  rating: string;
  compatibility: string[];
  platforms: string[];
  architecture: string;
  license: string;
  updated: string;
  status: "Available" | "Restricted" | "Beta" | "Deprecated" | "Recommended";
  size: string;
  checksum: string;
  channel: "Stable" | "Beta" | "Nightly";
  icon: React.ComponentType<{ className?: string }>;
  install: string;
  features: string[];
};

type MarketplaceProduct = {
  name: string;
  publisher: string;
  category: string;
  description: string;
  version: string;
  compatibility: string[];
  downloads: string;
  rating: string;
  reviews: string;
  price: string;
  license: string;
  updated: string;
  status: "Official" | "Verified" | "Partner" | "Community" | "Enterprise";
  security: string;
  install: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
  features: string[];
};

const requestNav = [
  { id: "downloads", label: "Downloads", icon: CloudDownload },
  { id: "requests", label: "Request Center", icon: CircleEllipsis },
  { id: "marketplace", label: "Marketplace", icon: PackageOpen },
] satisfies NavItem[];

const apiNav = [
  { id: "api", label: "API Keys", icon: KeyRound },
  { id: "usage", label: "Usage", icon: Activity },
  { id: "documentation", label: "Documentation", icon: BookOpen },
] satisfies NavItem[];

const subscriptionNav = [
  { id: "plans", label: "Plans", icon: WalletCards },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "invoices", label: "Invoices", icon: FileText },
] satisfies NavItem[];

const accountNav = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
] satisfies NavItem[];

const supportNav = [
  { id: "support", label: "Help Center", icon: Headphones },
  { id: "documentation", label: "Knowledge Base", icon: BookOpen },
] satisfies NavItem[];

const componentCards = [
  {
    title: "AEGIS Agent",
    category: "Agent",
    body: "Autonomous agents for planning, reasoning, and task execution across private workspaces.",
    version: "v2.4",
    compatibility: "Cloud, Desktop",
    icon: Bot,
  },
  {
    title: "AEGIS Server",
    category: "Infrastructure",
    body: "Core runtime for hosting secure AI services, model routing, and workspace orchestration.",
    version: "v3.1",
    compatibility: "Linux, Edge",
    icon: Database,
  },
  {
    title: "AEGIS Client",
    category: "Desktop",
    body: "Native client for connecting teams, devices, and protected AI sessions.",
    version: "v1.8",
    compatibility: "macOS, Windows",
    icon: Monitor,
  },
  {
    title: "AEGIS Hybrid",
    category: "Hybrid",
    body: "Combine local compute with distributed network capabilities and policy controls.",
    version: "v2.0",
    compatibility: "Cloud, Local",
    icon: Link2,
  },
  {
    title: "Tools Pack",
    category: "Plugins",
    body: "Extensions, automations, and operational tools for advanced deployment workflows.",
    version: "v1.6",
    compatibility: "Workspace",
    icon: BriefcaseBusiness,
  },
  {
    title: "SDK & CLI",
    category: "Developer",
    body: "SDKs, command-line utilities, and integration guides for engineering teams.",
    version: "v0.9",
    compatibility: "Node, REST",
    icon: Box,
  },
];

const downloadComponents: DownloadComponent[] = [
  {
    name: "AEGIS Agent",
    category: "Official Agent",
    description: "Autonomous runtime for reasoning, planning, memory, and secure tool execution.",
    version: "v2.4.1",
    publisher: "AEGIS Official",
    downloads: "12,431",
    rating: "4.9",
    compatibility: ["Linux", "Windows", "macOS"],
    platforms: ["Desktop", "Server"],
    architecture: "x64, ARM64",
    license: "Enterprise",
    updated: "Today",
    status: "Recommended",
    size: "182 MB",
    checksum: "8f14e45fceea167a5a36dedd4bea2543",
    channel: "Stable",
    icon: Bot,
    install: "aegis install agent-runtime --channel stable",
    features: ["Reasoning engine", "Memory orchestration", "Tool permissions", "Offline execution"],
  },
  {
    name: "AEGIS Server",
    category: "Server",
    description: "Private AI infrastructure server for routing, policies, deployments, and observability.",
    version: "v3.1.0",
    publisher: "AEGIS Official",
    downloads: "8,204",
    rating: "4.8",
    compatibility: ["Linux", "Docker", "Edge"],
    platforms: ["Server", "Container"],
    architecture: "x64, ARM64",
    license: "Restricted",
    updated: "2 days ago",
    status: "Restricted",
    size: "642 MB",
    checksum: "45c48cce2e2d7fbdea1afc51c7c6ad26",
    channel: "Stable",
    icon: Database,
    install: "docker pull aegis/server:3.1.0",
    features: ["Model routing", "Policy engine", "Audit logs", "Workspace isolation"],
  },
  {
    name: "AEGIS Client",
    category: "Desktop Client",
    description: "Native client for private AI sessions, component updates, and workspace controls.",
    version: "v1.8.3",
    publisher: "AEGIS Official",
    downloads: "21,098",
    rating: "4.7",
    compatibility: ["Windows", "macOS"],
    platforms: ["Desktop"],
    architecture: "x64, Apple Silicon",
    license: "Commercial",
    updated: "Jun 28",
    status: "Available",
    size: "96 MB",
    checksum: "6512bd43d9caa6e02c990b0a82652dca",
    channel: "Stable",
    icon: Monitor,
    install: "aegis install desktop-client",
    features: ["Secure workspace", "Component updates", "Local credentials", "Notifications"],
  },
  {
    name: "AEGIS CLI",
    category: "CLI",
    description: "Developer-first command line for downloads, verification, deployments, and API keys.",
    version: "v0.9.6",
    publisher: "AEGIS Developer Tools",
    downloads: "15,782",
    rating: "4.8",
    compatibility: ["Linux", "Windows", "macOS"],
    platforms: ["CLI", "SDK"],
    architecture: "Universal",
    license: "MIT",
    updated: "Yesterday",
    status: "Available",
    size: "18 MB",
    checksum: "c20ad4d76fe97759aa27a0c99bff6710",
    channel: "Beta",
    icon: Terminal,
    install: "npm install -g @aegis/cli",
    features: ["Copy install commands", "Checksum verify", "Project deploy", "Release rollback"],
  },
  {
    name: "Edge Runtime",
    category: "Edge Runtime",
    description: "Lightweight runtime for Jetson, Raspberry Pi, IoT, and offline AI deployments.",
    version: "v1.2.0",
    publisher: "AEGIS Labs",
    downloads: "4,118",
    rating: "4.6",
    compatibility: ["Linux", "Jetson", "Raspberry Pi"],
    platforms: ["Edge", "IoT"],
    architecture: "ARM64",
    license: "Enterprise",
    updated: "Jun 25",
    status: "Beta",
    size: "74 MB",
    checksum: "c51ce410c124a10e0db5e4b97fc2af39",
    channel: "Beta",
    icon: Cpu,
    install: "aegis install edge-runtime --arch arm64",
    features: ["Low memory mode", "Offline queue", "Device telemetry", "Signed packages"],
  },
  {
    name: "Security Pack",
    category: "Security Modules",
    description: "Enterprise hardening templates, checksum policies, signatures, and deployment scans.",
    version: "v1.5.2",
    publisher: "AEGIS Security",
    downloads: "5,904",
    rating: "5.0",
    compatibility: ["Linux", "Docker", "Server"],
    platforms: ["Security", "Templates"],
    architecture: "Universal",
    license: "Enterprise",
    updated: "Jun 22",
    status: "Restricted",
    size: "41 MB",
    checksum: "aab3238922bcc25a6f606eb525ffdc56",
    channel: "Stable",
    icon: Shield,
    install: "aegis install security-pack --verify",
    features: ["Signature policy", "Integrity gates", "Audit templates", "Risk warnings"],
  },
];

const marketplaceProducts: MarketplaceProduct[] = [
  {
    name: "Private Agent Pack",
    publisher: "AEGIS Official",
    category: "Agent Runtime",
    description: "Enterprise-ready agent runtime with memory, planning, tool permissions, and workspace isolation.",
    version: "v2.4.1",
    compatibility: ["Linux", "Windows", "macOS", "Cloud"],
    downloads: "18,420",
    rating: "4.9",
    reviews: "284",
    price: "Included",
    license: "Enterprise",
    updated: "Today",
    status: "Official",
    security: "SOC2, Signed, Malware scanned",
    install: "aegis marketplace install private-agent-pack",
    icon: Bot,
    tags: ["Privacy AI", "Agents", "Enterprise"],
    features: ["Reasoning engine", "Memory workflows", "Tool governance", "Audit-ready execution"],
  },
  {
    name: "Edge AI Bundle",
    publisher: "AEGIS Labs",
    category: "Edge Runtime",
    description: "Optimized runtime and deployment templates for Jetson, Raspberry Pi, and offline AI systems.",
    version: "v1.2.0",
    compatibility: ["Linux", "ARM64", "Jetson", "Edge"],
    downloads: "7,918",
    rating: "4.7",
    reviews: "96",
    price: "Free",
    license: "Open Source",
    updated: "Yesterday",
    status: "Verified",
    security: "Signed, Dependency scanned",
    install: "aegis marketplace install edge-ai-bundle --workspace edge",
    icon: Cpu,
    tags: ["Edge AI", "IoT", "ARM64"],
    features: ["Offline queue", "Device telemetry", "Rollback support", "Low-memory mode"],
  },
  {
    name: "Security Compliance Pack",
    publisher: "Aegis Security",
    category: "Security Packs",
    description: "Policy templates, integrity gates, compliance reports, and private deployment hardening.",
    version: "v1.5.2",
    compatibility: ["Docker", "Kubernetes", "Cloud"],
    downloads: "5,904",
    rating: "5.0",
    reviews: "71",
    price: "Enterprise",
    license: "Commercial",
    updated: "Jun 28",
    status: "Enterprise",
    security: "GDPR, HIPAA, SOC2",
    install: "aegis marketplace install security-compliance-pack --verify",
    icon: Shield,
    tags: ["Security", "Compliance", "SOC2"],
    features: ["Security scans", "License validation", "Audit templates", "Privacy rating"],
  },
  {
    name: "RAG Workflow Kit",
    publisher: "VectorWorks AI",
    category: "Workflow Packs",
    description: "Production RAG templates with embeddings, chunking, evaluations, and monitoring workflows.",
    version: "v0.8.4",
    compatibility: ["Python", "Node", "Cloud"],
    downloads: "11,203",
    rating: "4.6",
    reviews: "142",
    price: "Freemium",
    license: "MIT",
    updated: "3 days ago",
    status: "Partner",
    security: "Publisher verified",
    install: "aegis marketplace install rag-workflow-kit",
    icon: Layers,
    tags: ["RAG", "Embeddings", "Developers"],
    features: ["Evaluation harness", "Prompt templates", "Vector adapters", "Monitoring dashboards"],
  },
  {
    name: "Healthcare AI Templates",
    publisher: "MedCore Labs",
    category: "Templates",
    description: "HIPAA-conscious starter workflows for clinical summarization, intake, and audit review.",
    version: "v1.0.0",
    compatibility: ["Cloud", "Private Workspace"],
    downloads: "3,612",
    rating: "4.8",
    reviews: "58",
    price: "Custom Quote",
    license: "Enterprise",
    updated: "Jun 24",
    status: "Partner",
    security: "HIPAA, License validated",
    install: "Request enterprise deployment",
    icon: FileText,
    tags: ["Healthcare", "HIPAA", "Templates"],
    features: ["Clinical workflows", "Audit logs", "PHI-safe prompts", "Reviewer controls"],
  },
  {
    name: "Developer Essentials",
    publisher: "Community",
    category: "Developer Tools",
    description: "CLI helpers, local testing templates, SDK snippets, and starter repositories.",
    version: "v0.6.3",
    compatibility: ["CLI", "SDK", "Docker"],
    downloads: "24,110",
    rating: "4.5",
    reviews: "311",
    price: "Free",
    license: "Apache 2.0",
    updated: "Jun 20",
    status: "Community",
    security: "Community scanned",
    install: "aegis marketplace install developer-essentials",
    icon: Terminal,
    tags: ["SDK", "CLI", "Starter Kits"],
    features: ["Starter projects", "SDK examples", "Local mocks", "CI recipes"],
  },
];

const sectionCatalog: Record<
  Exclude<DashboardView, "dashboard">,
  {
    title: string;
    eyebrow: string;
    description: string;
    primaryAction: string;
    workflow: WorkflowType;
    icon: React.ComponentType<{ className?: string }>;
    filters: string[];
    cards: Array<{
      title: string;
      meta: string;
      description: string;
      action: string;
      icon: React.ComponentType<{ className?: string }>;
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

const requestStatusClass: Record<PendingRequest["status"], string> = {
  approved: "bg-emerald-500/15 text-emerald-300",
  pending: "bg-violet-500/15 text-violet-200",
  quarantined: "bg-amber-500/15 text-amber-300",
  rejected: "bg-red-500/15 text-red-300",
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

// Helper to hash password client-side using Web Crypto.
async function hashPasswordSHA256(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState<DashboardView>("dashboard");
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowType | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");

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

  // Mock live telemetry
  const [telemetry, setTelemetry] = useState({
    activeChannels: 4,
    latency: 18,
    dataProcessed: 284.5,
    tokensEarned: 12.8,
  });

  useEffect(() => {
    // Simulate real-time data changes
    const timer = setInterval(() => {
      setTelemetry((prev) => ({
        activeChannels: prev.activeChannels,
        latency: Math.max(12, prev.latency + Math.floor(Math.random() * 5) - 2),
        dataProcessed: parseFloat((prev.dataProcessed + Math.random() * 0.1).toFixed(2)),
        tokensEarned: parseFloat((prev.tokensEarned + Math.random() * 0.002).toFixed(4)),
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        // Fetch User Profile from Firestore using user.uid
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // Fallback check by email (handles legacy accounts before full migration profile write)
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

  // Sync operator's nodes and requests in real-time
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

    // Dispatch event to update navbar buttons
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

  const handleChangePassword = async (e: React.FormEvent) => {
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

      // Reauthenticate user before password update
      const credential = EmailAuthProvider.credential(user.email || "", currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password using Firebase Auth
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050812] text-white flex items-center justify-center font-body">
        <div className="flex flex-col items-center gap-3">
          <Cpu className="w-8 h-8 text-[#7DD3FC] animate-spin" />
          <span className="text-xs text-slate-500 font-mono tracking-wider">Synchronizing secure session...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#050812] text-white flex flex-col items-center justify-center gap-4 font-body">
        <div className="text-sm text-red-300 border border-red-500/20 bg-red-500/10 px-6 py-4 rounded-xl max-w-sm text-center">
          {error || "Access Denied."}
        </div>
        <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-white underline cursor-pointer">
          Return to Login
        </button>
      </div>
    );
  }

  const displayName = profile.email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Gokul S";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";
  const approvedRequests = userRequests.filter((req) => req.status === "approved").length;
  const currentSection = activeView === "dashboard" ? null : sectionCatalog[activeView];

  const openWorkflow = (workflow: WorkflowType) => {
    setQuickCreateOpen(false);
    setCommandOpen(false);
    setActiveWorkflow(workflow);
  };

  return (
    <main className="min-h-screen bg-[#07090f] text-white font-body">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_72%_0%,rgba(139,92,246,0.12),transparent_30%),linear-gradient(135deg,#090c13_0%,#07090f_48%,#05060a_100%)]" />

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden xl:flex w-72 shrink-0 flex-col border-r border-white/[0.07] bg-[#090c13]/92 px-5 py-6">
          <Link href="/" className="flex items-center gap-3 px-1">
            <Image src="/assets/logo.png" alt="AEGIS" width={42} height={42} className="rounded-xl" priority />
            <div>
              <div className="font-heading text-2xl font-semibold tracking-[0.08em] text-white">AEGIS</div>
              <div className="text-[10px] font-medium text-slate-500">Private AI Workspace</div>
            </div>
          </Link>

          <nav className="mt-8 flex flex-1 flex-col gap-5 text-[13px]">
            <button
              onClick={() => setActiveView("dashboard")}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors ${
                activeView === "dashboard"
                  ? "border-violet-400/20 bg-violet-500/12 text-white"
                  : "border-transparent text-slate-300 hover:bg-white/[0.045] hover:text-white"
              }`}
            >
              <Home className="h-5 w-5 text-violet-300" />
              Dashboard
            </button>

            <SidebarGroup title="Workspace" items={requestNav} activeView={activeView} onSelect={setActiveView} />
            <SidebarGroup title="AI Platform" items={apiNav} activeView={activeView} onSelect={setActiveView} />
            <SidebarGroup title="Business" items={subscriptionNav} activeView={activeView} onSelect={setActiveView} />
            <SidebarGroup title="Settings" items={accountNav} activeView={activeView} onSelect={setActiveView} />

            <div className="mt-auto space-y-3">
              <SidebarGroup title="Support" items={supportNav} activeView={activeView} onSelect={setActiveView} />
              <Link
                href="/agent-ecosystem"
                className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-4 transition-colors hover:bg-white/[0.055]"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/12 text-violet-300">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block font-semibold text-white">AEGIS Ecosystem</span>
                    <span className="block text-xs text-slate-500">Explore the AI network</span>
                  </span>
                </span>
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
          <header className="flex flex-col gap-5 pb-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">{currentSection?.eyebrow || "Workspace overview"}</p>
              <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {currentSection?.title || `Welcome back, ${displayName}`}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                {currentSection?.description || "Manage private downloads, API access, compute requests, and subscriptions from one focused enterprise AI workspace."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCommandOpen(true)}
                className="hidden h-11 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-4 text-xs text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white md:flex"
              >
                <Search className="h-4 w-4" />
                Search
                <span className="rounded-md border border-white/[0.08] px-1.5 py-0.5 text-[10px] text-slate-500">K</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setQuickCreateOpen((value) => !value)}
                  className="grid h-11 w-11 place-items-center rounded-full bg-violet-500 text-white transition-colors hover:bg-violet-400"
                  title="Quick create"
                >
                  <Plus className="h-4 w-4" />
                </button>
                {quickCreateOpen && <QuickCreateMenu onOpenWorkflow={openWorkflow} />}
              </div>
              <button onClick={() => setActiveView("notifications")} className="grid h-11 w-11 place-items-center rounded-full border border-white/[0.08] bg-white/[0.035] text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white">
                <Bell className="h-4 w-4" />
              </button>
              <button className="grid h-11 w-11 place-items-center rounded-full border border-white/[0.08] bg-white/[0.035] text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white">
                <Moon className="h-4 w-4" />
              </button>
              <div className="hidden h-8 w-px bg-white/10 sm:block" />
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-violet-500/90 font-heading text-sm font-semibold">{initials}</div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-white">{displayName}</p>
                  <p className="max-w-52 truncate text-xs text-slate-400">{profile.email}</p>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
              </div>
              <button
                onClick={handleLogout}
                className="grid h-11 w-11 place-items-center rounded-full border border-red-400/20 bg-red-500/10 text-red-300 transition-colors hover:bg-red-500/15"
                title="Disconnect"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>

          {activeView === "dashboard" || !currentSection ? (
            <>
          <div className="grid gap-4 lg:grid-cols-3">
            <section className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-[#0d111a]/88 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-violet-300">Continue Working</p>
                  <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-white">Set up your private AI workspace</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Start with a component request, connect an API key, then bring approved compute nodes online.</p>
                </div>
                <span className="inline-flex w-fit items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  {profile.status}
                </span>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <ActionCard title="Request access" body="Browse components and submit a request." icon={CloudDownload} action="New request" onAction={() => openWorkflow("request")} />
                <ActionCard title="Create API key" body="Prepare production or development access." icon={KeyRound} action="Create key" onAction={() => openWorkflow("api-key")} />
                <ActionCard title="Register node" body="Add compute capacity for approval." icon={Cpu} action="Register" onAction={() => openWorkflow("request")} />
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/88 p-6">
              <h2 className="font-heading text-base font-semibold text-white">Workspace Health</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <StatPill label="Requests" value={userRequests.length.toString()} icon={CircleEllipsis} />
                <StatPill label="Nodes" value={userNodes.length.toString()} icon={Cpu} />
                <StatPill label="Latency" value={`${telemetry.latency} ms`} icon={Gauge} />
                <StatPill label="Credits" value={`${telemetry.tokensEarned.toFixed(2)} AGS`} icon={WalletCards} />
              </div>
            </section>
          </div>

          <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-5">
              <section className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/88 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
                <PanelHeader title="Component Marketplace" body="Curated AEGIS products for private AI deployments." linkLabel="View catalog" />
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Agent", "Server", "Client", "Hybrid", "Plugins", "SDK"].map((category) => (
                    <button key={category} className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-violet-300/30 hover:text-white">
                      {category}
                    </button>
                  ))}
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {componentCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <article key={card.title} className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300/25 hover:bg-white/[0.045]">
                        <div className="flex items-start justify-between gap-3">
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-violet-500/10 text-violet-200">
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="rounded-full bg-white/[0.05] px-2 py-1 text-[10px] font-medium text-slate-400">{card.version}</span>
                        </div>
                        <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-violet-300">{card.category}</p>
                        <h3 className="mt-2 font-heading text-sm font-semibold leading-snug text-white">{card.title}</h3>
                        <p className="mt-2 min-h-16 text-xs leading-5 text-slate-400">{card.body}</p>
                        <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/10 px-3 py-2 text-[11px] text-slate-400">
                          Compatible with <span className="text-slate-200">{card.compatibility}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <button onClick={() => openWorkflow("request")} className="rounded-lg bg-violet-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-400">Request Access</button>
                          <button onClick={() => openWorkflow("download")} className="rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white">Learn More</button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/88 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
                <PanelHeader title="Request Center" body="Track approvals, reviewers, and expected next steps." linkLabel="Open requests" />
                {userRequests.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/10 text-violet-200">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-heading text-base font-semibold text-white">No requests yet</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">Submit your first node registration or component request and approval progress will appear here.</p>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-3">
                    {userRequests.slice(0, 5).map((req) => (
                      <article key={req.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-heading text-sm font-semibold text-white">{req.name}</h3>
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${requestStatusClass[req.status]}`}>{req.status}</span>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">{req.id.slice(0, 12).toUpperCase()} · Node Registration · {req.date || "Today"}</p>
                          </div>
                          <div className="min-w-52">
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                              <div className={`h-full rounded-full ${req.status === "approved" ? "w-full bg-emerald-400" : req.status === "rejected" ? "w-1/3 bg-red-400" : "w-2/3 bg-violet-400"}`} />
                            </div>
                            <p className="mt-2 text-[11px] text-slate-500">Reviewer: AEGIS Operations · ETA 24-48h</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/88 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
                <PanelHeader title="My AI Compute Nodes" body={`${userNodes.length} active node${userNodes.length === 1 ? "" : "s"} connected to this operator.`} />
                {userNodes.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/10 text-violet-200">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-heading text-base font-semibold text-white">No compute nodes connected</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">Approved nodes will appear here with latency, capabilities, and network status.</p>
                  </div>
                ) : (
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="text-xs text-slate-400">
                        <tr className="border-b border-white/8">
                          <th className="px-3 py-3 font-medium">Node Name</th>
                          <th className="px-3 py-3 font-medium">Location</th>
                          <th className="px-3 py-3 font-medium">Capabilities</th>
                          <th className="px-3 py-3 font-medium">Latency</th>
                          <th className="px-3 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/6">
                        {userNodes.map((node) => (
                          <tr key={node.id}>
                            <td className="px-3 py-4 font-semibold text-white">{node.name}</td>
                            <td className="px-3 py-4 text-slate-300">{node.country}</td>
                            <td className="max-w-xs truncate px-3 py-4 text-slate-400" title={node.capabilities}>
                              {node.capabilities}
                            </td>
                            <td className="px-3 py-4 font-mono text-xs text-violet-200">{node.latency} ms</td>
                            <td className="px-3 py-4">
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                                {node.status || "online"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="grid gap-5 lg:grid-cols-2">
                <RegisterNodeForm
                  nodeName={nodeName}
                  nodeLocation={nodeLocation}
                  gpuSpecs={gpuSpecs}
                  regLoading={regLoading}
                  regError={regError}
                  regSuccess={regSuccess}
                  setNodeName={setNodeName}
                  setNodeLocation={setNodeLocation}
                  setGpuSpecs={setGpuSpecs}
                  onSubmit={handleRegisterNode}
                />
                <PasswordForm
                  currentPassword={currentPassword}
                  newPassword={newPassword}
                  confirmPassword={confirmPassword}
                  passLoading={passLoading}
                  passError={passError}
                  passSuccess={passSuccess}
                  setCurrentPassword={setCurrentPassword}
                  setNewPassword={setNewPassword}
                  setConfirmPassword={setConfirmPassword}
                  onSubmit={handleChangePassword}
                />
              </section>
            </div>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/88 p-5">
                <PanelHeader title="API Access" linkLabel="Manage keys" />
                <div className="mt-7 flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Total Keys</p>
                    <p className="mt-3 text-3xl font-semibold">{Math.max(2, approvedRequests)}</p>
                  </div>
                  <KeyRound className="h-12 w-12 text-violet-400" />
                </div>
                <div className="mt-5 space-y-2 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Environment</span>
                    <span className="text-white">Production</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Rate limit</span>
                    <span className="text-white">10k req/day</span>
                  </div>
                </div>
                <button onClick={() => openWorkflow("api-key")} className="mt-4 flex w-full items-center justify-between rounded-xl bg-violet-500 px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:bg-violet-400">
                  Create API key
                  <Plus className="h-5 w-5 text-slate-300" />
                </button>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/88 p-5">
                <PanelHeader title="Subscription" linkLabel="View plans" />
                <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-base font-bold">AEGIS Pro</h3>
                      <p className="mt-1 text-xs text-slate-400">Valid until 24 May 2027</p>
                    </div>
                    <span className="rounded-md bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">Active</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-400">Includes premium downloads, API access and priority support.</p>
                  <button onClick={() => openWorkflow("upgrade")} className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.07]">
                    Manage Subscription
                    <Settings className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/88 p-5">
                <h2 className="font-heading text-base font-semibold text-white">Network Telemetry</h2>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <StatPill label="Channels" value={telemetry.activeChannels.toString()} icon={Activity} />
                  <StatPill label="Latency" value={`${telemetry.latency} ms`} icon={Gauge} />
                  <StatPill label="Hashing" value={`${telemetry.dataProcessed} GH/s`} icon={Cpu} />
                  <StatPill label="Credits" value={`${telemetry.tokensEarned.toFixed(4)} AGS`} icon={WalletCards} />
                </div>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/88 p-5">
                <h2 className="font-heading text-base font-semibold text-white">Documentation</h2>
                <div className="mt-4 space-y-3 text-xs text-slate-200">
                  {["Quick Start", "SDK Docs", "Integration Guides", "Release Notes"].map((link) => (
                    <button key={link} className="flex w-full items-center justify-between text-left hover:text-white">
                      <span className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        {link}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-violet-300/20 bg-violet-500/[0.08] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-heading text-base font-semibold text-white">Need help?</h2>
                    <p className="mt-2 text-xs leading-5 text-slate-300">Our support team is here to help you with any questions.</p>
                    <button onClick={() => openWorkflow("support")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-violet-400">
                      <Headphones className="h-4 w-4" />
                      Contact Support
                    </button>
                  </div>
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-violet-300/20 bg-violet-500/10 text-violet-100">
                    <Headphones className="h-6 w-6" />
                  </div>
                </div>
              </section>
            </aside>
          </div>
            </>
          ) : (
            <SectionPage section={currentSection} onOpenWorkflow={openWorkflow} userRequests={userRequests} />
          )}

          <footer className="mt-8 flex flex-col gap-3 border-t border-white/[0.08] pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-violet-300" />
              AEGIS Decentralized Computing Protocol
            </span>
            <span>Client Version 0.1.0</span>
          </footer>
        </section>
      </div>
      {commandOpen && (
        <CommandPalette
          query={globalQuery}
          setQuery={setGlobalQuery}
          onClose={() => setCommandOpen(false)}
          onSelectView={(view) => {
            setActiveView(view);
            setCommandOpen(false);
          }}
          onOpenWorkflow={openWorkflow}
        />
      )}
      {activeWorkflow && <WorkflowModal workflow={activeWorkflow} onClose={() => setActiveWorkflow(null)} />}
    </main>
  );
}

function SidebarGroup({
  title,
  items,
  activeView,
  onSelect,
}: {
  title: string;
  items: NavItem[];
  activeView: DashboardView;
  onSelect: (view: DashboardView) => void;
}) {
  return (
    <div>
      <p className="mb-3 px-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <div className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.label}
              onClick={() => onSelect(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                active ? "bg-white/[0.055] text-white" : "text-slate-300 hover:bg-white/[0.045] hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-violet-300" : "text-slate-500"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionPage({
  section,
  onOpenWorkflow,
  userRequests,
}: {
  section: (typeof sectionCatalog)[Exclude<DashboardView, "dashboard">];
  onOpenWorkflow: (workflow: WorkflowType) => void;
  userRequests: PendingRequest[];
}) {
  if (section.eyebrow === "Downloads") {
    return <DownloadCenter onOpenWorkflow={onOpenWorkflow} />;
  }
  if (section.eyebrow === "Approvals") {
    return <RequestCenter userRequests={userRequests} onOpenWorkflow={onOpenWorkflow} />;
  }
  if (section.eyebrow === "Discover") {
    return <MarketplaceCenter onOpenWorkflow={onOpenWorkflow} />;
  }

  const Icon = section.icon;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/88 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/[0.08] bg-violet-500/10 text-violet-200">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-violet-300">{section.eyebrow}</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-white">{section.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{section.description}</p>
            </div>
          </div>
          <button
            onClick={() => onOpenWorkflow(section.workflow)}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-400"
          >
            <Plus className="h-4 w-4" />
            {section.primaryAction}
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex h-11 max-w-xl flex-1 items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-slate-400">
            <Search className="h-4 w-4 text-slate-500" />
            <input className="w-full bg-transparent text-white outline-none placeholder:text-slate-600" placeholder={`Search ${section.title.toLowerCase()}`} />
          </label>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06]">
              <Filter className="h-3.5 w-3.5" />
              Filters
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06]">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06]">
              <MoreHorizontal className="h-3.5 w-3.5" />
              Columns
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {section.filters.map((filter) => (
            <button key={filter} className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-violet-300/30 hover:text-white">
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {section.cards.map((card) => {
          const CardIcon = card.icon;
          return (
            <article key={card.title} className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/88 p-5 transition-colors hover:bg-[#111722]">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.08] bg-violet-500/10 text-violet-200">
                  <CardIcon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-slate-400">{card.meta}</span>
              </div>
              <h3 className="mt-4 font-heading text-base font-semibold text-white">{card.title}</h3>
              <p className="mt-2 min-h-16 text-sm leading-6 text-slate-400">{card.description}</p>
              <button onClick={() => onOpenWorkflow(section.workflow)} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/[0.07]">
                {card.action}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/88 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-base font-semibold text-white">Enterprise Table</h2>
            <p className="mt-1 text-xs text-slate-500">Search, filter, sort, bulk select, export, pin columns, and open row actions.</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.05]">Bulk actions</button>
            <button className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.05]">Export</button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs text-slate-500">
              <tr className="border-b border-white/[0.08]">
                <th className="w-10 px-3 py-3"><input type="checkbox" aria-label="Select all rows" /></th>
                <th className="px-3 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Details</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Updated</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {section.table.map((row) => (
                <tr key={row.name} className="text-slate-300 hover:bg-white/[0.025]">
                  <td className="px-3 py-4"><input type="checkbox" aria-label={`Select ${row.name}`} /></td>
                  <td className="px-3 py-4 font-medium text-white">{row.name}</td>
                  <td className="px-3 py-4 text-slate-400">{row.detail}</td>
                  <td className="px-3 py-4"><span className="rounded-full bg-violet-500/12 px-2.5 py-1 text-xs text-violet-200">{row.status}</span></td>
                  <td className="px-3 py-4 text-slate-400">{row.updated}</td>
                  <td className="px-3 py-4 text-right"><MoreHorizontal className="ml-auto h-4 w-4 text-slate-500" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function DownloadCenter({ onOpenWorkflow }: { onOpenWorkflow: (workflow: WorkflowType) => void }) {
  const [activeChip, setActiveChip] = useState("All");
  const [selectedComponent, setSelectedComponent] = useState<DownloadComponent | null>(null);
  const [downloadComponent, setDownloadComponent] = useState<DownloadComponent | null>(null);
  const [managerOpen, setManagerOpen] = useState(true);

  const chips = ["All", "Agent", "Server", "Client", "Hybrid", "CLI", "SDK", "Plugin", "Docker", "Edge", "Linux", "Windows", "macOS", "ARM64", "Verified"];
  const visibleComponents =
    activeChip === "All"
      ? downloadComponents
      : downloadComponents.filter((component) =>
          [component.category, component.status, component.architecture, ...component.compatibility, ...component.platforms].some((value) =>
            value.toLowerCase().includes(activeChip.toLowerCase()),
          ),
        );

  const startDownload = (component: DownloadComponent) => {
    setDownloadComponent(component);
    setManagerOpen(true);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/[0.08] bg-[#0d111a]/88 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-violet-300">Download Center</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-white">AEGIS Component Center</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Discover, compare, deploy and manage official AEGIS components with release notes, compatibility, integrity verification, and access workflows.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => onOpenWorkflow("request")} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-400">
              <Plus className="h-4 w-4" />
              Request Access
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white">
              <UploadIcon />
              Upload Component
            </button>
          </div>
        </div>

        <div className="mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3">
          <label className="flex h-14 items-center gap-3 rounded-xl bg-black/10 px-4">
            <Search className="h-5 w-5 text-slate-500" />
            <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" placeholder="Search agents, clients, servers, plugins, SDKs..." />
            <span className="rounded-lg border border-white/[0.08] px-2 py-1 text-[11px] text-slate-500">Ctrl K</span>
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => setActiveChip(chip)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  activeChip === chip
                    ? "border-violet-300/30 bg-violet-500/15 text-violet-100"
                    : "border-white/[0.08] bg-white/[0.025] text-slate-300 hover:border-violet-300/25 hover:text-white"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <PanelHeader title="Featured Components" body="Newest releases, recommended installs, and enterprise-ready packages." linkLabel="Release notes" />
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {downloadComponents.slice(0, 3).map((component, index) => {
            const Icon = component.icon;
            const badges = ["Newest Release", "Recommended", "Popular Download"];
            return (
              <article key={component.name} className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-500/12 via-white/[0.035] to-white/[0.02] p-5 transition-all hover:-translate-y-0.5 hover:border-violet-300/25">
                <div className="flex items-start justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/15 text-violet-100">
                    <Icon className="h-7 w-7" />
                  </span>
                  <span className="rounded-full border border-white/[0.08] bg-black/15 px-3 py-1 text-[11px] text-violet-100">{badges[index]}</span>
                </div>
                <h3 className="mt-5 font-heading text-lg font-semibold text-white">{component.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{component.version} · {component.publisher}</p>
                <p className="mt-3 min-h-14 text-sm leading-6 text-slate-400">{component.description}</p>
                <div className="mt-5 flex items-center gap-2">
                  <button onClick={() => startDownload(component)} className="rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-medium text-white hover:bg-violet-400">Download</button>
                  <button onClick={() => setSelectedComponent(component)} className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white">Learn More</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-white/[0.08] bg-[#0d111a]/88 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <PanelHeader title="Component Library" body={`${visibleComponents.length} components match your current filters.`} />
          <div className="flex flex-wrap gap-2">
            {["Newest", "Most Downloaded", "Recently Updated", "Verified", "Alphabetical"].map((sort) => (
              <button key={sort} className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06]">{sort}</button>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visibleComponents.map((component) => (
            <DownloadComponentCard
              key={component.name}
              component={component}
              onDetails={() => setSelectedComponent(component)}
              onDownload={() => startDownload(component)}
              onRequest={() => onOpenWorkflow("request")}
            />
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.08] pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Showing 1-{visibleComponents.length} of {downloadComponents.length} components</span>
          <div className="flex gap-2">
            <button className="rounded-xl border border-white/[0.08] px-3 py-2 text-slate-300 hover:bg-white/[0.05]">Previous</button>
            <button className="rounded-xl bg-violet-500 px-3 py-2 text-white">1</button>
            <button className="rounded-xl border border-white/[0.08] px-3 py-2 text-slate-300 hover:bg-white/[0.05]">Next</button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <EnterpriseDownloadTable components={downloadComponents} onDetails={setSelectedComponent} />
        <InstalledComponentsPanel />
      </section>

      {selectedComponent && (
        <ComponentDetailsDrawer
          component={selectedComponent}
          onClose={() => setSelectedComponent(null)}
          onDownload={() => startDownload(selectedComponent)}
          onRequest={() => onOpenWorkflow("request")}
        />
      )}
      {downloadComponent && <DownloadModal component={downloadComponent} onClose={() => setDownloadComponent(null)} />}
      {managerOpen && <DownloadManager onClose={() => setManagerOpen(false)} />}
    </div>
  );
}

type RequestCenterItem = {
  id: string;
  title: string;
  category: string;
  component: string;
  priority: string;
  stage: string;
  reviewer: string;
  status: PendingRequest["status"] | "draft" | "submitted" | "security" | "technical" | "completed";
  progress: number;
  created: string;
  updated: string;
  eta: string;
  organization: string;
  description: string;
};

function RequestCenter({
  userRequests,
  onOpenWorkflow,
}: {
  userRequests: PendingRequest[];
  onOpenWorkflow: (workflow: WorkflowType) => void;
}) {
  const [selectedRequest, setSelectedRequest] = useState<RequestCenterItem | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState("All");

  const liveRequests: RequestCenterItem[] = userRequests.map((request, index) => ({
    id: request.id.slice(0, 12).toUpperCase(),
    title: request.name || "Node registration request",
    category: "Compute",
    component: request.gpuSpecs || "AEGIS Node",
    priority: index % 2 === 0 ? "Normal" : "High",
    stage: request.status === "approved" ? "Completed" : request.status === "rejected" ? "Decision Made" : "Security Review",
    reviewer: "AEGIS Operations",
    status: request.status,
    progress: request.status === "approved" ? 100 : request.status === "rejected" ? 35 : 64,
    created: request.date || "Today",
    updated: "Live",
    eta: request.status === "pending" ? "24-48h" : "Closed",
    organization: request.country || "Personal Workspace",
    description: `Request for ${request.name || "compute node"} using ${request.gpuSpecs || "AEGIS infrastructure"}.`,
  }));

  const fallbackRequests: RequestCenterItem[] = [
    {
      id: "REQ-2026-0042",
      title: "AEGIS Server access",
      category: "Infrastructure",
      component: "AEGIS Server v3.1",
      priority: "High",
      stage: "Technical Validation",
      reviewer: "Maya Chen",
      status: "pending",
      progress: 68,
      created: "Today",
      updated: "18m ago",
      eta: "24h",
      organization: "Personal Workspace",
      description: "Requesting access to private server runtime for a secure deployment pilot.",
    },
    {
      id: "REQ-2026-0038",
      title: "API access expansion",
      category: "Developer",
      component: "Production API",
      priority: "Normal",
      stage: "Management Approval",
      reviewer: "AEGIS Platform",
      status: "approved",
      progress: 100,
      created: "Yesterday",
      updated: "Yesterday",
      eta: "Complete",
      organization: "Personal Workspace",
      description: "Approved production API limits for integration testing and deployment.",
    },
    {
      id: "REQ-2026-0031",
      title: "Edge Runtime beta",
      category: "Beta Program",
      component: "Edge Runtime v1.2",
      priority: "Low",
      stage: "Initial Review",
      reviewer: "Ravi Nair",
      status: "security",
      progress: 44,
      created: "Jun 28",
      updated: "2d ago",
      eta: "3d",
      organization: "Research Workspace",
      description: "Beta access request for ARM64 edge runtime and signed package verification.",
    },
  ];

  const requests = liveRequests.length > 0 ? liveRequests : fallbackRequests;
  const visibleRequests =
    activeStatus === "All"
      ? requests
      : requests.filter((request) => request.status.toLowerCase().includes(activeStatus.toLowerCase()) || request.stage.toLowerCase().includes(activeStatus.toLowerCase()));
  const stats = [
    { label: "Pending Requests", value: requests.filter((request) => request.status === "pending").length.toString(), trend: "+12% this week", icon: CircleEllipsis },
    { label: "Under Review", value: requests.filter((request) => request.progress > 0 && request.progress < 100).length.toString(), trend: "2 active stages", icon: Activity },
    { label: "Approved", value: requests.filter((request) => request.status === "approved").length.toString(), trend: "94% success", icon: ShieldCheck },
    { label: "Avg Approval", value: "31h", trend: "8h faster", icon: Gauge },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/[0.08] bg-[#0d111a]/88 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-violet-300">Request Management</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-white">Request Center</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Track approvals, monitor request status, collaborate with reviewers, and manage every request across your AEGIS workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setWizardOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-400">
              <Plus className="h-4 w-4" />
              New Request
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white">
              <UploadIcon />
              Import Request
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition-colors hover:bg-white/[0.045]">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-200">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] text-emerald-300">{stat.trend}</span>
                </div>
                <p className="mt-4 text-3xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="flex h-14 max-w-2xl flex-1 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 text-sm text-slate-400">
            <Search className="h-5 w-5 text-slate-500" />
            <input className="w-full bg-transparent text-white outline-none placeholder:text-slate-600" placeholder="Search request ID, reviewer, component, status, organization, tags..." />
            <span className="rounded-lg border border-white/[0.08] px-2 py-1 text-[11px] text-slate-500">Ctrl K</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFiltersOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06]">
              <Filter className="h-3.5 w-3.5" />
              Filter Drawer
            </button>
            <button className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06]">Save Filter</button>
            <button className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06]">Refresh</button>
          </div>
        </div>

        {filtersOpen && (
          <div className="mt-4 grid gap-3 rounded-2xl border border-white/[0.08] bg-black/10 p-4 md:grid-cols-2 xl:grid-cols-4">
            {["Request Type", "Status", "Priority", "Component", "Reviewer", "Created Date", "Approval Stage", "Workspace"].map((filter) => (
              <label key={filter} className="block">
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{filter}</span>
                <div className="mt-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-slate-300">Any {filter}</div>
              </label>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-white/[0.08] bg-[#0d111a]/88 p-5">
            <PanelHeader title="Request Pipeline Overview" body="Every request moves through an auditable approval lifecycle." />
            <div className="mt-5 grid gap-3 md:grid-cols-6">
              {["Submitted", "Initial Review", "Security Review", "Technical Validation", "Management Approval", "Completed"].map((stage, index) => (
                <div key={stage} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
                  <div className={`h-1.5 rounded-full ${index < 2 ? "bg-emerald-400" : index === 2 ? "bg-violet-400" : "bg-white/[0.08]"}`} />
                  <p className="mt-3 text-xs font-medium text-white">{stage}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{index < 2 ? "Completed" : index === 2 ? "Current" : "Pending"}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/[0.08] bg-[#0d111a]/88 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <PanelHeader title="Request Table" body="Sort, filter, resize, pin columns, export, bulk select, and open request drawers." />
              <div className="flex flex-wrap gap-2">
                {["All", "Pending", "Security", "Approved", "Rejected", "Draft"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setActiveStatus(status)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      activeStatus === status ? "border-violet-300/30 bg-violet-500/15 text-violet-100" : "border-white/[0.08] bg-white/[0.025] text-slate-300 hover:text-white"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[1120px] text-left text-sm">
                <thead className="text-xs text-slate-500">
                  <tr className="border-b border-white/[0.08]">
                    <th className="w-10 px-3 py-3"><input type="checkbox" aria-label="Select all requests" /></th>
                    {["Request ID", "Title", "Category", "Component", "Priority", "Current Stage", "Reviewer", "Status", "Progress", "Created", "Updated", "ETA", "Organization", "Actions"].map((heading) => (
                      <th key={heading} className="px-3 py-3 font-medium">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {visibleRequests.map((request) => (
                    <tr key={request.id} className="text-slate-300 hover:bg-white/[0.025]">
                      <td className="px-3 py-4"><input type="checkbox" aria-label={`Select ${request.id}`} /></td>
                      <td className="px-3 py-4 font-mono text-xs text-violet-200">{request.id}</td>
                      <td className="px-3 py-4 font-medium text-white">{request.title}</td>
                      <td className="px-3 py-4">{request.category}</td>
                      <td className="px-3 py-4">{request.component}</td>
                      <td className="px-3 py-4">{request.priority}</td>
                      <td className="px-3 py-4">{request.stage}</td>
                      <td className="px-3 py-4">{request.reviewer}</td>
                      <td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-xs capitalize ${requestStatusClass[request.status as PendingRequest["status"]] || "bg-violet-500/12 text-violet-200"}`}>{request.status}</span></td>
                      <td className="px-3 py-4">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/[0.08]">
                          <div className="h-full rounded-full bg-violet-400" style={{ width: `${request.progress}%` }} />
                        </div>
                      </td>
                      <td className="px-3 py-4">{request.created}</td>
                      <td className="px-3 py-4">{request.updated}</td>
                      <td className="px-3 py-4">{request.eta}</td>
                      <td className="px-3 py-4">{request.organization}</td>
                      <td className="px-3 py-4"><button onClick={() => setSelectedRequest(request)} className="text-xs text-violet-300">Open</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-white/[0.08] bg-[#0d111a]/88 p-5">
            <PanelHeader title="Recent Activity" body="Reviewer comments, status changes, uploads, and approvals." />
            <div className="mt-5 space-y-4">
              {["Reviewer assigned to server access", "Architecture diagram uploaded", "Security review started", "ETA changed to 24h"].map((item, index) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-violet-300" />
                  <div>
                    <p className="text-sm text-white">{item}</p>
                    <p className="mt-1 text-xs text-slate-500">{index + 1}h ago - AEGIS Operations</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-violet-300/20 bg-violet-500/[0.08] p-5">
            <PanelHeader title="AI Request Assistant" body="Future-ready suggestions for autofill, approval prediction, reviewer routing, and risk analysis." />
            <button onClick={() => onOpenWorkflow("request")} className="mt-5 rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white hover:bg-violet-400">Start guided request</button>
          </section>
        </aside>
      </section>

      {selectedRequest && <RequestDetailsDrawer request={selectedRequest} onClose={() => setSelectedRequest(null)} onOpenWorkflow={onOpenWorkflow} />}
      {wizardOpen && <RequestWizard onClose={() => setWizardOpen(false)} />}
    </div>
  );
}

function RequestDetailsDrawer({
  request,
  onClose,
  onOpenWorkflow,
}: {
  request: RequestCenterItem;
  onClose: () => void;
  onOpenWorkflow: (workflow: WorkflowType) => void;
}) {
  const timeline = ["Request Created", "Reviewer Assigned", "Documents Uploaded", "Security Review Started", "Status Changed"];

  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <aside className="ml-auto h-full w-full max-w-2xl overflow-y-auto border-l border-white/[0.08] bg-[#0d111a] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.55)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-violet-300">{request.id}</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-white">{request.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{request.description}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Status", request.status],
            ["Priority", request.priority],
            ["ETA", request.eta],
            ["Reviewer", request.reviewer],
            ["Stage", request.stage],
            ["Progress", `${request.progress}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
              <p className="text-[11px] text-slate-500">{label}</p>
              <p className="mt-2 text-sm font-medium text-white capitalize">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["Edit", "Duplicate", "Cancel", "Download", "Share", "Print"].map((action) => (
            <button key={action} onClick={() => action === "Duplicate" && onOpenWorkflow("request")} className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white">{action}</button>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <h3 className="font-heading text-base font-semibold text-white">Timeline</h3>
          <div className="mt-5 space-y-5">
            {timeline.map((event, index) => (
              <div key={event} className="flex gap-4">
                <span className={`mt-1 grid h-7 w-7 place-items-center rounded-full ${index < 3 ? "bg-emerald-500/15 text-emerald-300" : "bg-violet-500/15 text-violet-200"}`}>
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{event}</p>
                  <p className="mt-1 text-xs text-slate-500">{index + 1}h ago - {request.reviewer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <h3 className="font-heading text-base font-semibold text-white">Reviewer Conversation</h3>
          <div className="mt-4 space-y-3">
            {["Please attach architecture details for validation.", "Documents uploaded. Can you confirm the deployment type?", "Security review has started."].map((comment, index) => (
              <div key={comment} className="rounded-2xl border border-white/[0.08] bg-black/10 p-3">
                <p className="text-sm text-slate-300">{comment}</p>
                <p className="mt-2 text-xs text-slate-500">{index % 2 === 0 ? request.reviewer : "You"} - Markdown, attachments and replies supported</p>
              </div>
            ))}
          </div>
          <label className="mt-4 block">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Add comment</span>
            <textarea className="mt-2 min-h-24 w-full rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3 text-sm text-white outline-none focus:border-violet-300/60" placeholder="Write a comment, mention a reviewer, or attach supporting context." />
          </label>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            ["Attachments", "Architecture.pdf - Virus scan clean - 2.4 MB"],
            ["Approval History", "Security Review - In progress - Audit trail ready"],
            ["Related Docs", "Request templates - Approval policy - Component guide"],
            ["Export Center", "CSV - Excel - JSON - PDF - Audit Report"],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
              <h3 className="font-heading text-sm font-semibold text-white">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">{body}</p>
            </div>
          ))}
        </section>
      </aside>
    </div>
  );
}

function RequestWizard({ onClose }: { onClose: () => void }) {
  const steps = ["Request Type", "Project Info", "Technical Info", "Attachments", "Review"];
  return (
    <div className="fixed inset-0 z-50 bg-black/65 px-4 py-10 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-auto max-w-4xl rounded-3xl border border-white/[0.08] bg-[#0d111a] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.55)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-violet-300">New Request Wizard</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-white">Create an AEGIS request</h2>
            <p className="mt-2 text-sm text-slate-400">A guided workflow with autosave, validation, required documents, and estimated approval time.</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {steps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
              <div className={`h-1.5 rounded-full ${index === 0 ? "bg-violet-400" : "bg-white/[0.08]"}`} />
              <p className="mt-3 text-xs font-medium text-white">{step}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { title: "AEGIS Agent", body: "Runtime and agent component access", icon: Bot },
            { title: "AEGIS Server", body: "Private infrastructure deployment", icon: Database },
            { title: "API Access", body: "Production API keys and limits", icon: KeyRound },
            { title: "Enterprise License", body: "Subscription and usage expansion", icon: WalletCards },
            { title: "Model Access", body: "Models, fine-tuning and training credits", icon: Sparkles },
            { title: "Marketplace Publishing", body: "Verified developer component listing", icon: PackageOpen },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-left transition-colors hover:border-violet-300/25 hover:bg-white/[0.045]">
                <Icon className="h-5 w-5 text-violet-300" />
                <h3 className="mt-4 font-heading text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-400">{item.body}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {["Project Name", "Organization", "Purpose", "Expected Usage", "Operating System", "Architecture", "Dependencies", "Deployment Type"].map((field) => (
            <label key={field} className="block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{field}</span>
              <input className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-white outline-none focus:border-violet-300/60" placeholder={field} />
            </label>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.025] p-6 text-center">
          <p className="text-sm font-medium text-white">Drag and drop attachments</p>
          <p className="mt-2 text-xs text-slate-500">Project proposal, architecture diagram, screenshots, license agreement, or supporting documents.</p>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.05]">Cancel</button>
          <button className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.05]">Save Draft</button>
          <button onClick={onClose} className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white hover:bg-violet-400">Submit Request</button>
        </div>
      </div>
    </div>
  );
}

function UploadIcon() {
  return <PackageOpen className="h-4 w-4" />;
}

function DownloadComponentCard({
  component,
  onDetails,
  onDownload,
  onRequest,
}: {
  component: DownloadComponent;
  onDetails: () => void;
  onDownload: () => void;
  onRequest: () => void;
}) {
  const Icon = component.icon;
  const restricted = component.status === "Restricted";

  return (
    <article className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all hover:-translate-y-0.5 hover:border-violet-300/25 hover:bg-white/[0.045]">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-violet-500/10 text-violet-200">
          <Icon className="h-6 w-6" />
        </span>
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
          <button className="rounded-lg border border-white/[0.08] p-2 text-slate-400 hover:text-white"><Bookmark className="h-3.5 w-3.5" /></button>
          <button className="rounded-lg border border-white/[0.08] p-2 text-slate-400 hover:text-white"><Share2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <h3 className="font-heading text-base font-semibold text-white">{component.name}</h3>
        <ShieldCheck className="h-4 w-4 text-violet-300" />
      </div>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-violet-300">{component.category}</p>
      <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">{component.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400">
        <span>{component.version}</span>
        <span className="text-right">{component.downloads} downloads</span>
        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-violet-300 text-violet-300" /> {component.rating}</span>
        <span className="text-right">{component.updated}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {component.compatibility.slice(0, 3).map((item) => (
          <span key={item} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-slate-300">{item}</span>
        ))}
        <span className="rounded-full bg-violet-500/12 px-2.5 py-1 text-[11px] text-violet-200">{component.status}</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={restricted ? onRequest : onDownload} className="rounded-xl bg-violet-500 px-3 py-2 text-xs font-medium text-white hover:bg-violet-400">
          {restricted ? "Request Access" : "Download"}
        </button>
        <button onClick={onDetails} className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white">View Details</button>
      </div>
    </article>
  );
}

function ComponentDetailsDrawer({
  component,
  onClose,
  onDownload,
  onRequest,
}: {
  component: DownloadComponent;
  onClose: () => void;
  onDownload: () => void;
  onRequest: () => void;
}) {
  const Icon = component.icon;
  const tabs = ["Overview", "Installation", "Versions", "Dependencies", "Compatibility", "Documentation", "Release Notes", "Security"];

  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <aside className="ml-auto h-full w-full max-w-2xl overflow-y-auto border-l border-white/[0.08] bg-[#0d111a] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.55)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-violet-500/12 text-violet-100">
              <Icon className="h-8 w-8" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-violet-300">{component.category}</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold text-white">{component.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{component.publisher} · {component.version} · {component.size}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            ["Downloads", component.downloads],
            ["Rating", component.rating],
            ["License", component.license],
            ["Channel", component.channel],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
              <p className="text-[11px] text-slate-500">{label}</p>
              <p className="mt-2 text-sm font-medium text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={component.status === "Restricted" ? onRequest : onDownload} className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white hover:bg-violet-400">
            {component.status === "Restricted" ? "Request Access" : "Download"}
          </button>
          <button className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.06]">Open Documentation</button>
          <button className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.06]">Copy Install Command</button>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button key={tab} className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs text-slate-300 hover:border-violet-300/25 hover:text-white">{tab}</button>
          ))}
        </div>

        <section className="mt-6 space-y-5">
          <div>
            <h3 className="font-heading text-base font-semibold text-white">Overview</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{component.description}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/15 p-4">
            <div className="flex items-center justify-between gap-3">
              <code className="text-xs text-slate-300">{component.install}</code>
              <Copy className="h-4 w-4 text-slate-500" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {component.features.map((feature) => (
              <div key={feature} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                <ShieldCheck className="h-4 w-4 text-violet-300" />
                <p className="mt-3 text-sm font-medium text-white">{feature}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <h3 className="font-heading text-base font-semibold text-white">Security</h3>
            <p className="mt-2 text-xs text-slate-500">SHA256 · Signature verified · Certificate trusted</p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-black/15 px-3 py-2">
              <code className="truncate text-xs text-slate-300">{component.checksum}</code>
              <button className="text-xs text-violet-300">Copy Hash</button>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}

function DownloadModal({ component, onClose }: { component: DownloadComponent; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/65 px-4 py-10 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-auto max-w-xl rounded-3xl border border-white/[0.08] bg-[#0d111a] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.55)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-violet-300">Download package</p>
            <h2 className="mt-2 font-heading text-xl font-semibold text-white">{component.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Choose package options and review integrity information before starting the download.</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ["Version", component.version],
            ["OS", component.compatibility[0]],
            ["Architecture", component.architecture],
            ["Release Channel", component.channel],
            ["Package", component.category],
            ["Download Size", component.size],
          ].map(([label, value]) => (
            <label key={label} className="block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</span>
              <div className="mt-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-3 text-sm text-white">{value}</div>
            </label>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
          <p className="text-xs text-slate-400">Checksum</p>
          <code className="mt-2 block truncate text-xs text-slate-300">{component.checksum}</code>
        </div>
        <label className="mt-5 flex items-start gap-3 text-sm text-slate-400">
          <input type="checkbox" className="mt-1" />
          I accept the license agreement and understand this package will be verified after download.
        </label>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.05]">Cancel</button>
          <button onClick={onClose} className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white hover:bg-violet-400">Start Download</button>
        </div>
      </div>
    </div>
  );
}

function DownloadManager({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-30 w-[min(380px,calc(100vw-40px))] rounded-3xl border border-white/[0.08] bg-[#0d111a] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-sm font-semibold text-white">Downloads Manager</h3>
          <p className="mt-1 text-xs text-slate-500">Current downloads and verification status</p>
        </div>
        <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 space-y-3">
        {[
          ["AEGIS Agent", "68%", "12 MB/s · 24s remaining"],
          ["AEGIS CLI", "100%", "Verification successful"],
        ].map(([name, progress, meta]) => (
          <div key={name} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-white">{name}</span>
              <span className="text-xs text-slate-500">{progress}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-violet-400" style={{ width: progress }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>{meta}</span>
              <span className="flex gap-2 text-slate-400">
                <Pause className="h-3.5 w-3.5" />
                <Play className="h-3.5 w-3.5" />
                <RotateCcw className="h-3.5 w-3.5" />
                <FolderOpen className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EnterpriseDownloadTable({ components, onDetails }: { components: DownloadComponent[]; onDetails: (component: DownloadComponent) => void }) {
  return (
    <section className="rounded-3xl border border-white/[0.08] bg-[#0d111a]/88 p-5">
      <PanelHeader title="Enterprise Download Table" body="Search, filters, bulk actions, export, pinned columns, resize affordances, and context menus." />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr className="border-b border-white/[0.08]">
              <th className="w-10 px-3 py-3"><input type="checkbox" aria-label="Select all components" /></th>
              {["Name", "Category", "Publisher", "Version", "Platform", "License", "Downloads", "Updated", "Status", "Actions"].map((heading) => (
                <th key={heading} className="px-3 py-3 font-medium">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {components.map((component) => (
              <tr key={component.name} className="text-slate-300 hover:bg-white/[0.025]">
                <td className="px-3 py-4"><input type="checkbox" aria-label={`Select ${component.name}`} /></td>
                <td className="px-3 py-4 font-medium text-white">{component.name}</td>
                <td className="px-3 py-4">{component.category}</td>
                <td className="px-3 py-4">{component.publisher}</td>
                <td className="px-3 py-4">{component.version}</td>
                <td className="px-3 py-4">{component.compatibility.join(", ")}</td>
                <td className="px-3 py-4">{component.license}</td>
                <td className="px-3 py-4">{component.downloads}</td>
                <td className="px-3 py-4">{component.updated}</td>
                <td className="px-3 py-4"><span className="rounded-full bg-violet-500/12 px-2.5 py-1 text-xs text-violet-200">{component.status}</span></td>
                <td className="px-3 py-4"><button onClick={() => onDetails(component)} className="text-xs text-violet-300">Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InstalledComponentsPanel() {
  return (
    <section className="rounded-3xl border border-white/[0.08] bg-[#0d111a]/88 p-5">
      <PanelHeader title="Installed Components" body="Manage local installs, updates, repair actions, and launch shortcuts." />
      <div className="mt-4 space-y-3">
        {[
          ["AEGIS Client", "v1.8.3", "Up to date"],
          ["AEGIS CLI", "v0.9.4", "Update available"],
          ["Agent Runtime", "v2.4.1", "Installed"],
        ].map(([name, version, status]) => (
          <div key={name} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium text-white">{name}</h3>
                <p className="mt-1 text-xs text-slate-500">{version} · {status}</p>
              </div>
              <button className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06]">Manage</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {["Update", "Repair", "Uninstall", "Launch", "Open Folder"].map((action) => (
                <button key={action} className="rounded-lg bg-white/[0.035] px-2.5 py-1.5 text-slate-300 hover:bg-white/[0.06]">{action}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickCreateMenu({ onOpenWorkflow }: { onOpenWorkflow: (workflow: WorkflowType) => void }) {
  const actions: Array<{ label: string; icon: React.ComponentType<{ className?: string }>; workflow: WorkflowType }> = [
    { label: "API Key", icon: KeyRound, workflow: "api-key" },
    { label: "Download Request", icon: CloudDownload, workflow: "request" },
    { label: "Organization", icon: Building2, workflow: "organization" },
    { label: "Project", icon: Layers, workflow: "project" },
    { label: "Agent", icon: Bot, workflow: "agent" },
    { label: "Support Ticket", icon: Headphones, workflow: "support" },
  ];

  return (
    <div className="absolute right-0 top-14 z-30 w-64 rounded-2xl border border-white/[0.08] bg-[#0d111a] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
      <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">Quick create</p>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button key={action.label} onClick={() => onOpenWorkflow(action.workflow)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-white/[0.055] hover:text-white">
            <Icon className="h-4 w-4 text-violet-300" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

function CommandPalette({
  query,
  setQuery,
  onClose,
  onSelectView,
  onOpenWorkflow,
}: {
  query: string;
  setQuery: (query: string) => void;
  onClose: () => void;
  onSelectView: (view: DashboardView) => void;
  onOpenWorkflow: (workflow: WorkflowType) => void;
}) {
  const pages: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    ...requestNav,
    ...apiNav,
    ...subscriptionNav,
    ...accountNav,
    ...supportNav,
  ];
  const filtered = pages.filter((page) => page.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-40 bg-black/60 px-4 py-20 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/[0.08] bg-[#0d111a] p-3 shadow-[0_24px_100px_rgba(0,0,0,0.55)]" onClick={(event) => event.stopPropagation()}>
        <label className="flex items-center gap-3 border-b border-white/[0.08] px-3 py-3">
          <Command className="h-5 w-5 text-violet-300" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" placeholder="Search pages, downloads, API keys, documentation, commands..." />
          <button onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-white/[0.06] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </label>
        <div className="max-h-[420px] overflow-y-auto py-2">
          <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">Pages</p>
          {filtered.map((page) => {
            const Icon = page.icon;
            return (
              <button key={`${page.id}-${page.label}`} onClick={() => onSelectView(page.id)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-slate-300 hover:bg-white/[0.055] hover:text-white">
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-violet-300" />
                  {page.label}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-600" />
              </button>
            );
          })}
          <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">Commands</p>
          {[
            { label: "Generate API Key", workflow: "api-key" as WorkflowType, icon: KeyRound },
            { label: "Create Download Request", workflow: "request" as WorkflowType, icon: CloudDownload },
            { label: "Open Support Ticket", workflow: "support" as WorkflowType, icon: Headphones },
          ].map((command) => {
            const Icon = command.icon;
            return (
              <button key={command.label} onClick={() => onOpenWorkflow(command.workflow)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-300 hover:bg-white/[0.055] hover:text-white">
                <Icon className="h-4 w-4 text-violet-300" />
                {command.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WorkflowModal({ workflow, onClose }: { workflow: WorkflowType; onClose: () => void }) {
  const copy: Record<WorkflowType, { title: string; description: string; fields: string[]; primary: string; icon: React.ComponentType<{ className?: string }> }> = {
    "api-key": {
      title: "Generate API Key",
      description: "Choose environment, scopes, expiration, and restrictions before creating a credential.",
      fields: ["Key name", "Environment", "Permissions", "Expiration", "IP restrictions"],
      primary: "Generate key",
      icon: KeyRound,
    },
    download: {
      title: "Download Component",
      description: "Select version, platform, architecture, license, and integrity verification options.",
      fields: ["Component", "Version", "Platform", "Architecture", "Install command"],
      primary: "Prepare download",
      icon: Download,
    },
    request: {
      title: "Create Request",
      description: "Submit a request with organization context, approval reason, attachments, and priority.",
      fields: ["Request type", "Organization", "Justification", "Priority", "Attachments"],
      primary: "Submit request",
      icon: CircleEllipsis,
    },
    upgrade: {
      title: "Upgrade Plan",
      description: "Compare plans, review limits, select billing cycle, and confirm payment details.",
      fields: ["Plan", "Billing cycle", "Seats", "Payment method", "Tax details"],
      primary: "Continue",
      icon: WalletCards,
    },
    support: {
      title: "Create Support Ticket",
      description: "Route issues to the right team with logs, screenshots, severity, and contact preferences.",
      fields: ["Subject", "Category", "Severity", "Description", "Attachments"],
      primary: "Create ticket",
      icon: Headphones,
    },
    organization: {
      title: "Create Organization",
      description: "Set up a team workspace with members, roles, billing, and security defaults.",
      fields: ["Organization name", "Domain", "Role", "Members", "Workspace defaults"],
      primary: "Create organization",
      icon: Building2,
    },
    project: {
      title: "Create Project",
      description: "Create a project for downloads, API keys, models, requests, and deployments.",
      fields: ["Project name", "Workspace", "Environment", "Owner", "Template"],
      primary: "Create project",
      icon: Layers,
    },
    agent: {
      title: "Create Agent",
      description: "Configure an intelligent agent with runtime, tools, permissions, and deployment target.",
      fields: ["Agent name", "Runtime", "Tools", "Permissions", "Deployment"],
      primary: "Create agent",
      icon: Bot,
    },
    danger: {
      title: "Security Confirmation",
      description: "Review sensitive security changes before they affect sessions, tokens, or credentials.",
      fields: ["Action", "Verification", "Recovery option", "Audit reason", "Confirmation"],
      primary: "Confirm securely",
      icon: Shield,
    },
  };
  const detail = copy[workflow];
  const Icon = detail.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 px-4 py-10 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-auto max-w-xl rounded-3xl border border-white/[0.08] bg-[#0d111a] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.55)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/10 text-violet-200">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-semibold text-white">{detail.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{detail.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 space-y-4">
          {detail.fields.map((field) => (
            <label key={field} className="block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{field}</span>
              <input className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-300/60" placeholder={field} />
            </label>
          ))}
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.05]">Cancel</button>
          <button onClick={onClose} className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white hover:bg-violet-400">{detail.primary}</button>
        </div>
      </div>
    </div>
  );
}

function MarketplaceCenter({ onOpenWorkflow }: { onOpenWorkflow: (workflow: WorkflowType) => void }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [installProduct, setInstallProduct] = useState<MarketplaceProduct | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);

  const categories = ["All", "Official", "Verified", "Partner", "Community", "Agents", "Models", "RAG", "Security", "Edge", "Templates", "Developer"];
  const visibleProducts =
    activeCategory === "All"
      ? marketplaceProducts
      : marketplaceProducts.filter((product) =>
          [product.status, product.category, product.publisher, ...product.tags, ...product.compatibility].some((value) =>
            value.toLowerCase().includes(activeCategory.toLowerCase()),
          ),
        );
  const stats = [
    ["Verified Products", marketplaceProducts.filter((product) => product.status === "Verified").length.toString(), ShieldCheck],
    ["Official Products", marketplaceProducts.filter((product) => product.status === "Official").length.toString(), Sparkles],
    ["Partners", marketplaceProducts.filter((product) => product.status === "Partner").length.toString(), Building2],
    ["Downloads", "71.1k", Download],
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/[0.08] bg-[#0d111a]/88 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-violet-300">Enterprise AI Marketplace</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-white">AEGIS Marketplace</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Discover enterprise AI components, verified solutions, developer tools, plugins, runtimes, datasets, and deployment packages.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setPublishOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-400">
              <Plus className="h-4 w-4" />
              Publish Listing
            </button>
            <button onClick={() => onOpenWorkflow("organization")} className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white">
              <Building2 className="h-4 w-4" />
              Become a Partner
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {stats.map(([label, value, Icon]) => {
            const TypedIcon = Icon as React.ComponentType<{ className?: string }>;
            return (
              <article key={label as string} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                <div className="flex items-center justify-between">
                  <TypedIcon className="h-5 w-5 text-violet-300" />
                  <span className="text-[11px] text-emerald-300">+8% monthly</span>
                </div>
                <p className="mt-4 text-3xl font-semibold text-white">{value as string}</p>
                <p className="mt-1 text-xs text-slate-400">{label as string}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3">
          <label className="flex h-14 items-center gap-3 rounded-xl bg-black/10 px-4">
            <Search className="h-5 w-5 text-slate-500" />
            <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" placeholder="Search AI components, plugins, runtimes, models..." />
            <span className="rounded-lg border border-white/[0.08] px-2 py-1 text-[11px] text-slate-500">Ctrl K</span>
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  activeCategory === category
                    ? "border-violet-300/30 bg-violet-500/15 text-violet-100"
                    : "border-white/[0.08] bg-white/[0.025] text-slate-300 hover:border-violet-300/25 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
            <button onClick={() => setFiltersOpen((value) => !value)} className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs text-slate-300 hover:text-white">
              Filter Panel
            </button>
          </div>
          {filtersOpen && (
            <div className="mt-4 grid gap-3 rounded-2xl border border-white/[0.08] bg-black/10 p-4 md:grid-cols-2 xl:grid-cols-4">
              {["Publisher", "Verified", "Free/Paid", "Rating", "Compatibility", "License", "Platform", "Recently Updated"].map((filter) => (
                <label key={filter} className="block">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{filter}</span>
                  <div className="mt-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs text-slate-300">Any {filter}</div>
                </label>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <PanelHeader title="Featured Collections" body="Curated bundles for teams, industries, and deployment goals." linkLabel="View all collections" />
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {[
            ["Best Privacy AI Tools", "Private agents, local runtimes, and compliance helpers.", Shield],
            ["Enterprise Starter Pack", "Official components for production workspace launch.", PackageOpen],
            ["Edge AI Bundle", "Runtime, templates, and monitoring for edge deployments.", Cpu],
          ].map(([title, body, Icon]) => {
            const TypedIcon = Icon as React.ComponentType<{ className?: string }>;
            return (
              <article key={title as string} className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-500/12 via-white/[0.035] to-white/[0.02] p-5">
                <TypedIcon className="h-7 w-7 text-violet-200" />
                <h3 className="mt-5 font-heading text-lg font-semibold text-white">{title as string}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{body as string}</p>
                <button className="mt-5 rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white">Explore collection</button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-white/[0.08] bg-[#0d111a]/88 p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <PanelHeader title="Product Grid" body={`${visibleProducts.length} marketplace products match the current discovery context.`} />
              <div className="flex flex-wrap gap-2">
                {["Trending", "Newest", "Most Downloaded", "AI Recommended", "Recently Updated"].map((sort) => (
                  <button key={sort} className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06]">{sort}</button>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <MarketplaceProductCard
                  key={product.name}
                  product={product}
                  onDetails={() => setSelectedProduct(product)}
                  onInstall={() => setInstallProduct(product)}
                />
              ))}
            </div>
          </section>

          <MarketplaceEnterpriseTable products={marketplaceProducts} onDetails={setSelectedProduct} />
        </div>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-violet-300/20 bg-violet-500/[0.08] p-5">
            <PanelHeader title="AI Recommendations" body="Personalized suggestions based on workspace downloads, usage, industry, and recent activity." />
            <div className="mt-4 space-y-3">
              {marketplaceProducts.slice(0, 3).map((product) => (
                <button key={product.name} onClick={() => setSelectedProduct(product)} className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 text-left hover:bg-white/[0.05]">
                  <product.icon className="h-5 w-5 text-violet-300" />
                  <span>
                    <span className="block text-sm font-medium text-white">{product.name}</span>
                    <span className="block text-xs text-slate-500">{product.category} · {product.rating} rating</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/[0.08] bg-[#0d111a]/88 p-5">
            <PanelHeader title="Developer Dashboard" body="Publisher analytics, release management, revenue, reviews, support tickets, and crash reports." />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatPill label="Products" value="6" icon={PackageOpen} />
              <StatPill label="Followers" value="1.8k" icon={User} />
              <StatPill label="Revenue" value="$12.4k" icon={WalletCards} />
              <StatPill label="Reviews" value="962" icon={Star} />
            </div>
          </section>
        </aside>
      </section>

      {selectedProduct && (
        <MarketplaceProductDrawer
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onInstall={() => setInstallProduct(selectedProduct)}
          onPurchase={() => onOpenWorkflow("upgrade")}
        />
      )}
      {installProduct && <MarketplaceInstallModal product={installProduct} onClose={() => setInstallProduct(null)} />}
      {publishOpen && <PublishListingWizard onClose={() => setPublishOpen(false)} />}
    </div>
  );
}

function MarketplaceProductCard({
  product,
  onDetails,
  onInstall,
}: {
  product: MarketplaceProduct;
  onDetails: () => void;
  onInstall: () => void;
}) {
  const Icon = product.icon;
  return (
    <article className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all hover:-translate-y-0.5 hover:border-violet-300/25 hover:bg-white/[0.045]">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-violet-500/10 text-violet-200">
          <Icon className="h-6 w-6" />
        </span>
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
          <button className="rounded-lg border border-white/[0.08] p-2 text-slate-400 hover:text-white"><Bookmark className="h-3.5 w-3.5" /></button>
          <button className="rounded-lg border border-white/[0.08] p-2 text-slate-400 hover:text-white"><Share2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <h3 className="font-heading text-base font-semibold text-white">{product.name}</h3>
        <ShieldCheck className="h-4 w-4 text-violet-300" />
      </div>
      <p className="mt-1 text-xs text-slate-500">{product.publisher} · {product.status}</p>
      <p className="mt-3 min-h-16 text-sm leading-6 text-slate-400">{product.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400">
        <span>{product.version}</span>
        <span className="text-right">{product.downloads} downloads</span>
        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-violet-300 text-violet-300" /> {product.rating} ({product.reviews})</span>
        <span className="text-right">{product.price}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {product.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-slate-300">{tag}</span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={onInstall} className="rounded-xl bg-violet-500 px-3 py-2 text-xs font-medium text-white hover:bg-violet-400">Install</button>
        <button onClick={onDetails} className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white">View Details</button>
        <button className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white">Compare</button>
      </div>
    </article>
  );
}

function MarketplaceProductDrawer({
  product,
  onClose,
  onInstall,
  onPurchase,
}: {
  product: MarketplaceProduct;
  onClose: () => void;
  onInstall: () => void;
  onPurchase: () => void;
}) {
  const Icon = product.icon;
  const tabs = ["Overview", "Features", "Installation", "Versions", "Documentation", "Dependencies", "Reviews", "Security", "Roadmap", "Support"];
  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <aside className="ml-auto h-full w-full max-w-2xl overflow-y-auto border-l border-white/[0.08] bg-[#0d111a] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.55)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-violet-500/12 text-violet-100">
              <Icon className="h-8 w-8" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-violet-300">{product.category}</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold text-white">{product.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{product.publisher} · {product.version} · {product.price}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            ["Downloads", product.downloads],
            ["Rating", product.rating],
            ["License", product.license],
            ["Status", product.status],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
              <p className="text-[11px] text-slate-500">{label}</p>
              <p className="mt-2 text-sm font-medium text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={onInstall} className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white hover:bg-violet-400">Install</button>
          <button onClick={onPurchase} className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.06]">Purchase</button>
          <button className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.06]">Add to Workspace</button>
          <button className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.06]">Report</button>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button key={tab} className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs text-slate-300 hover:border-violet-300/25 hover:text-white">{tab}</button>
          ))}
        </div>

        <section className="mt-6 space-y-5">
          <div>
            <h3 className="font-heading text-base font-semibold text-white">Overview</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{product.description}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/15 p-4">
            <div className="flex items-center justify-between gap-3">
              <code className="text-xs text-slate-300">{product.install}</code>
              <Copy className="h-4 w-4 text-slate-500" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {product.features.map((feature) => (
              <div key={feature} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                <ShieldCheck className="h-4 w-4 text-violet-300" />
                <p className="mt-3 text-sm font-medium text-white">{feature}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <h3 className="font-heading text-base font-semibold text-white">Security & Compliance</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">{product.security}. Digital signature, publisher verification, malware scan, dependency scan, license validation, privacy rating, and compliance metadata are shown here.</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <h3 className="font-heading text-base font-semibold text-white">Reviews</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">Overall rating {product.rating} from {product.reviews} verified developer and organization reviews. Pros, cons, use cases, replies, and reports are supported.</p>
          </div>
        </section>
      </aside>
    </div>
  );
}

function MarketplaceInstallModal({ product, onClose }: { product: MarketplaceProduct; onClose: () => void }) {
  const steps = ["Choose Workspace", "Choose Version", "Review Dependencies", "Permissions", "Install", "Verification"];
  return (
    <div className="fixed inset-0 z-50 bg-black/65 px-4 py-10 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/[0.08] bg-[#0d111a] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.55)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-violet-300">Installation Flow</p>
            <h2 className="mt-2 font-heading text-xl font-semibold text-white">Install {product.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Choose workspace, version, dependencies, permissions, and verification settings before install.</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
              <div className={`h-1.5 rounded-full ${index === 0 ? "bg-violet-400" : "bg-white/[0.08]"}`} />
              <p className="mt-3 text-xs font-medium text-white">{step}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {["Workspace", "Version", "Environment", "Permissions", "Dependencies", "License Assignment"].map((field) => (
            <label key={field} className="block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{field}</span>
              <div className="mt-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-3 text-sm text-white">{field === "Version" ? product.version : `Select ${field}`}</div>
            </label>
          ))}
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.05]">Cancel</button>
          <button onClick={onClose} className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white hover:bg-violet-400">Install</button>
        </div>
      </div>
    </div>
  );
}

function PublishListingWizard({ onClose }: { onClose: () => void }) {
  const steps = ["Product Information", "Description", "Media", "Pricing", "Compatibility", "Documentation", "Security", "Review", "Submit"];
  return (
    <div className="fixed inset-0 z-50 bg-black/65 px-4 py-8 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/[0.08] bg-[#0d111a] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.55)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-violet-300">Publish Listing</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-white">Create a Marketplace listing</h2>
            <p className="mt-2 text-sm text-slate-400">A professional publisher workflow for product details, media, pricing, compatibility, documentation, security, and review.</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
              <div className={`h-1.5 rounded-full ${index === 0 ? "bg-violet-400" : "bg-white/[0.08]"}`} />
              <p className="mt-3 text-xs font-medium text-white">{step}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {["Product Name", "Publisher", "Category", "Pricing Model", "Compatibility", "License", "Documentation URL", "Security Notes"].map((field) => (
            <label key={field} className="block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{field}</span>
              <input className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-white outline-none focus:border-violet-300/60" placeholder={field} />
            </label>
          ))}
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.05]">Cancel</button>
          <button className="rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.05]">Save Draft</button>
          <button onClick={onClose} className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white hover:bg-violet-400">Submit for Review</button>
        </div>
      </div>
    </div>
  );
}

function MarketplaceEnterpriseTable({ products, onDetails }: { products: MarketplaceProduct[]; onDetails: (product: MarketplaceProduct) => void }) {
  return (
    <section className="rounded-3xl border border-white/[0.08] bg-[#0d111a]/88 p-5">
      <PanelHeader title="Marketplace Enterprise Table" body="Sorting, filtering, export, bulk actions, search, pagination, and resizable columns." />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr className="border-b border-white/[0.08]">
              <th className="w-10 px-3 py-3"><input type="checkbox" aria-label="Select all marketplace products" /></th>
              {["Product", "Publisher", "Category", "Downloads", "Version", "License", "Price", "Compatibility", "Rating", "Status", "Updated", "Actions"].map((heading) => (
                <th key={heading} className="px-3 py-3 font-medium">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {products.map((product) => (
              <tr key={product.name} className="text-slate-300 hover:bg-white/[0.025]">
                <td className="px-3 py-4"><input type="checkbox" aria-label={`Select ${product.name}`} /></td>
                <td className="px-3 py-4 font-medium text-white">{product.name}</td>
                <td className="px-3 py-4">{product.publisher}</td>
                <td className="px-3 py-4">{product.category}</td>
                <td className="px-3 py-4">{product.downloads}</td>
                <td className="px-3 py-4">{product.version}</td>
                <td className="px-3 py-4">{product.license}</td>
                <td className="px-3 py-4">{product.price}</td>
                <td className="px-3 py-4">{product.compatibility.slice(0, 2).join(", ")}</td>
                <td className="px-3 py-4">{product.rating}</td>
                <td className="px-3 py-4"><span className="rounded-full bg-violet-500/12 px-2.5 py-1 text-xs text-violet-200">{product.status}</span></td>
                <td className="px-3 py-4">{product.updated}</td>
                <td className="px-3 py-4"><button onClick={() => onDetails(product)} className="text-xs text-violet-300">Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ActionCard({
  title,
  body,
  icon: Icon,
  action,
  onAction,
}: {
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
  action: string;
  onAction?: () => void;
}) {
  return (
    <article className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition-colors hover:bg-white/[0.045]">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-violet-500/10 text-violet-200">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-heading text-sm font-semibold text-white">{title}</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">{body}</p>
          <button onClick={onAction} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-400">
            {action}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function PanelHeader({ title, body, linkLabel }: { title: string; body?: string; linkLabel?: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="font-heading text-base font-semibold text-white">{title}</h2>
        {body && <p className="mt-2 text-xs text-slate-400">{body}</p>}
      </div>
      {linkLabel && (
        <button className="inline-flex items-center gap-2 text-xs font-medium text-violet-300 hover:text-violet-200">
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function StatPill({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Icon className="h-4 w-4 text-violet-300" />
        {label}
      </div>
      <p className="mt-3 font-mono text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function RegisterNodeForm({
  nodeName,
  nodeLocation,
  gpuSpecs,
  regLoading,
  regError,
  regSuccess,
  setNodeName,
  setNodeLocation,
  setGpuSpecs,
  onSubmit,
}: {
  nodeName: string;
  nodeLocation: string;
  gpuSpecs: string;
  regLoading: boolean;
  regError: string;
  regSuccess: string;
  setNodeName: (value: string) => void;
  setNodeLocation: (value: string) => void;
  setGpuSpecs: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/88 p-5">
      <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-white">
        <PlusCircle className="h-5 w-5 text-violet-300" />
        Register New Compute Node
      </h2>
      <div className="mt-5 space-y-4">
        <DashboardInput label="Node Identifier Name" value={nodeName} onChange={setNodeName} placeholder="e.g. Operator-US-Node-1" />
        <DashboardInput label="Location City / Country" value={nodeLocation} onChange={setNodeLocation} placeholder="e.g. United States (Boston)" />
        <DashboardInput label="GPU / Hardware Specifications" value={gpuSpecs} onChange={setGpuSpecs} placeholder="e.g. RTX 4090 | LLM Inference" />
      </div>
      <button type="submit" disabled={regLoading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-xs font-medium text-white transition-colors hover:bg-violet-400 disabled:bg-slate-700">
        <Plus className="h-4 w-4" />
        {regLoading ? "Submitting..." : "Submit Registration Request"}
      </button>
      {regError && <p className="mt-3 text-xs text-red-300">{regError}</p>}
      {regSuccess && <p className="mt-3 text-xs text-emerald-300">{regSuccess}</p>}
    </form>
  );
}

function PasswordForm({
  currentPassword,
  newPassword,
  confirmPassword,
  passLoading,
  passError,
  passSuccess,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  onSubmit,
}: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passLoading: boolean;
  passError: string;
  passSuccess: string;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-white/[0.08] bg-[#0d111a]/88 p-5">
      <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-white">
        <KeyRound className="h-5 w-5 text-violet-300" />
        Change Operator Password
      </h2>
      <div className="mt-5 space-y-4">
        <DashboardInput label="Current Password" value={currentPassword} onChange={setCurrentPassword} placeholder="********" type="password" />
        <DashboardInput label="New Password" value={newPassword} onChange={setNewPassword} placeholder="Min 6 characters" type="password" />
        <DashboardInput label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="********" type="password" />
      </div>
      <button type="submit" disabled={passLoading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-xs font-medium text-white transition-colors hover:bg-violet-400 disabled:bg-slate-700">
        <Lock className="h-4 w-4" />
        {passLoading ? "Saving..." : "Update Password"}
      </button>
      {passError && <p className="mt-3 text-xs text-red-300">{passError}</p>}
      {passSuccess && <p className="mt-3 text-xs text-emerald-300">{passSuccess}</p>}
    </form>
  );
}

function DashboardInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-3 text-xs text-white outline-none transition-colors placeholder:text-slate-600 focus:border-violet-300/60"
        required
      />
    </label>
  );
}
