
import React from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export function DashboardHeader() {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/50';
      case 'premium': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/50';
      case 'enterprise': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/50';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  // Função para formatar a data com segurança
  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return '';
    
    // Se for string, converter para Date
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Verificar se é uma data válida
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    try {
      return dateObj.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
  };

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b border-border/50 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Bem-vindo, {user?.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPlanColor(user?.plan || 'basic')}`}>
                Plano {user?.plan?.toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground">
                Cliente desde {user?.createdAt ? formatDate(user.createdAt) : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                    {getInitials(user?.name || 'U')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 dark:text-red-400">
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
