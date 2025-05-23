
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  sender: string;
  text: string;
  timestamp: string;
}

export function useConversationUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const parseWhatsAppFile = (fileContent: string): { messages: Message[], contactName: string, contactPhone: string } => {
    const lines = fileContent.split('\n').filter(line => line.trim());
    const messages: Message[] = [];
    let contactName = 'Cliente';
    let contactPhone = '+55 11 99999-9999';

    // Detectar formato do arquivo
    const whatsAppRegex = /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}:\d{2})\]?\s*([^:]+):\s*(.+)$/;
    
    for (const line of lines) {
      const match = line.match(whatsAppRegex);
      
      if (match) {
        const [, date, time, sender, text] = match;
        
        // Primeira mensagem define o nome do contato
        if (messages.length === 0 && sender.trim() !== 'Você') {
          contactName = sender.trim();
        }
        
        messages.push({
          sender: sender.trim() === 'Você' ? 'Você' : contactName,
          text: text.trim(),
          timestamp: new Date(`${date} ${time}`).toISOString()
        });
      }
    }

    return { messages, contactName, contactPhone };
  };

  const uploadAndAnalyze = async (file: File): Promise<{ success: boolean; conversationId?: string }> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return { success: false };
    }

    setIsUploading(true);
    
    try {
      const fileContent = await file.text();
      const { messages, contactName, contactPhone } = parseWhatsAppFile(fileContent);
      
      if (messages.length === 0) {
        throw new Error('Nenhuma mensagem válida encontrada no arquivo');
      }

      // Chamar edge function para análise
      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: {
          messages,
          contactName,
          contactPhone
        }
      });

      if (error) throw error;

      toast({
        title: "Análise concluída!",
        description: `${messages.length} mensagens analisadas. ${data.insights_generated} insights gerados.`
      });

      return { 
        success: true, 
        conversationId: data.conversation_id 
      };

    } catch (error) {
      console.error('Error uploading conversation:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível processar o arquivo",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsUploading(false);
    }
  };

  const syncExistingConversations = async (): Promise<void> => {
    if (!user) return;

    setIsUploading(true);
    
    try {
      // Buscar conversas existentes sem análise
      const { data: conversations, error } = await supabase
        .from('whatsapp_conversations')
        .select('id, messages, contact_name, contact_phone')
        .eq('user_id', user.id)
        .is('emotional_analysis', null);

      if (error) throw error;

      if (!conversations || conversations.length === 0) {
        toast({
          title: "Sincronização completa",
          description: "Todas as conversas já estão analisadas"
        });
        return;
      }

      let processed = 0;
      
      for (const conv of conversations) {
        try {
          await supabase.functions.invoke('analyze-conversation', {
            body: {
              messages: conv.messages,
              contactName: conv.contact_name,
              contactPhone: conv.contact_phone
            }
          });
          processed++;
        } catch (error) {
          console.error(`Erro ao processar conversa ${conv.id}:`, error);
        }
      }

      toast({
        title: "Sincronização concluída",
        description: `${processed} conversas reprocessadas com sucesso`
      });

    } catch (error) {
      console.error('Error syncing conversations:', error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar as conversas",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadAndAnalyze,
    syncExistingConversations,
    isUploading
  };
}
