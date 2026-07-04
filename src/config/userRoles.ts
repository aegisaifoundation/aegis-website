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
  | "compliance_counsel"
  // Executive Leadership
  | "ceo" | "cto" | "coo" | "cfo" | "cmo" | "chro" | "ciso"
  // Technology Division
  | "chief_ai_officer" | "ai_researcher" | "ml_engineer" | "federated_learning_engineer" | "llm_engineer" | "data_scientist" | "mlops_engineer" | "research_intern"
  | "vp_engineering" | "engineering_manager" | "backend_developer" | "frontend_developer" | "fullstack_developer" | "mobile_developer" | "devops_engineer" | "qa_engineer"
  | "cloud_architect" | "sre" | "kubernetes_engineer" | "network_engineer" | "database_administrator"
  // Product Division
  | "cpo" | "product_manager" | "product_owner" | "business_analyst" | "ux_researcher"
  // Cybersecurity Division
  | "security_architect" | "penetration_tester" | "soc_analyst" | "compliance_officer" | "privacy_officer"
  // Sales & Business Development
  | "cro" | "enterprise_sales_manager" | "solution_architect" | "business_development_manager" | "account_manager"
  // Marketing Division
  | "marketing_director" | "digital_marketing_specialist" | "content_writer" | "brand_manager" | "community_manager"
  // Operations Division
  | "operations_manager" | "program_manager" | "project_manager" | "vendor_management" | "procurement_team"
  // Finance Division
  | "finance_manager" | "accountant" | "financial_analyst" | "payroll_team" | "investor_relations"
  // Human Resources Division
  | "hr_manager" | "recruiter" | "talent_acquisition_specialist" | "learning_development_team" | "employee_relations_team"
  // Legal & Compliance Division
  | "general_counsel" | "legal_officer" | "contract_manager" | "compliance_manager" | "data_protection_officer"
  // New workflow roles
  | "researcher" | "research_manager" | "system_engineer";

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
    "researcher",
    "research_director",
    "research_manager",
    "devrel_manager",
    "node_auditor",
    "billing_manager",
    "governance_delegate",
    "security_officer",
    "co_admin",
    "infrastructure_operator",
    "admin",
    "super_admin",
    // Executive Leadership
    "ceo", "cto", "coo", "cfo", "cmo", "chro", "ciso",
    // Tech & AI Division
    "chief_ai_officer", "ai_researcher", "ml_engineer", "federated_learning_engineer", "llm_engineer", "data_scientist", "mlops_engineer", "research_intern",
    "vp_engineering", "engineering_manager", "backend_developer", "frontend_developer", "fullstack_developer", "mobile_developer", "devops_engineer", "qa_engineer",
    "cloud_architect", "sre", "kubernetes_engineer", "network_engineer", "database_administrator", "system_engineer",
    // Product Division
    "cpo", "product_manager", "product_owner", "business_analyst", "ux_researcher",
    // Security Division
    "security_architect", "penetration_tester", "soc_analyst", "compliance_officer", "privacy_officer",
    // Sales Division
    "cro", "enterprise_sales_manager", "solution_architect", "business_development_manager", "account_manager",
    // Marketing Division
    "marketing_director", "digital_marketing_specialist", "content_writer", "brand_manager", "community_manager",
    // Operations & Finance
    "operations_manager", "program_manager", "project_manager", "vendor_management", "procurement_team",
    "finance_manager", "accountant", "financial_analyst", "payroll_team", "investor_relations",
    // HR & Legal
    "hr_manager", "recruiter", "talent_acquisition_specialist", "learning_development_team", "employee_relations_team",
    "general_counsel", "legal_officer", "contract_manager", "compliance_manager", "data_protection_officer"
  ];
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }

  const userIndex = rolesOrder.indexOf(userRole);
  const requiredIndex = rolesOrder.indexOf(requiredRole);
  
  return userIndex >= requiredIndex;
}

export const getUserDepartment = (role: string): string => {
  const techRoles = [
    'vp_engineering', 'engineering_manager', 'ml_engineer', 
    'federated_learning_engineer', 'llm_engineer', 'data_scientist', 
    'mlops_engineer', 'ai_researcher', 'research_intern', 'backend_developer', 
    'frontend_developer', 'fullstack_developer', 'mobile_developer', 
    'devops_engineer', 'qa_engineer', 'cloud_architect', 'sre', 
    'kubernetes_engineer', 'network_engineer', 'database_administrator', 
    'system_engineer', 'infrastructure_operator', 'node_auditor', 'cto', 
    'chief_ai_officer', 'researcher'
  ];
  const productRoles = ['cpo', 'product_manager', 'product_owner', 'business_analyst', 'ux_researcher'];
  const secRoles = ['ciso', 'security_architect', 'penetration_tester', 'soc_analyst', 'compliance_officer', 'privacy_officer', 'security_officer'];
  const mktRoles = ['cro', 'cmo', 'enterprise_sales_manager', 'solution_architect', 'business_development_manager', 'account_manager', 'marketing_director', 'digital_marketing_specialist', 'content_writer', 'brand_manager', 'community_manager', 'devrel_manager'];
  const opsRoles = ['coo', 'cfo', 'operations_manager', 'program_manager', 'project_manager', 'vendor_management', 'procurement_team', 'finance_manager', 'accountant', 'financial_analyst', 'payroll_team', 'investor_relations', 'billing_manager'];
  const hrRoles = ['chro', 'hr_manager', 'recruiter', 'talent_acquisition_specialist', 'learning_development_team', 'employee_relations_team', 'general_counsel', 'legal_officer', 'contract_manager', 'compliance_manager', 'data_protection_officer', 'compliance_counsel'];
  const resRoles = ['research_director', 'research_manager', 'data_curator'];

  if (techRoles.includes(role)) return 'Technology & AI';
  if (productRoles.includes(role)) return 'Product & UX';
  if (secRoles.includes(role)) return 'Cybersecurity & SOC';
  if (mktRoles.includes(role)) return 'Sales & Marketing';
  if (opsRoles.includes(role)) return 'Operations & Finance';
  if (hrRoles.includes(role)) return 'HR & Legal';
  if (resRoles.includes(role)) return 'Research';
  return 'Executive';
};
