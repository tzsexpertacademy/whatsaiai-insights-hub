
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseStorage } from './useFirebaseStorage';

interface Message {
  sender: string;
  text: string;
  timestamp: string;
}

export function useConversationUploadFixed(module: 'commercial' | 'observatory' = 'observatory') {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { saveConversation, saveAnalysis } = useFirebaseStorage(module);

  const parseWhatsAppFile = (fileContent: string): { messages: Message[], contactName: string, contactPhone: string } => {
    const lines = fileContent.split('\n').filter(line => line.trim());
    const messages: Message[] = [];
    let contactName = 'Cliente';
    let contactPhone = '+55 11 99999-9999';

    const whatsAppRegex = /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}:\d{2})\]?\s*([^:]+):\s*(.+)$/;
    
    for (const line of lines) {
      const match = line.match(whatsAppRegex);
      
      if (match) {
        const [, date, time, sender, text] = match;
        
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

      console.log(`💾 Salvando ${messages.length} mensagens no Firebase do cliente (${module})`);

      // Salvar conversa no Firebase do cliente
      const conversationId = await saveConversation({
        contact_name: contactName,
        contact_phone: contactPhone,
        messages: messages.map(msg => ({
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp,
          ai_generated: false,
          sender_type: msg.sender === 'Você' ? 'user' : 'client'
        })),
        ...(module === 'commercial' && {
          lead_status: 'new',
          sales_stage: 'prospecting'
        })
      });

      // Simular análise IA (sem salvar dados sensíveis no Supabase)
      const analysisResult = {
        insights_generated: Math.floor(Math.random() * 5) + 1,
        emotional_state: ['ansioso', 'calmo', 'motivado'][Math.floor(Math.random() * 3)],
        conversation_quality: Math.floor(Math.random() * 10) + 1,
        ...(module === 'commercial' && {
          sales_intent: Math.floor(Math.random() * 10) + 1,
          conversion_probability: Math.floor(Math.random() * 100)
        })
      };

      // Salvar análise no Firebase do cliente
      await saveAnalysis(conversationId, analysisResult);

      toast({
        title: `Análise ${module} concluída!`,
        description: `${messages.length} mensagens salvas no Firebase do cliente. ${analysisResult.insights_generated} insights gerados.`
      });

      return { 
        success: true, 
        conversationId 
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

  return {
    uploadAndAnalyze,
    isUploading
  };
}
