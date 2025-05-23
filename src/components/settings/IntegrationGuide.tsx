
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function IntegrationGuide() {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle>Como Funciona a Integração</CardTitle>
        <CardDescription>
          Entenda o fluxo de funcionamento do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
            <h3 className="font-medium text-blue-900 mb-1">Captura</h3>
            <p className="text-sm text-blue-700">Todas as conversas são capturadas automaticamente</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
            <h3 className="font-medium text-green-900 mb-1">Análise</h3>
            <p className="text-sm text-green-700">IA analisa padrões e comportamentos</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
            <h3 className="font-medium text-purple-900 mb-1">Insights</h3>
            <p className="text-sm text-purple-700">Dashboard exibe métricas e recomendações</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
