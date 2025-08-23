"use client"

import { AuthWrapper } from "@/components/auth-wrapper"
import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Contacts } from "@/components/contacts"

export default function ContactsPage() {
  return (
    <AuthWrapper>
      <AppLayout>
        <PageHeader title="Contactos" description="Administra tu lista de contactos y suscriptores" />
        <Contacts />
      </AppLayout>
    </AuthWrapper>
  )
}
