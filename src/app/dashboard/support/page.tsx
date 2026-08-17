"use client";

import { useDashboard } from "../DashboardContext";
import { sectionCatalog } from "../sectionCatalog";
import SectionPage from "../SectionPage";

export default function SupportPage() {
  const { openWorkflow, userRequests } = useDashboard();
  const section = sectionCatalog.support;

  return (
    <SectionPage 
      section={section} 
      onOpenWorkflow={openWorkflow} 
      userRequests={userRequests} 
    />
  );
}
