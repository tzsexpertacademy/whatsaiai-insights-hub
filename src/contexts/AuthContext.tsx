
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
  subscribed?: boolean;
  subscriptionTier?: string;
  subscriptionEnd?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, metadata?: { fullName?: string; companyName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para criar perfil do usuário
  const createUserProfile = (session: Session, subscriptionData?: any): UserProfile => {
    return {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.user_metadata?.full_name || 'Usuário',
      companyName: session.user.user_metadata?.company_name,
      plan: 'basic',
      createdAt: new Date(session.user.created_at),
      isActive: true,
      subscribed: subscriptionData?.subscribed || false,
      subscriptionTier: subscriptionData?.subscription_tier,
      subscriptionEnd: subscriptionData?.subscription_end,
    };
  };

  const checkSubscription = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (user) {
        setUser({
          ...user,
          subscribed: data.subscribed,
          subscriptionTier: data.subscription_tier,
          subscriptionEnd: data.subscription_end,
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const createCheckout = async () => {
    if (!session) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    if (!session) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Função para processar mudanças de autenticação
    const handleAuthChange = async (event: string, session: Session | null) => {
      console.log('🔄 Auth state changed:', event, !!session);
      
      if (!mounted) return;

      if (session) {
        setSession(session);
        const userProfile = createUserProfile(session);
        setUser(userProfile);
        
        // Check subscription after login
        setTimeout(async () => {
          try {
            const { data, error } = await supabase.functions.invoke('check-subscription', {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });

            if (!error && mounted) {
              setUser(prev => prev ? {
                ...prev,
                subscribed: data.subscribed,
                subscriptionTier: data.subscription_tier,
                subscriptionEnd: data.subscription_end,
              } : null);
            }
          } catch (error) {
            console.error('Error checking subscription on login:', error);
          }
        }, 0);
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
      isLoading,
      checkSubscription,
      createCheckout,
      openCustomerPortal
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
