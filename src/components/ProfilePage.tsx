
import React from 'react';
import { ProfileSettings } from './ProfileSettings';
import { PageLayout } from '@/components/layout/PageLayout';
import { Badge } from "@/components/ui/badge";

export function ProfilePage() {
  const headerActions = (
    <Badge className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
      👤 Configurações do Perfil
    </Badge>
  );

  return (
    <PageLayout
      title="Meu Perfil"
      description="Gerencie suas informações pessoais e preferências"
      showBackButton={true}
      headerActions={headerActions}
    >
      <ProfileSettings />
    </PageLayout>
  );
}
