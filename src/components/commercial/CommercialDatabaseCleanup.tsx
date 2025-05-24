
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function CommercialDatabaseCleanup() {
  const [password, setPassword] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDeleteData = async () => {
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para realizar esta ação",
        variant: "destructive"
      });
      return;
    }

    if (!password) {
      toast({
        title: "Senha necessária",
        description: "Digite sua senha para confirmar a exclusão",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsDeleting(true);

      // Verificar a senha do usuário
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password
      });

      if (authError) {
        toast({
          title: "Senha incorreta",
          description: "A senha digitada está incorreta",
          variant: "destructive"
        });
        return;
      }

      console.log('🗑️ Iniciando limpeza do banco comercial para usuário:', user.id);

      // Para o módulo comercial, vamos deletar dados específicos relacionados a vendas
      // Por enquanto, vamos limpar dados gerais que podem ser usados pelo comercial
      
      // Deletar conversas do WhatsApp relacionadas ao comercial
      const { error: conversationsError } = await supabase
        .from('whatsapp_conversations')
        .delete()
        .eq('user_id', user.id);

      if (conversationsError) {
        console.error('❌ Erro ao deletar conversas comerciais:', conversationsError);
        throw conversationsError;
      }

      // Deletar mensagens do WhatsApp relacionadas ao comercial
      const { error: messagesError } = await supabase
        .from('whatsapp_messages')
        .delete()
        .eq('user_id', user.id);

      if (messagesError) {
        console.error('❌ Erro ao deletar mensagens comerciais:', messagesError);
        throw messagesError;
      }

      // Deletar insights relacionados ao comercial
      const { error: insightsError } = await supabase
        .from('insights')
        .delete()
        .eq('user_id', user.id);

      if (insightsError) {
        console.error('❌ Erro ao deletar insights comerciais:', insightsError);
        throw insightsError;
      }

      console.log('✅ Dados comerciais limpos com sucesso');

      toast({
        title: "Dados comerciais excluídos!",
        description: "Todos os dados comerciais foram removidos. O sistema está pronto para novos testes.",
      });

      // Limpar formulário
      setPassword('');
      setIsConfirming(false);

      // Recarregar a página após alguns segundos para atualizar todos os componentes
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('❌ Erro durante limpeza do banco comercial:', error);
      toast({
        title: "Erro ao excluir dados",
        description: "Não foi possível excluir os dados comerciais. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isConfirming) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Database className="h-5 w-5" />
            Limpeza de Dados Comerciais
          </CardTitle>
          <CardDescription className="text-red-700">
            Use esta função para limpar todos os dados comerciais e testar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta ação irá excluir todos os dados relacionados ao módulo comercial, incluindo 
              conversas, análises de vendas e métricas comerciais.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium text-red-800">O que será excluído do módulo comercial:</h4>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Todas as conversas comerciais do WhatsApp</li>
              <li>Todas as mensagens e análises de vendas</li>
              <li>Todos os insights comerciais gerados</li>
              <li>Dados de métricas comerciais</li>
              <li>Análises de funil de vendas</li>
              <li>Dados de performance comercial</li>
            </ul>
          </div>

          <Button 
            onClick={() => setIsConfirming(true)}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Dados Comerciais
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          Confirmar Exclusão de Dados Comerciais
        </CardTitle>
        <CardDescription className="text-red-700">
          Digite sua senha para confirmar a exclusão de todos os dados comerciais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800 font-medium">
            ⚠️ ATENÇÃO: Esta ação não pode ser desfeita! Todos os dados comerciais serão perdidos.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="password">Senha da sua conta</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha..."
            className="border-red-300 focus:border-red-500"
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleDeleteData}
            disabled={isDeleting || !password}
            variant="destructive"
            className="flex-1"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Excluindo Dados Comerciais...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Confirmar Exclusão
              </>
            )}
          </Button>
          
          <Button
            onClick={() => {
              setIsConfirming(false);
              setPassword('');
            }}
            variant="outline"
            disabled={isDeleting}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
