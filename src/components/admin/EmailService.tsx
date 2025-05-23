
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, User, Key } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface NewClient {
  name: string;
  email: string;
  plan: 'basic' | 'premium' | 'enterprise';
  customMessage: string;
}

export function EmailService() {
  const [newClient, setNewClient] = useState<NewClient>({
    name: '',
    email: '',
    plan: 'basic',
    customMessage: ''
  });
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const generateCredentials = () => {
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    return { email: newClient.email, password };
  };

  const sendWelcomeEmail = async () => {
    if (!newClient.name || !newClient.email) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      const credentials = generateCredentials();
      
      // Simular envio de email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const emailTemplate = `
Olá ${newClient.name},

Bem-vindo ao Observatório da Consciência!

Suas credenciais de acesso:
Email: ${credentials.email}
Senha: ${credentials.password}

Plano contratado: ${newClient.plan.toUpperCase()}

${newClient.customMessage ? `\nMensagem personalizada:\n${newClient.customMessage}` : ''}

Para acessar sua conta, visite: ${window.location.origin}

Primeiros passos:
1. Faça login com suas credenciais
2. Configure sua integração WhatsApp Business
3. Configure seu Firebase para armazenamento
4. Configure sua API OpenAI
5. Personalize seus assistentes

Em caso de dúvidas, entre em contato conosco.

Atenciosamente,
Equipe Observatório da Consciência
      `;

      console.log('Email que seria enviado:', emailTemplate);
      
      toast({
        title: "Email enviado!",
        description: `Credenciais enviadas para ${newClient.email}`,
      });

      // Resetar formulário
      setNewClient({
        name: '',
        email: '',
        plan: 'basic',
        customMessage: ''
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar email. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          Criar Novo Cliente
        </CardTitle>
        <CardDescription>
          Cadastre um novo cliente e envie as credenciais automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="client-name">Nome do Cliente</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="client-name"
                placeholder="Nome completo"
                value={newClient.name}
                onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="client-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="client-email"
                type="email"
                placeholder="email@empresa.com"
                value={newClient.email}
                onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="plan">Plano Contratado</Label>
          <Select value={newClient.plan} onValueChange={(value: 'basic' | 'premium' | 'enterprise') => 
            setNewClient(prev => ({ ...prev, plan: value }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic - Funcionalidades essenciais</SelectItem>
              <SelectItem value="premium">Premium - Recursos avançados</SelectItem>
              <SelectItem value="enterprise">Enterprise - Solução completa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="custom-message">Mensagem Personalizada (Opcional)</Label>
          <Textarea
            id="custom-message"
            placeholder="Adicione uma mensagem personalizada que será incluída no email..."
            value={newClient.customMessage}
            onChange={(e) => setNewClient(prev => ({ ...prev, customMessage: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">O que acontecerá:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Senha será gerada automaticamente</li>
            <li>• Email com credenciais será enviado</li>
            <li>• Cliente receberá instruções de primeiro acesso</li>
            <li>• Conta ficará ativa imediatamente</li>
          </ul>
        </div>

        <Button 
          onClick={sendWelcomeEmail} 
          className="w-full" 
          disabled={isSending}
        >
          <Send className="h-4 w-4 mr-2" />
          {isSending ? 'Enviando...' : 'Criar Cliente e Enviar Credenciais'}
        </Button>
      </CardContent>
    </Card>
  );
}
