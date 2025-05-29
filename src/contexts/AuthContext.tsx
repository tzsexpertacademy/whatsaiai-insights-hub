
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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
      console.log('🔍 Verificando status da assinatura...');
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('❌ Erro ao verificar assinatura:', error);
        throw error;
      }

      console.log('✅ Status da assinatura verificado:', data);

      if (user) {
        setUser({
          ...user,
          subscribed: data.subscribed,
          subscriptionTier: data.subscription_tier,
          subscriptionEnd: data.subscription_end,
        });
      }
    } catch (error) {
      console.error('❌ Erro ao verificar assinatura:', error);
    }
  };

  const createCheckout = async () => {
    if (!session) {
      console.error('❌ Usuário não autenticado para checkout');
      toast({
        title: "Erro",
        description: "Você precisa estar logado para acessar o checkout.",
        variant: "destructive",
      });
      throw new Error('User not authenticated');
    }
    
    try {
      console.log('💳 Criando sessão de checkout...');
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          planType: 'premium',
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/dashboard?checkout=cancelled`
        }
      });

      if (error) {
        console.error('❌ Erro ao criar checkout:', error);
        throw error;
      }

      console.log('✅ Checkout criado com sucesso:', data);

      if (data.url) {
        // Abrir checkout em nova aba
        window.open(data.url, '_blank');
        toast({
          title: "Redirecionando para pagamento",
          description: "Uma nova aba foi aberta para completar seu pagamento.",
        });
      } else {
        throw new Error('URL do checkout não retornada');
      }
    } catch (error) {
      console.error('❌ Erro no checkout:', error);
      toast({
        title: "Erro no checkout",
        description: "Não foi possível abrir o checkout. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    if (!session) {
      console.error('❌ Usuário não autenticado para portal');
      throw new Error('User not authenticated');
    }
    
    try {
      console.log('🏛️ Abrindo portal do cliente...');
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error || data?.redirectToCheckout) {
        console.log('⚠️ Portal não disponível, redirecionando para checkout');
        await createCheckout();
        return;
      }

      if (data.url) {
        // Abrir portal em nova aba
        window.open(data.url, '_blank');
        toast({
          title: "Portal do cliente aberto",
          description: "Uma nova aba foi aberta para gerenciar sua assinatura.",
        });
      } else {
        throw new Error('URL do portal não retornada');
      }
    } catch (error) {
      console.error('❌ Erro no portal do cliente:', error);
      toast({
        title: "Redirecionando para checkout",
        description: "Portal não disponível. Abrindo página de pagamento.",
      });
      // Se falhar, redirecionar para checkout
      await createCheckout();
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
        
        // Se é um novo signup, marcar para mostrar tour de boas vindas
        if (event === 'SIGNED_UP') {
          console.log('🆕 Novo usuário detectado via SIGNED_UP, marcando para tour de boas vindas');
          localStorage.setItem('show_welcome_tour', 'true');
          localStorage.removeItem('welcome_tour_completed'); // Garantir que não existe
        }
        
        // Verificar se é um usuário muito novo (criado há menos de 5 minutos) e ainda não completou o tour
        const userCreatedAt = new Date(session.user.created_at);
        const now = new Date();
        const minutesSinceCreation = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60);
        const tourCompleted = localStorage.getItem('welcome_tour_completed') === 'true';
        
        if (minutesSinceCreation < 5 && !tourCompleted) {
          console.log('🆕 Usuário muito recente detectado, marcando para tour:', {
            minutesSinceCreation,
            tourCompleted,
            userCreatedAt: userCreatedAt.toISOString()
          });
          localStorage.setItem('show_welcome_tour', 'true');
        }
        
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
            console.error('❌ Erro ao verificar assinatura no login:', error);
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
    console.log('🔑 Fazendo login real para:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
  };

  const signup = async (email: string, password: string, metadata?: { fullName?: string; companyName?: string }): Promise<void> => {
    console.log('📝 Criando conta real para usuário:', email);
    
    // Marcar que será um novo usuário antes mesmo do signup
    localStorage.setItem('show_welcome_tour', 'true');
    localStorage.removeItem('welcome_tour_completed');
    
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

    if (error) {
      console.error('❌ Erro ao criar conta:', error);
      // Limpar flags se houve erro
      localStorage.removeItem('show_welcome_tour');
      throw error;
    }
    
    console.log('✅ Conta criada com sucesso para:', email);
  };

  const logout = async (): Promise<void> => {
    console.log('🚪 Fazendo logout...');
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
