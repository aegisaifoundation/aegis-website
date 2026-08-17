"use client";

import { useDashboard } from "../DashboardContext";
import { sectionCatalog } from "../sectionCatalog";
import SectionPage from "../SectionPage";

export default function BillingPage() {
  const { openWorkflow, userRequests } = useDashboard();
  const section = sectionCatalog.billing;

  return (
    <SectionPage 
      section={section} 
      onOpenWorkflow={openWorkflow} 
      userRequests={userRequests} 
    />
  );
}
