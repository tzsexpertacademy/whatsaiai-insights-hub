
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

// Função para verificar se é um email admin temporário
const isTemporaryAdminEmail = (email: string): boolean => {
  return email.startsWith('admin.temp.') && email.endsWith('@observatorio.com');
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLevel, setAdminLevel] = useState<'none' | 'support' | 'admin' | 'super'>('none');
  const { user, isAuthenticated } = useAuth();

  const checkAdminStatus = async (): Promise<boolean> => {
    console.log('🔍 Verificando status admin:', { isAuthenticated, user: user ? { id: user.id, email: user.email } : null });
    
    if (!isAuthenticated || !user) {
      console.log('❌ Usuário não autenticado ou sem dados');
      setIsAdmin(false);
      setAdminLevel('none');
      return false;
    }

    const userEmail = user.email || '';
    console.log('📧 Email do usuário:', userEmail);
    
    // Verificar se é admin permanente ou temporário
    const isPermanentAdmin = ADMIN_EMAILS.includes(userEmail);
    const isTempAdmin = isTemporaryAdminEmail(userEmail);
    const isUserAdmin = isPermanentAdmin || isTempAdmin;
    
    console.log('🔐 Verificação admin:', {
      isPermanentAdmin,
      isTempAdmin,
      isUserAdmin,
      userEmail
    });
    
    if (isUserAdmin) {
      setIsAdmin(true);
      
      // Definir nível baseado no email
      if (userEmail.includes('admin@') || isTempAdmin) {
        setAdminLevel('super');
        console.log('✅ Admin super detectado');
      } else if (userEmail.includes('suporte@')) {
        setAdminLevel('support');
        console.log('✅ Admin suporte detectado');
      } else {
        setAdminLevel('admin');
        console.log('✅ Admin padrão detectado');
      }
    } else {
      console.log('❌ Usuário não é admin');
      setIsAdmin(false);
      setAdminLevel('none');
    }

    return isUserAdmin;
  };

  useEffect(() => {
    console.log('🔄 AdminContext - Verificando status admin devido a mudança no usuário');
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
