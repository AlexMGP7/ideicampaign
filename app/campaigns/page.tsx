"use client"

import { AuthWrapper } from "@/components/auth-wrapper"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { CampaignsList } from "@/components/campaigns-list"

export default function CampaignsPage() {
  return (
    <AuthWrapper>
      <AppLayout>
        <PageHeader title="Campañas" description="Gestiona todas tus campañas de email marketing" />
        <CampaignsList />
      </AppLayout>
    </AuthWrapper>
  )
}
