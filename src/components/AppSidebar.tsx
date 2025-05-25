import { Brain, BarChart3, User, Heart, Target, MessageSquare, Settings, UserCircle, Users, FileSearch, ArrowLeft, Clock } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const mainNavItems = [
    { title: 'Dashboard', icon: BarChart3, url: '/dashboard/' },
    { title: 'Áreas da Vida', icon: Target, url: '/dashboard/areas' },
    { title: 'Perfil Comportamental', icon: Brain, url: '/dashboard/profile' },
    { title: 'Termômetro Emocional', icon: Heart, url: '/dashboard/emotions' },
    { title: 'Linha do Tempo', icon: Clock, url: '/dashboard/timeline' },
    { title: 'Recomendações', icon: MessageSquare, url: '/dashboard/recommendations' },
  ];

  const analysisNavItems = [
    { title: 'Análise e Conselho', icon: FileSearch, url: '/dashboard/analysis' },
  ];

  const configNavItems = [
    { title: 'Conexão WhatsApp', icon: MessageSquare, url: '/dashboard/connection' },
    { title: 'Configurações', icon: Settings, url: '/dashboard/settings' },
    { title: 'Perfil', icon: UserCircle, url: '/dashboard/user-profile' },
  ];

  const isAdmin = user?.email === 'admin@kairon.ai';

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Observatório da Consciência</h1>
            <p className="text-xs text-muted-foreground">Análise Comportamental</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/')}
          className="w-full justify-start"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Hub
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <SidebarNavItem {...item} />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Análise e Conselho</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
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
                <SidebarMenuItem key={item.url}>
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
                    <SidebarNavItem title="Gerenciar Clientes" icon={Users} url="/dashboard/admin/clients" />
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
