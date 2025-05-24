
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const initializingRef = useRef(false);
  const mountedRef = useRef(true);

  // Limpa estados problemáticos no início
  useEffect(() => {
    // Só executa uma vez por mount
    if (initializingRef.current) return;
    initializingRef.current = true;

    const initializeAuth = async () => {
      try {
        console.log('🔐 Inicializando autenticação...');
        
        // Verifica sessão atual
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao verificar sessão:', error);
          // Limpa dados corrompidos
          await supabase.auth.signOut();
          return;
        }

        if (currentSession?.user && mountedRef.current) {
          console.log('✅ Sessão válida encontrada:', currentSession.user.id);
          await updateUserFromSession(currentSession);
        } else {
          console.log('ℹ️ Nenhuma sessão ativa');
        }
      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        // Em caso de erro, limpa tudo
        if (mountedRef.current) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mountedRef.current) return;
        
        console.log('🔄 Auth state changed:', event, newSession?.user?.id);
        
        try {
          if (newSession?.user) {
            await updateUserFromSession(newSession);
          } else {
            setUser(null);
            setSession(null);
          }
        } catch (error) {
          console.error('❌ Erro no auth state change:', error);
          setUser(null);
          setSession(null);
        }
      }
    );

    initializeAuth();

    return () => {
      subscription.unsubscribe();
      mountedRef.current = false;
    };
  }, []);

  const updateUserFromSession = async (session: Session) => {
    if (!mountedRef.current) return;
    
    setSession(session);
    
    try {
      // Buscar perfil do usuário de forma mais robusta
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('❌ Erro ao buscar perfil:', error);
      }

      if (mountedRef.current) {
        const userProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email!,
          name: profile?.full_name || session.user.user_metadata?.full_name || 'Usuário',
          companyName: profile?.company_name || session.user.user_metadata?.company_name,
          plan: (profile?.plan as 'basic' | 'premium' | 'enterprise') || 'basic',
          createdAt: new Date(profile?.created_at || session.user.created_at),
          isActive: true
        };
        
        setUser(userProfile);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      if (mountedRef.current) {
        // Manter usuário básico mesmo com erro no perfil
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
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, metadata?: { fullName?: string; companyName?: string }): Promise<void> => {
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
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Limpar estados locais imediatamente
    setUser(null);
    setSession(null);
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
