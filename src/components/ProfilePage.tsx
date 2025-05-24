
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Save, Sparkles } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  company_name: string;
  plan: string;
  ai_analysis_enabled: boolean;
}

export function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    full_name: '',
    company_name: '',
    plan: 'basic',
    ai_analysis_enabled: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      console.log('📥 Carregando perfil do usuário:', user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Erro ao carregar perfil:', error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar as informações do perfil",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          full_name: data.full_name || '',
          company_name: data.company_name || '',
          plan: data.plan || 'basic',
          ai_analysis_enabled: data.ai_analysis_enabled || false
        });
        console.log('✅ Perfil carregado com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar perfil:', error);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar o perfil",
        variant: "destructive"
      });
    } finally {
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
        description: "Suas informações foram salvas com sucesso"
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

  const toggleAIAnalysis = async () => {
    const newValue = !profile.ai_analysis_enabled;
    setProfile(prev => ({ ...prev, ai_analysis_enabled: newValue }));
    
    console.log('🤖 Alternando análise por IA:', newValue ? 'ATIVADA' : 'DESATIVADA');
    
    toast({
      title: newValue ? "Análise por IA ativada" : "Análise por IA desativada",
      description: newValue 
        ? "A IA agora analisará automaticamente suas conversações" 
        : "A análise automática por IA foi desativada"
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Perfil do Usuário</h1>
        <p className="text-slate-600">Gerencie suas informações pessoais e configurações</p>
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
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Status da Análise por IA</h3>
              <p className="text-sm text-blue-700 mb-4">
                {profile.ai_analysis_enabled 
                  ? 'A análise automática está ATIVADA. Suas conversações serão analisadas pela IA para gerar insights.'
                  : 'A análise automática está DESATIVADA. Ative para receber insights automáticos das suas conversações.'
                }
              </p>
              
              <Button 
                onClick={toggleAIAnalysis}
                variant={profile.ai_analysis_enabled ? "destructive" : "default"}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {profile.ai_analysis_enabled ? 'Desativar Análise por IA' : 'Ativar Análise por IA'}
              </Button>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
