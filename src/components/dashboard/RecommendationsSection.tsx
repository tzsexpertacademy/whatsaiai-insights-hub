
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, FileText, Heart } from 'lucide-react';

export function RecommendationsSection() {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle>Recomendações Personalizadas</CardTitle>
        <CardDescription>Sugestões baseadas na análise dos assistentes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
            <Brain className="h-4 w-4 mr-2" />
            Desenvolver Autocompaixão
          </Button>
          <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
            <FileText className="h-4 w-4 mr-2" />
            Praticar Journaling Diário
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
            <Heart className="h-4 w-4 mr-2" />
            Revisitar Metas Financeiras
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
