
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  MessageSquare, 
  Settings, 
  User,
  BarChart3,
  Heart,
  Target,
  Lightbulb,
  Calendar,
  Eye,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function DashboardHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useAnalysisData();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/thermometer', label: 'Termômetro', icon: Heart },
    { path: '/areas', label: 'Áreas da Vida', icon: Target },
    { path: '/behavioral', label: 'Comportamental', icon: Brain },
    { path: '/timeline', label: 'Timeline', icon: Calendar },
    { path: '/insights', label: 'Insights', icon: Lightbulb },
    { path: '/recommendations', label: 'Recomendações', icon: Eye },
    { path: '/pain-points', label: 'Pontos de Dor', icon: AlertTriangle },
    { path: '/documents', label: 'Documentos', icon: FileText },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-gray-900">Observatório</h1>
              <p className="text-xs text-gray-500">Consciência Pessoal</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 ${
                  isActive(item.path) 
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden xl:inline">{item.label}</span>
              </Button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <Badge 
              className={data.hasRealData ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
            >
              {data.hasRealData ? "Ativo" : "Aguardando"}
            </Badge>

            {/* Chat Button */}
            <Button 
              onClick={() => navigate('/chat')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Chat</span>
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="text-gray-600 hover:text-gray-900"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {/* Profile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="text-gray-600 hover:text-gray-900"
            >
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-gray-200">
          <nav className="flex overflow-x-auto py-2 space-x-1">
            {menuItems.slice(0, 6).map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className={`flex-shrink-0 flex items-center gap-2 ${
                  isActive(item.path) 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
