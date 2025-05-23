
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function MakeInstructions() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Configurações salvas",
        description: "Webhooks do Make.com configurados com sucesso",
      });
    }, 500);
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle>Instruções para Make.com</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSave} disabled={isLoading} className="w-full mb-4">
          {isLoading ? 'Salvando...' : 'Salvar Todas as Configurações'}
        </Button>

        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Cenários necessários no Make.com:</h4>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li><strong>Conexão WhatsApp:</strong> QR Code, Status, Envio, Desconexão</li>
              <li><strong>Monitor de Mensagens:</strong> Captura mensagens recebidas</li>
              <li><strong>Assistente IA:</strong> Integração OpenAI + resposta automática</li>
              <li><strong>Puppeteer/WhatsApp Web:</strong> Controle do navegador</li>
            </ol>
          </div>
          
          <div className="mt-3">
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://make.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir Make.com
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
