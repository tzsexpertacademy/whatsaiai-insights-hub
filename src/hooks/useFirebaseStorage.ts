
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCommercialClientConfig } from './useCommercialClientConfig';
import { useClientConfig } from '@/contexts/ClientConfigContext';

interface FirebaseMessage {
  sender: string;
  text: string;
  timestamp: string;
  ai_generated?: boolean;
  sender_type?: string;
}

interface FirebaseConversation {
  id: string;
  contact_name: string;
  contact_phone: string;
  messages: FirebaseMessage[];
  created_at: string;
  updated_at: string;
  psychological_profile?: any;
  emotional_analysis?: any;
  sales_analysis?: any;
  lead_status?: string;
  sales_stage?: string;
}

export function useFirebaseStorage(module: 'commercial' | 'observatory' = 'commercial') {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { config: commercialConfig } = useCommercialClientConfig();
  const { config: observatoryConfig } = useClientConfig();

  const getFirebaseConfig = () => {
    if (module === 'commercial') {
      return commercialConfig?.commercial_firebase_config;
    }
    return observatoryConfig?.firebase;
  };

  const getFirebaseUrl = () => {
    const config = getFirebaseConfig();
    if (!config?.databaseURL) {
      throw new Error('Firebase não configurado para este módulo');
    }
    return config.databaseURL.replace(/\/$/, '');
  };

  const getAuthToken = () => {
    const config = getFirebaseConfig();
    return config?.apiKey;
  };

  const saveConversation = async (conversation: Omit<FirebaseConversation, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
    setIsLoading(true);
    try {
      const firebaseUrl = getFirebaseUrl();
      const authToken = getAuthToken();
      
      if (!authToken) {
        throw new Error('Token de autenticação Firebase não encontrado');
      }

      const conversationId = Date.now().toString();
      const timestamp = new Date().toISOString();
      
      const conversationData: FirebaseConversation = {
        ...conversation,
        id: conversationId,
        created_at: timestamp,
        updated_at: timestamp
      };

      const url = `${firebaseUrl}/conversations/${module}/${conversationId}.json?auth=${authToken}`;
      
      console.log(`💾 Salvando conversa no Firebase do cliente (${module}):`, conversationData);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversationData)
      });

      if (!response.ok) {
        throw new Error(`Erro ao salvar no Firebase: ${response.status}`);
      }

      console.log('✅ Conversa salva no Firebase do cliente');
      return conversationId;

    } catch (error) {
      console.error('❌ Erro ao salvar conversa no Firebase:', error);
      toast({
        title: "Erro no Firebase",
        description: "Não foi possível salvar no Firebase do cliente",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateConversation = async (conversationId: string, updates: Partial<FirebaseConversation>): Promise<void> => {
    setIsLoading(true);
    try {
      const firebaseUrl = getFirebaseUrl();
      const authToken = getAuthToken();
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const url = `${firebaseUrl}/conversations/${module}/${conversationId}.json?auth=${authToken}`;
      
      console.log(`🔄 Atualizando conversa no Firebase (${module}):`, updateData);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar no Firebase: ${response.status}`);
      }

      console.log('✅ Conversa atualizada no Firebase do cliente');

    } catch (error) {
      console.error('❌ Erro ao atualizar conversa no Firebase:', error);
      toast({
        title: "Erro no Firebase",
        description: "Não foi possível atualizar no Firebase do cliente",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getConversations = async (): Promise<FirebaseConversation[]> => {
    setIsLoading(true);
    try {
      const firebaseUrl = getFirebaseUrl();
      const authToken = getAuthToken();
      
      const url = `${firebaseUrl}/conversations/${module}.json?auth=${authToken}`;
      
      console.log(`📖 Buscando conversas do Firebase (${module})`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('📝 Nenhuma conversa encontrada no Firebase');
          return [];
        }
        throw new Error(`Erro ao buscar do Firebase: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data) {
        return [];
      }

      const conversations = Object.values(data) as FirebaseConversation[];
      console.log(`✅ ${conversations.length} conversas carregadas do Firebase`);
      
      return conversations;

    } catch (error) {
      console.error('❌ Erro ao buscar conversas do Firebase:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnalysis = async (conversationId: string, analysis: any): Promise<void> => {
    setIsLoading(true);
    try {
      const firebaseUrl = getFirebaseUrl();
      const authToken = getAuthToken();
      
      const analysisData = {
        ...analysis,
        analysis_timestamp: new Date().toISOString(),
        module
      };

      const url = `${firebaseUrl}/analyses/${module}/${conversationId}.json?auth=${authToken}`;
      
      console.log(`🧠 Salvando análise IA no Firebase (${module}):`, analysisData);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData)
      });

      if (!response.ok) {
        throw new Error(`Erro ao salvar análise no Firebase: ${response.status}`);
      }

      console.log('✅ Análise IA salva no Firebase do cliente');

    } catch (error) {
      console.error('❌ Erro ao salvar análise no Firebase:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const testFirebaseConnection = async (): Promise<boolean> => {
    try {
      const firebaseUrl = getFirebaseUrl();
      const authToken = getAuthToken();
      
      const testUrl = `${firebaseUrl}/.json?auth=${authToken}`;
      
      const response = await fetch(testUrl);
      return response.ok;
      
    } catch (error) {
      console.error('❌ Erro ao testar conexão Firebase:', error);
      return false;
    }
  };

  return {
    saveConversation,
    updateConversation,
    getConversations,
    saveAnalysis,
    testFirebaseConnection,
    isLoading
  };
}
