
import React from 'react';
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AIAnalysisButton } from '@/components/AIAnalysisButton';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mapeamento de títulos das páginas
const pageTitles: { [key: string]: string } = {
  '/dashboard': 'Dashboard Principal',
  '/dashboard/thermometer': 'Termômetro Emocional',
  '/dashboard/areas': 'Áreas da Vida',
  '/dashboard/behavioral': 'Perfil Comportamental',
  '/dashboard/timeline': 'Linha do Tempo',
  '/dashboard/insights': 'Insights Personalizados',
  '/dashboard/recommendations': 'Recomendações',
  '/dashboard/pain-points': 'Pontos de Dor',
  '/dashboard/documents': 'Análise de Documentos',
  '/dashboard/settings': 'Configurações',
  '/dashboard/profile': 'Meu Perfil',
};

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPageTitle = pageTitles[location.pathname] || 'Observatório';

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.clear();
      sessionStorage.clear();
      navigate('/auth');
      window.location.href = '/auth';
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso"
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/auth';
      toast({
        title: "Logout realizado",
        description: "Sessão encerrada",
        variant: "default"
      });
    }
  };

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
  };

  return (
    <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </SidebarTrigger>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">
              {currentPageTitle}
            </h1>
            <p className="text-sm text-slate-600">
              Bem-vindo, {user?.email?.split('@')[0] || 'Usuário'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão de Análise por IA */}
          <AIAnalysisButton variant="outline" size="sm" />

          {/* Menu do usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-blue-500 text-white text-sm">
                    {user?.email ? user.email.slice(0, 2).toUpperCase() : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email?.split('@')[0] || 'Usuário'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
