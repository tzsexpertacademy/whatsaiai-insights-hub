
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, DollarSign } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface CostEstimatorProps {
  estimatedTokens: number;
  maxTokens: number;
  model: string;
  fileName?: string;
}

// Preços por 1K tokens (entrada + saída) - valores aproximados de Janeiro 2024
const MODEL_PRICING = {
  'gpt-4o': {
    input: 0.005, // $0.005 per 1K tokens
    output: 0.015, // $0.015 per 1K tokens
    name: 'GPT-4o'
  },
  'gpt-4o-mini': {
    input: 0.00015, // $0.00015 per 1K tokens  
    output: 0.0006, // $0.0006 per 1K tokens
    name: 'GPT-4o Mini'
  },
  'gpt-4.5-preview': {
    input: 0.01, // $0.01 per 1K tokens (estimado)
    output: 0.03, // $0.03 per 1K tokens (estimado)
    name: 'GPT-4.5 Preview'
  }
};

export function CostEstimator({ estimatedTokens, maxTokens, model, fileName }: CostEstimatorProps) {
  const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING] || MODEL_PRICING['gpt-4o-mini'];
  
  // Calcular tokens que serão realmente processados
  const tokensToProcess = Math.min(estimatedTokens, maxTokens);
  const willBeTruncated = estimatedTokens > maxTokens;
  
  // Estimar tokens de resposta (geralmente 10-30% dos tokens de entrada)
  const estimatedResponseTokens = Math.ceil(tokensToProcess * 0.2); // 20% como estimativa conservadora
  
  // Calcular custos
  const inputCostUSD = (tokensToProcess / 1000) * pricing.input;
  const outputCostUSD = (estimatedResponseTokens / 1000) * pricing.output;
  const totalCostUSD = inputCostUSD + outputCostUSD;
  
  // Converter para Real (taxa aproximada)
  const usdToBrl = 5.20; // Taxa aproximada - poderia ser dinâmica
  const totalCostBRL = totalCostUSD * usdToBrl;
  
  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Estimativa de Custo da Análise
        </CardTitle>
        {fileName && (
          <p className="text-sm text-gray-600">Documento: {fileName}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Processamento</h4>
            <div className="text-xs space-y-1">
              <p>Modelo: <Badge variant="outline">{pricing.name}</Badge></p>
              <p>Tokens estimados: {estimatedTokens.toLocaleString()}</p>
              <p>Tokens processados: {tokensToProcess.toLocaleString()}</p>
              <p>Resposta estimada: {estimatedResponseTokens.toLocaleString()} tokens</p>
              {willBeTruncated && (
                <p className="text-amber-600 font-medium">⚠️ Documento será truncado</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Custo Estimado</h4>
            <div className="text-xs space-y-1">
              <p>Entrada: ${inputCostUSD.toFixed(4)} USD</p>
              <p>Saída: ${outputCostUSD.toFixed(4)} USD</p>
              <div className="border-t pt-1 mt-2">
                <p className="font-medium text-green-700">
                  <DollarSign className="h-3 w-3 inline mr-1" />
                  Total: ${totalCostUSD.toFixed(4)} USD
                </p>
                <p className="font-medium text-green-700">
                  Total: R$ {totalCostBRL.toFixed(4)} BRL
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-green-50 rounded-md">
          <div className="text-xs text-green-800 space-y-1">
            <p><strong>💡 Dica:</strong> Custos são estimativas baseadas em preços públicos da OpenAI</p>
            <p><strong>📊 Eficiência:</strong> {pricing.name} oferece boa relação custo-benefício para este tipo de análise</p>
            {totalCostUSD < 0.01 && (
              <p><strong>✅ Económico:</strong> Análise de baixo custo (menos de 1 centavo USD)</p>
            )}
          </div>
        </div>
        
        {model === 'gpt-4o' && totalCostUSD > 0.05 && (
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>💰 Sugestão:</strong> Para documentos grandes, considere usar GPT-4o Mini para economia de ~90% no custo
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
