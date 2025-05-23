
import React from 'react';
import { Shield } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { Link } from 'react-router-dom';

export function AdminNavItem() {
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return null;
  }

  return (
    <Link 
      to="/admin" 
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <Shield className="h-5 w-5 text-gray-600" />
      <div>
        <h4 className="font-medium text-gray-900">Admin</h4>
        <p className="text-sm text-gray-600">Painel administrativo</p>
      </div>
    </Link>
  );
}
