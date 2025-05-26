
import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredLevel?: 'support' | 'admin' | 'super';
}

export function AdminRoute({ children, requiredLevel = 'admin' }: AdminRouteProps) {
  const { isAdmin, adminLevel } = useAdmin();
  const { user } = useAuth();

  console.log('🛡️ AdminRoute - Verificação de acesso:', {
    isAdmin,
    adminLevel,
    requiredLevel,
    userEmail: user?.email
  });

  if (!isAdmin) {
    console.log('❌ AdminRoute - Acesso negado: usuário não é admin');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar esta área administrativa.
            </p>
            <p className="text-sm text-gray-500 mb-2">
              Email atual: {user?.email || 'Não identificado'}
            </p>
            <p className="text-sm text-gray-500">
              Entre em contato com o administrador do sistema se precisar de acesso.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar nível de acesso
  const levelHierarchy = { support: 1, admin: 2, super: 3 };
  const userLevel = levelHierarchy[adminLevel] || 0;
  const requiredLevelNum = levelHierarchy[requiredLevel] || 0;

  console.log('🔢 AdminRoute - Níveis:', {
    userLevel,
    requiredLevelNum,
    adminLevel,
    requiredLevel
  });

  if (userLevel < requiredLevelNum) {
    console.log('❌ AdminRoute - Nível insuficiente');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <Shield className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-yellow-600 mb-2">Nível Insuficiente</h1>
            <p className="text-gray-600 mb-4">
              Você precisa de nível {requiredLevel} ou superior para acessar esta funcionalidade.
            </p>
            <p className="text-sm text-gray-500">
              Seu nível atual: {adminLevel} | Email: {user?.email}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('✅ AdminRoute - Acesso autorizado');
  return <>{children}</>;
}
