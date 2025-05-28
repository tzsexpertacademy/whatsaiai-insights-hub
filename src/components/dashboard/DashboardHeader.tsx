
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Brain, 
  MessageSquare, 
  Settings, 
  User
} from 'lucide-react';
import { useAnalysisData } from '@/contexts/AnalysisDataContext';

export function DashboardHeader() {
  const navigate = useNavigate();
  const { data } = useAnalysisData();

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Trigger da Sidebar */}
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-gray-900">Observatório</h1>
              <p className="text-xs text-gray-500">Consciência Pessoal</p>
            </div>
          </div>

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
              onClick={() => navigate('/dashboard/chat')}
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
              onClick={() => navigate('/dashboard/settings')}
              className="text-gray-600 hover:text-gray-900"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {/* Profile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/profile')}
              className="text-gray-600 hover:text-gray-900"
            >
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
