
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface AdminContextType {
  isAdmin: boolean;
  adminLevel: 'none' | 'support' | 'admin' | 'super';
  checkAdminStatus: () => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Lista de emails de administradores
const ADMIN_EMAILS = [
  'admin@observatorio.com',
  'suporte@observatorio.com',
  'contato@observatorio.com',
  'admin@observatoriopsicologico.com',
  'suporte@observatoriopsicologico.com'
];

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLevel, setAdminLevel] = useState<'none' | 'support' | 'admin' | 'super'>('none');
  const { user, isAuthenticated } = useAuth();

  const checkAdminStatus = async (): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      setIsAdmin(false);
      setAdminLevel('none');
      return false;
    }

    // Verificar se o email está na lista de administradores
    const userEmail = user.email || '';
    const isUserAdmin = ADMIN_EMAILS.includes(userEmail);
    
    if (isUserAdmin) {
      setIsAdmin(true);
      // Definir nível baseado no email
      if (userEmail.includes('admin@')) {
        setAdminLevel('super');
      } else if (userEmail.includes('suporte@')) {
        setAdminLevel('support');
      } else {
        setAdminLevel('admin');
      }
    } else {
      setIsAdmin(false);
      setAdminLevel('none');
    }

    return isUserAdmin;
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user, isAuthenticated]);

  return (
    <AdminContext.Provider value={{
      isAdmin,
      adminLevel,
      checkAdminStatus
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin deve ser usado dentro de um AdminProvider');
  }
  return context;
}
