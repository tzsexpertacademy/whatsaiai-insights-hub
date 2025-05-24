import { Brain, BarChart3, User, Heart, Target, MessageSquare, Settings, UserCircle, Users, FileSearch } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { SidebarNavItem } from './SidebarNavItem';
import { useAuth } from '@/contexts/AuthContext';

export function AppSidebar() {
  const { user } = useAuth();

  const mainNavItems = [
    { title: 'Dashboard', icon: BarChart3, href: '/' },
    { title: 'Áreas da Vida', icon: Target, href: '/areas' },
    { title: 'Perfil Comportamental', icon: Brain, href: '/profile' },
    { title: 'Termômetro Emocional', icon: Heart, href: '/emotions' },
    { title: 'Recomendações', icon: MessageSquare, href: '/recommendations' },
    { title: 'Análise de Documentos', icon: FileSearch, href: '/document-analysis' },
  ];

  const configNavItems = [
    { title: 'Conexão WhatsApp', icon: MessageSquare, href: '/connection' },
    { title: 'Chat com IA', icon: Brain, href: '/chat' },
    { title: 'Configurações', icon: Settings, href: '/settings' },
    { title: 'Perfil', icon: UserCircle, href: '/user-profile' },
  ];

  const isAdmin = user?.email === 'admin@kairon.ai';

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">LifeSync AI</h1>
            <p className="text-xs text-muted-foreground">Insights Inteligentes</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <SidebarNavItem {...item} />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <SidebarNavItem {...item} />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <SidebarNavItem title="Gerenciar Clientes" icon={Users} href="/admin/clients" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-6">
        <div className="text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Kairon Labs</p>
          <p>Inteligência Artificial para o seu bem-estar</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
