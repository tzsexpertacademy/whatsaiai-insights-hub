
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAnalysisData } from '@/contexts/AnalysisDataContext';
import { Loader2, AlertCircle, Brain, Heart } from 'lucide-react';

export function Recommendations() {
  const { data, isLoading } = useAnalysisData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Conselhos e Recomendações</h1>
          <p className="text-slate-600">Sugestões personalizadas baseadas na análise dos assistentes</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (!data.hasRealData || data.recommendations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Conselhos e Recomendações</h1>
          <p className="text-slate-600">Sugestões personalizadas baseadas na análise dos assistentes</p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600">Nenhuma recomendação disponível</h3>
              <p className="text-gray-500 max-w-md">
                Para receber recomendações personalizadas dos seus assistentes, você precisa primeiro ter dados analisados.
              </p>
              <div className="text-left text-sm text-gray-600 space-y-1">
                <p>• Crie conversas de teste ou conecte seu WhatsApp</p>
                <p>• Execute a análise por IA no dashboard</p>
                <p>• Os assistentes irão gerar recomendações baseadas nos seus padrões</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-500 text-white border-0">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Como funciona?</h3>
            <p className="mb-6">
              Nossos assistentes especializados analisam suas conversas e comportamentos para gerar recomendações personalizadas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Oráculo das Sombras</h4>
                <p className="text-sm">Analisa aspectos psicológicos profundos e sugere práticas de autoconhecimento</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Guardião dos Recursos</h4>
                <p className="text-sm">Oferece conselhos sobre gestão financeira e organização pessoal</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Engenheiro do Corpo</h4>
                <p className="text-sm">Sugere melhorias em saúde física e bem-estar</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Espelho Social</h4>
                <p className="text-sm">Ajuda a melhorar relacionamentos e habilidades sociais</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Conselhos e Recomendações</h1>
        <p className="text-slate-600">Sugestões personalizadas baseadas na análise dos assistentes</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {data.recommendations.map((recommendation, index) => (
          <Card key={index} className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Recomendação {index + 1}</CardTitle>
                    <CardDescription>Baseada na análise dos assistentes</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">Personalizada</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">{recommendation}</p>
              <div className="flex justify-end">
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  Implementar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.recommendations.length > 0 && (
        <Card className="bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-500 text-white border-0">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Próxima Análise</h3>
            <p className="mb-6">
              Continue criando conversas e executando análises para receber novas recomendações personalizadas.
            </p>
            <Button size="lg" className="w-full bg-white text-blue-700 hover:bg-slate-100">
              <Heart className="mr-2 h-5 w-5" />
              Criar Nova Conversa de Teste
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
