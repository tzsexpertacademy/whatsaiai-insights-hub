
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Heart, Brain } from 'lucide-react';

const skillsData = [
  {
    title: "Comunicação",
    value: "82%",
    trend: "+6%",
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Inteligência Emocional",
    value: "75%",
    trend: "+12%",
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  {
    title: "Capacidade Analítica",
    value: "88%",
    trend: "+4%",
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  }
];

export function SkillsCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {skillsData.map((skill, index) => (
        <Card key={index} className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${skill.bgColor}`}>
                <skill.icon className={`h-5 w-5 ${skill.color}`} />
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
      ))}
    </div>
  );
}
