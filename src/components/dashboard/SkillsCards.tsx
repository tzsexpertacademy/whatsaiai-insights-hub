
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Heart, Brain, Loader2 } from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

const skillIcons = [User, Heart, Brain];
const skillColors = [
  { color: "text-blue-600", bgColor: "bg-blue-50" },
  { color: "text-red-600", bgColor: "bg-red-50" },
  { color: "text-purple-600", bgColor: "bg-purple-50" }
];

export function SkillsCards() {
  const { data, isLoading } = useAnalysisData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="p-6 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {data.skillsData.map((skill, index) => {
        const IconComponent = skillIcons[index % skillIcons.length];
        const colors = skillColors[index % skillColors.length];
        
        return (
          <Card key={index} className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${colors.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${colors.color}`} />
                </div>
                {skill.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-slate-800">{skill.value}</p>
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  {skill.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
