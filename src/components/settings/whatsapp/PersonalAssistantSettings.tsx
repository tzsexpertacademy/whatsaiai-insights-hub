
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Brain, MessageSquare, Clock, TestTube } from 'lucide-react';
import { usePersonalAssistant } from '@/hooks/usePersonalAssistant';
import { Badge } from "@/components/ui/badge";

export function PersonalAssistantSettings() {
  const { config, updateConfig, assistants } = usePersonalAssistant();

  const selectedAssistant = assistants.find(a => a.id === config.selectedAssistantId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Configuração do Assistente Pessoal
        </CardTitle>
        <CardDescription>
          Configure as respostas automáticas do seu assistente via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ativação */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Ativar Assistente Pessoal</h3>
            <p className="text-sm text-gray-600 mt-1">
              Respostas automáticas via WhatsApp para o número autorizado
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => updateConfig({ enabled })}
          />
        </div>

        {/* Número Master */}
        <div className="space-y-2">
          <Label htmlFor="master-number">Número Master Autorizado</Label>
          <Input
            id="master-number"
            placeholder="5511999999999"
            value={config.masterNumber}
            onChange={(e) => updateConfig({ masterNumber: e.target.value })}
          />
          <p className="text-xs text-gray-500">
            Apenas este número receberá respostas automáticas do assistente
          </p>
        </div>

        {/* Seleção do Assistente */}
        <div className="space-y-2">
          <Label>Assistente Selecionado</Label>
          <Select
            value={config.selectedAssistantId}
            onValueChange={(value) => updateConfig({ selectedAssistantId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um assistente" />
            </SelectTrigger>
            <SelectContent>
              {assistants.map((assistant) => (
                <SelectItem key={assistant.id} value={assistant.id}>
                  <div className="flex items-center gap-2">
                    <span>{assistant.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {assistant.type}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedAssistant && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Descrição:</strong> {selectedAssistant.description}
              </p>
            </div>
          )}
        </div>

        {/* Delay de Resposta */}
        <div className="space-y-2">
          <Label htmlFor="response-delay">Delay de Resposta (segundos)</Label>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <Input
              id="response-delay"
              type="number"
              min="0"
              max="30"
              value={config.responseDelay}
              onChange={(e) => updateConfig({ responseDelay: parseInt(e.target.value) || 0 })}
              className="w-24"
            />
            <span className="text-sm text-gray-500">segundos</span>
          </div>
          <p className="text-xs text-gray-500">
            Tempo de espera antes de enviar a resposta (mais natural)
          </p>
        </div>

        {/* Status */}
        {config.enabled && config.masterNumber && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">✅ Assistente Configurado!</h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Número autorizado: {config.masterNumber}</li>
              <li>Assistente: {selectedAssistant?.name}</li>
              <li>Delay: {config.responseDelay}s</li>
              <li>O assistente responderá automaticamente suas mensagens</li>
            </ul>
          </div>
        )}

        {!config.enabled && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-900 mb-2">⚠️ Assistente Desativado</h4>
            <p className="text-sm text-yellow-700">
              Ative o assistente e configure o número master para receber respostas automáticas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
