
import React from 'react';
import { SidebarNavItem } from '@/components/SidebarNavItem';
import { Shield } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

export function AdminNavItem() {
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return null;
  }

  return (
    <SidebarNavItem
      to="/admin"
      icon={Shield}
      title="Admin"
      description="Painel administrativo"
    />
  );
}
