
import { TrendingUp, TrendingDown, Target, Brain, Users, BarChart3, ArrowLeft, DollarSign, Settings } from 'lucide-react';
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
import { SidebarNavItem } from '@/components/SidebarNavItem';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export function CommercialSidebar() {
  const navigate = useNavigate();

  const mainNavItems = [
    { title: 'Dashboard Comercial', icon: BarChart3, url: '/commercial/' },
    { title: 'Análise de Funil', icon: TrendingDown, url: '/commercial/funnel' },
    { title: 'Performance de Vendas', icon: TrendingUp, url: '/commercial/performance' },
    { title: 'Métricas Comportamentais', icon: Brain, url: '/commercial/behavioral' },
    { title: 'Cultura do Time', icon: Users, url: '/commercial/culture' },
    { title: 'Métricas Estratégicas', icon: Target, url: '/commercial/strategic' },
  ];

  const configNavItems = [
    { title: 'Configurações', icon: Settings, url: '/commercial/settings' },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Cérebro Comercial</h1>
            <p className="text-xs text-muted-foreground">O Gerador de Receita</p>
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
          <SidebarGroupLabel>Análise Comercial</SidebarGroupLabel>
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
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
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
      </SidebarContent>

      <SidebarFooter className="p-6">
        <div className="text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Kairon Labs</p>
          <p>Inteligência Comercial para Receita</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
