
import { Calendar, TrendingUp, TrendingDown, Target, Brain, Users, BarChart3, MessageSquare, FileText, Settings, User, Clock, AlertTriangle, Bell } from 'lucide-react';
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
  ];

  const analysisNavItems = [
    { title: 'Chat com Assistentes', icon: MessageSquare, url: '/dashboard/chat' },
    { title: 'WhatsApp Chat', icon: Users, url: '/dashboard/whatsapp' },
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
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Observatório IA</h1>
            <p className="text-xs text-muted-foreground">Análise Comportamental</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Análise Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarNavItem key={item.url} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Interação IA</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisNavItems.map((item) => (
                <SidebarNavItem key={item.url} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Insights e Ações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {standardNavItems.map((item) => (
                <SidebarNavItem key={item.url} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configNavItems.map((item) => (
                <SidebarNavItem key={item.url} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6">
        <SidebarSubscriptionStatus />
        
        <div className="text-center text-xs text-muted-foreground mt-4">
          <p>© {new Date().getFullYear()} Kairon Labs</p>
          <p>Inteligência Comportamental</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
