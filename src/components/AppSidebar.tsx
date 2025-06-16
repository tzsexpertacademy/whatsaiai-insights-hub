
import { Brain, BarChart3, MessageSquare, Target, Zap, Clock, Heart, Users, Settings, User, Bell, Lightbulb } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { SidebarNavItem } from '@/components/SidebarNavItem';
import { SidebarSubscriptionStatus } from '@/components/SidebarSubscriptionStatus';
import { DynamicAreasDisplay } from '@/components/DynamicAreasDisplay';

export function AppSidebar() {
  const mainAnalysisItems = [
    { title: 'Dashboard Geral', icon: BarChart3, url: '/dashboard' },
    { title: 'Análise de Conversas', icon: MessageSquare, url: '/dashboard/conversation-analysis' },
  ];

  const consciousnessAreas = [
    { title: 'Consciência e Propósito', icon: Lightbulb, url: '/dashboard/consciencia-proposito' },
    { title: 'Ação e Produtividade', icon: Zap, url: '/dashboard/acao-produtividade' },
    { title: 'Gestão de Recursos', icon: Target, url: '/dashboard/gestao-recursos' },
    { title: 'Corpo e Vitalidade', icon: Heart, url: '/dashboard/corpo-vitalidade' },
    { title: 'Relações e Impacto Social', icon: Users, url: '/dashboard/relacoes-impacto' },
  ];

  const interactionItems = [
    { title: 'Chat com Assistentes', icon: Brain, url: '/dashboard/chat' },
  ];

  const systemItems = [
    { title: 'Linha do Tempo', icon: Clock, url: '/dashboard/timeline' },
    { title: 'Notificações', icon: Bell, url: '/dashboard/notifications' },
    { title: 'Configurações', icon: Settings, url: '/dashboard/settings' },
    { title: 'Perfil', icon: User, url: '/dashboard/profile' },
  ];

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-lg text-gray-900 truncate">YumerMind</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Interface para a Mente</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 sm:px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs sm:text-sm px-2 py-2">Análise Central</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainAnalysisItems.map((item) => (
                <SidebarNavItem key={item.url} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs sm:text-sm px-2 py-2">Dimensões da Consciência</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {consciousnessAreas.map((item) => (
                <SidebarNavItem key={item.url} {...item} />
              ))}
            </SidebarMenu>
            {/* Áreas Personalizadas Dinâmicas */}
            <DynamicAreasDisplay />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs sm:text-sm px-2 py-2">Interação IA</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {interactionItems.map((item) => (
                <SidebarNavItem key={item.url} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs sm:text-sm px-2 py-2">Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {systemItems.map((item) => (
                <SidebarNavItem key={item.url} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 sm:p-6 border-t border-gray-100">
        <SidebarSubscriptionStatus />
        
        <div className="text-center text-xs text-muted-foreground mt-3 sm:mt-4">
          <p className="truncate">© {new Date().getFullYear()} Kairon Labs</p>
          <p className="hidden sm:block">Interface para a Mente</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
