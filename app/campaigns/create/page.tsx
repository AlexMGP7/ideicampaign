"use client"

import { AuthWrapper } from "@/components/auth-wrapper"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { CampaignForm } from "@/components/campaign-form"

export default function CreateCampaignPage() {
  return (
    <AuthWrapper>
      <AppLayout>
        <PageHeader title="Nueva Campaña" description="Crea y configura una nueva campaña de email marketing" />
        <CampaignForm />
      </AppLayout>
    </AuthWrapper>
  )
}
