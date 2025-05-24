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

      console.log('🗑️ Iniciando limpeza COMPLETA do banco comercial para usuário:', user.id);

      // Deletar TODOS os dados comerciais em sequência para evitar conflitos de referência
      const deletionPromises = [
        // Primeiro: mensagens (podem ter referências para conversas)
        supabase.from('commercial_messages').delete().eq('user_id', user.id),
        // Segundo: insights (podem ter referências para conversas)
        supabase.from('commercial_insights').delete().eq('user_id', user.id),
        // Terceiro: conversas
        supabase.from('commercial_conversations').delete().eq('user_id', user.id),
        // Quarto: métricas de vendas
        supabase.from('sales_metrics').delete().eq('user_id', user.id),
        // Quinto: dados do funil de vendas
        supabase.from('sales_funnel_data').delete().eq('user_id', user.id),
        // Sexto: configurações de assistentes comerciais
        supabase.from('commercial_assistants_config').delete().eq('user_id', user.id)
      ];

      // Executar todas as exclusões
      const results = await Promise.allSettled(deletionPromises);
      
      // Verificar se alguma exclusão falhou
      const errors = results.filter(result => result.status === 'rejected');
      if (errors.length > 0) {
        console.error('❌ Alguns dados não foram excluídos:', errors);
        toast({
          title: "Aviso",
          description: "Alguns dados podem não ter sido completamente removidos. Tente novamente se necessário.",
          variant: "destructive"
        });
      }

      console.log('✅ Limpeza comercial executada');

      toast({
        title: "Dados comerciais excluídos!",
        description: "Todos os dados do módulo comercial foram removidos. Os relatórios foram zerados.",
      });

      // Limpar formulário
      setPassword('');
      setIsConfirming(false);

      // Recarregar a página após alguns segundos para garantir que todos os componentes sejam atualizados
      setTimeout(() => {
        console.log('🔄 Recarregando página para atualizar interface...');
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('❌ Erro durante limpeza do banco comercial:', error);
      toast({
        title: "Erro ao excluir dados",
        description: "Não foi possível excluir completamente os dados comerciais. Tente novamente.",
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
            Use esta função para limpar todos os dados comerciais e zerar os relatórios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta ação irá excluir todos os dados relacionados exclusivamente ao módulo comercial.
              Os dados do Observatório da Consciência não serão afetados.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium text-red-800">O que será excluído do módulo comercial:</h4>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Todas as conversas comerciais</li>
              <li>Todas as mensagens comerciais</li>
              <li>Todos os insights comerciais gerados</li>
              <li>Todas as métricas de vendas</li>
              <li>Dados do funil de vendas</li>
              <li>Configurações dos assistentes comerciais</li>
              <li>📊 Todos os relatórios serão zerados</li>
            </ul>
          </div>

          <Button 
            onClick={() => setIsConfirming(true)}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Dados Comerciais e Zerar Relatórios
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
          Digite sua senha para confirmar a exclusão de todos os dados comerciais e zerar relatórios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800 font-medium">
            ⚠️ ATENÇÃO: Esta ação não pode ser desfeita! Todos os dados comerciais e relatórios serão perdidos.
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
                Confirmar Exclusão Total
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
