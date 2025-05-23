
import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Brain,
  Home,
  User,
  Heart,
  Timer,
  FileText,
  Settings,
  MessageCircle,
  Smartphone
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarNavItem } from "@/components/SidebarNavItem";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Áreas da Vida", url: "/areas", icon: Heart },
  { title: "Perfil Comportamental", url: "/profile", icon: User },
  { title: "Termômetro Emocional", url: "/emotions", icon: Timer },
  { title: "Conselhos e Recomendações", url: "/recommendations", icon: FileText },
];

const whatsappItems = [
  { title: "Conexão WhatsApp", url: "/connection", icon: Smartphone },
  { title: "Chat Interface", url: "/chat", icon: MessageCircle },
];

const configItems = [
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const sidebar = useSidebar();
  const location = useLocation();
  
  return (
    <Sidebar className={`${sidebar.open ? "w-64" : "w-16"} transition-all duration-300 border-r border-border/50 bg-gradient-to-b from-background via-background/95 to-background/90 backdrop-blur-xl shadow-lg`}>
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          {sidebar.open && (
            <div>
              <h2 className="text-lg font-bold text-foreground">Observatório</h2>
              <p className="text-xs text-muted-foreground">Insights Pessoais</p>
            </div>
          )}
        </div>
        <SidebarTrigger className="text-foreground hover:bg-accent hover:text-accent-foreground w-8 h-8 rounded-md transition-colors" />
      </div>

      <SidebarContent className="px-3 py-4 space-y-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold text-sm mb-3 px-2">
            {sidebar.open ? "Principal" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarNavItem 
                  key={item.title}
                  title={item.title} 
                  url={item.url} 
                  icon={item.icon} 
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold text-sm mb-3 px-2">
            {sidebar.open ? "WhatsApp" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {whatsappItems.map((item) => (
                <SidebarNavItem 
                  key={item.title}
                  title={item.title} 
                  url={item.url} 
                  icon={item.icon} 
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold text-sm mb-3 px-2">
            {sidebar.open ? "Sistema" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {configItems.map((item) => (
                <SidebarNavItem 
                  key={item.title}
                  title={item.title} 
                  url={item.url} 
                  icon={item.icon} 
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
