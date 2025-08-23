"use client"

import { AuthWrapper } from "@/components/auth-wrapper"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { SendCampaign } from "@/components/view-campaign"

export default function SendCampaignPage() {
  return (
    <AuthWrapper>
      <AppLayout>
        <PageHeader title="Ver Envío" description="Revisa y envía tus campañas de email marketing" />
        <SendCampaign />
      </AppLayout>
    </AuthWrapper>
  )
}
