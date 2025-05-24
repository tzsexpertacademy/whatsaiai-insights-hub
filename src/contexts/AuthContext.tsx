
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  plan: 'basic' | 'premium' | 'enterprise';
  createdAt: Date;
  isActive: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, metadata?: { fullName?: string; companyName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para criar perfil do usuário
  const createUserProfile = (session: Session): UserProfile => {
    return {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.user_metadata?.full_name || 'Usuário',
      companyName: session.user.user_metadata?.company_name,
      plan: 'basic',
      createdAt: new Date(session.user.created_at),
      isActive: true
    };
  };

  useEffect(() => {
    let mounted = true;

    // Função para processar mudanças de autenticação
    const handleAuthChange = (event: string, session: Session | null) => {
      console.log('🔄 Auth state changed:', event, !!session);
      
      if (!mounted) return;

      if (session) {
        setSession(session);
        setUser(createUserProfile(session));
      } else {
        setSession(null);
        setUser(null);
      }
      
      setIsLoading(false);
    };

    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        handleAuthChange('INITIAL_SESSION', session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
  };

  const signup = async (email: string, password: string, metadata?: { fullName?: string; companyName?: string }): Promise<void> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata?.fullName || '',
          company_name: metadata?.companyName || ''
        }
      }
    });

    if (error) throw error;
  };

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const isAuthenticated = !!user && !!session;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated,
      login,
      signup,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
