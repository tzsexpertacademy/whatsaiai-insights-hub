import { Calendar, TrendingUp, TrendingDown, Target, Brain, Users, BarChart3, MessageSquare, FileText, Settings, User, Clock, AlertTriangle, Bell, Phone } from 'lucide-react';
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

export function AppSidebar() {
  const mainNavItems = [
    { title: 'Dashboard', icon: BarChart3, url: '/dashboard' },
    { title: 'Termômetro Emocional', icon: TrendingUp, url: '/dashboard/thermometer' },
    { title: 'Áreas da Vida', icon: Target, url: '/dashboard/areas' },
    { title: 'Perfil Comportamental', icon: Brain, url: '/dashboard/behavioral' },
    { title: 'Análise de Conversas', icon: MessageSquare, url: '/dashboard/conversation-analysis' },
  ];

  const analysisNavItems = [
    { title: 'Chat com Assistentes', icon: MessageSquare, url: '/dashboard/chat' },
    { title: 'WhatsApp Chat', icon: Phone, url: '/dashboard/settings?tab=whatsapp&subtab=chat' },
  ];

  const standardNavItems = [
    { title: 'Linha do Tempo', icon: Clock, url: '/dashboard/timeline' },
    { title: 'Insights', icon: TrendingUp, url: '/dashboard/insights' },
    { title: 'Recomendações', icon: Target, url: '/dashboard/recommendations' },
    { title: 'Pontos de Dor', icon: AlertTriangle, url: '/dashboard/pain-points' },
    { title: 'Minha Rotina', icon: Calendar, url: '/dashboard/routine' },
    { title: 'Documentos', icon: FileText, url: '/dashboard/documents' },
  ];

  const configNavItems = [
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
            <p className="text-xs text-muted-foreground hidden sm:block">Análise Comportamental</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 sm:px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs sm:text-sm px-2 py-2">Análise Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavItems.map((item) => (
                <SidebarNavItem key={item.url} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs sm:text-sm px-2 py-2">Interação IA</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {analysisNavItems.map((item) => (
                <SidebarNavItem key={item.url} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs sm:text-sm px-2 py-2">Insights e Ações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {standardNavItems.map((item) => (
                <SidebarNavItem key={item.url} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs sm:text-sm px-2 py-2">Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {configNavItems.map((item) => (
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
          <p className="hidden sm:block">Inteligência Comportamental</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
