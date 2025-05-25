
import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { AdminMasterDashboard } from '@/components/admin/AdminMasterDashboard';
import { AdminRoute } from '@/components/AdminRoute';

const AdminMaster = () => {
  return (
    <AdminRoute requiredLevel="super">
      <AdminMasterDashboard />
    </AdminRoute>
  );
};

export default AdminMaster;
