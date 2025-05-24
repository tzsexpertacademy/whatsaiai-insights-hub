import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useCacheManager } from '@/hooks/useCacheManager';
import { supabase } from '@/integrations/supabase/client';
import { User, Save, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';

interface UserProfile {
  id: string;
  full_name: string;
  company_name: string;
  plan: string;
  ai_analysis_enabled: boolean;
}

export function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refreshAfterUpdate, quickRefresh } = useAutoRefresh();
  const { forceRefreshWithCacheClear } = useCacheManager();
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    full_name: '',
    company_name: '',
    plan: 'basic',
    ai_analysis_enabled: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log('🔄 ProfileSettings useEffect iniciado');
    console.log('👤 Usuário atual:', { 
      id: user?.id, 
      email: user?.email, 
      name: user?.name,
      isAuthenticated: !!user 
    });
    
    if (user?.id) {
      console.log('✅ Usuário encontrado, carregando perfil...');
      loadProfile();
    } else {
      console.log('❌ Usuário não encontrado, parando carregamento');
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) {
      console.log('❌ LoadProfile: user.id não disponível');
      setIsLoading(false);
      return;
    }

    try {
      console.log('📥 Iniciando carregamento do perfil para usuário:', user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      console.log('📊 Resposta do Supabase:', { data, error });

      if (error) {
        console.error('❌ Erro ao carregar perfil:', error);
        toast({
          title: "Erro ao carregar perfil",
          description: `Erro: ${error.message}`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (data) {
        console.log('✅ Perfil encontrado no banco:', data);
        setProfile({
          id: data.id,
          full_name: data.full_name || '',
          company_name: data.company_name || '',
          plan: data.plan || 'basic',
          ai_analysis_enabled: data.ai_analysis_enabled || false
        });
      } else {
        console.log('ℹ️ Nenhum perfil encontrado no banco, usando dados do auth');
        setProfile({
          id: user.id,
          full_name: user.name || '',
          company_name: '',
          plan: 'basic',
          ai_analysis_enabled: false
        });
      }
      
      console.log('✅ Perfil configurado com sucesso');
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar perfil:', error);
      toast({
        title: "Erro inesperado",
        description: `Não foi possível carregar o perfil: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      console.log('🏁 Finalizando carregamento do perfil');
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      console.log('💾 Salvando perfil do usuário:', user.id);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          company_name: profile.company_name,
          plan: profile.plan,
          ai_analysis_enabled: profile.ai_analysis_enabled,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Erro ao salvar perfil:', error);
        throw error;
      }

      console.log('✅ Perfil salvo com sucesso!');
      toast({
        title: "Perfil atualizado",
        description: "Atualizando sistema em 2 segundos...",
        duration: 2000
      });

      // Auto-refresh após salvar perfil
      refreshAfterUpdate({
        redirectTo: '/user-profile',
        delay: 2000
      });

    } catch (error) {
      console.error('❌ Erro ao salvar perfil:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as informações",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAIAnalysis = async (enabled: boolean) => {
    setProfile(prev => ({ ...prev, ai_analysis_enabled: enabled }));
    
    console.log('🤖 Alternando análise por IA:', enabled ? 'ATIVADA' : 'DESATIVADA');
    
    toast({
      title: enabled ? "Análise por IA ativada" : "Análise por IA desativada",
      description: enabled 
        ? "A IA agora analisará automaticamente suas conversações" 
        : "A análise automática por IA foi desativada"
    });
  };

  if (isLoading) {
    console.log('⏳ Renderizando estado de carregamento');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
          <p className="text-sm text-gray-400 mt-2">
            ID do usuário: {user?.id || 'Não disponível'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ Renderizando erro: usuário não encontrado');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Usuário não encontrado</h2>
          <p className="text-gray-600">Faça login para acessar seu perfil</p>
        </div>
      </div>
    );
  }

  console.log('✅ Renderizando interface do perfil para usuário:', user.email);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Perfil do Usuário</h1>
          <p className="text-slate-600">Gerencie suas informações pessoais e configurações</p>
          <p className="text-sm text-blue-600 mt-1">
            Logado como: {user.email} | ID: {user.id?.substring(0, 8)}...
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Botão de Análise por IA */}
          <AIAnalysisButton variant="outline" size="sm" />
          
          {/* Botão para limpar cache */}
          <Button 
            onClick={forceRefreshWithCacheClear}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
          >
            <Trash2 className="h-4 w-4" />
            Limpar Cache
          </Button>
          
          <Button 
            onClick={quickRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar Página
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Atualize suas informações pessoais e da empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500">O email não pode ser alterado</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Digite seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                type="text"
                value={profile.company_name}
                onChange={(e) => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Digite o nome da sua empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Plano Atual</Label>
              <Input
                id="plan"
                type="text"
                value={profile.plan}
                disabled
                className="bg-gray-50 capitalize"
              />
              <p className="text-sm text-gray-500">Entre em contato para alterar seu plano</p>
            </div>

            <Button 
              onClick={saveProfile} 
              disabled={isSaving}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardContent>
        </Card>

        {/* Configurações de IA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Análise por Inteligência Artificial
            </CardTitle>
            <CardDescription>
              Configure a análise automática das suas conversações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 mb-1">Análise Automática por IA</h3>
                <p className="text-sm text-blue-700">
                  {profile.ai_analysis_enabled 
                    ? 'A análise automática está ATIVADA. Suas conversações serão analisadas pela IA para gerar insights.'
                    : 'A análise automática está DESATIVADA. Ative para receber insights automáticos das suas conversações.'
                  }
                </p>
              </div>
              <Switch
                checked={profile.ai_analysis_enabled}
                onCheckedChange={toggleAIAnalysis}
                className="ml-4"
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Benefícios da Análise por IA:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  Análise automática de sentimentos nas conversações
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  Identificação de padrões comportamentais
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  Geração de insights e recomendações personalizadas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  Relatórios detalhados sobre áreas da vida
                </li>
              </ul>
            </div>
            
            {/* Botão adicional para análise manual */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Análise Manual</h4>
                  <p className="text-sm text-gray-600">
                    Execute uma análise imediata das suas conversações
                  </p>
                </div>
                <AIAnalysisButton variant="outline" size="sm" showText={false} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
