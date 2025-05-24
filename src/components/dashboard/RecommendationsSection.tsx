
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, FileText, Heart, Loader2 } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

const recommendationIcons = [Brain, FileText, Heart];
const recommendationColors = [
  "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
  "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
  "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
];

export function RecommendationsSection() {
  const { data, isLoading } = useAnalysisData();

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle>Recomendações Personalizadas</CardTitle>
        <CardDescription>Sugestões baseadas na análise dos assistentes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.recommendations.map((recommendation, index) => {
              const IconComponent = recommendationIcons[index % recommendationIcons.length];
              const colorClass = recommendationColors[index % recommendationColors.length];
              
              return (
                <Button key={index} className={colorClass}>
                  <IconComponent className="h-4 w-4 mr-2" />
                  {recommendation}
                </Button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
