
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

  console.log('🔐 AuthProvider render - Estado:', { user: !!user, session: !!session, isLoading });

  useEffect(() => {
    console.log('🔄 AuthProvider - Iniciando configuração de autenticação');
    
    let mounted = true;

    // Função para processar sessão
    const handleSession = async (session: Session | null) => {
      console.log('📋 AuthProvider - Processando sessão:', !!session);
      
      if (!mounted) return;
      
      setSession(session);
      
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (mounted) {
            const userProfile: UserProfile = {
              id: session.user.id,
              email: session.user.email!,
              name: profile?.full_name || session.user.user_metadata?.full_name || 'Usuário',
              companyName: profile?.company_name || session.user.user_metadata?.company_name,
              plan: (profile?.plan as 'basic' | 'premium' | 'enterprise') || 'basic',
              createdAt: new Date(profile?.created_at || session.user.created_at),
              isActive: true
            };
            
            console.log('✅ AuthProvider - Usuário carregado:', userProfile.email);
            setUser(userProfile);
          }
        } catch (error) {
          console.error('❌ AuthProvider - Erro ao carregar perfil:', error);
          if (mounted) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: 'Usuário',
              plan: 'basic',
              createdAt: new Date(),
              isActive: true
            });
          }
        }
      } else {
        console.log('🚪 AuthProvider - Removendo usuário (logout)');
        if (mounted) {
          setUser(null);
        }
      }
      
      if (mounted) {
        console.log('🏁 AuthProvider - Finalizando loading');
        setIsLoading(false);
      }
    };

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 AuthProvider - Auth state changed:', event);
      await handleSession(session);
    });

    // Verificar sessão atual
    const initializeAuth = async () => {
      try {
        console.log('🔍 AuthProvider - Verificando sessão atual');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthProvider - Erro ao verificar sessão:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        await handleSession(session);
      } catch (error) {
        console.error('❌ AuthProvider - Erro na inicialização:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 AuthProvider - Cleanup');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    console.log('🔑 AuthProvider - Tentativa de login');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      console.log('✅ AuthProvider - Login bem-sucedido');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, metadata?: { fullName?: string; companyName?: string }): Promise<void> => {
    console.log('📝 AuthProvider - Tentativa de cadastro');
    setIsLoading(true);
    try {
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
      console.log('✅ AuthProvider - Cadastro bem-sucedido');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    console.log('🚪 AuthProvider - Logout');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    setUser(null);
    setSession(null);
  };

  const isAuthenticated = !!user && !!session;

  console.log('🎯 AuthProvider - Estado final:', { isAuthenticated, isLoading, hasUser: !!user, hasSession: !!session });

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
