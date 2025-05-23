
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
    <Sidebar className={`${sidebar.open ? "w-64" : "w-14"} border-r border-white/20 bg-gradient-to-b from-indigo-900 via-blue-900 to-slate-900 backdrop-blur-xl`}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="h-8 w-8 text-indigo-400" />
          {sidebar.open && (
            <h2 className="text-xl font-bold text-white">Observatório</h2>
          )}
        </div>
        <SidebarTrigger className="text-white hover:bg-white/10 self-end mb-4" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-indigo-300 font-medium">
            {sidebar.open && "Dashboard"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
          <SidebarGroupLabel className="text-indigo-300 font-medium">
            {sidebar.open && "WhatsApp"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
          <SidebarGroupLabel className="text-indigo-300 font-medium">
            {sidebar.open && "Sistema"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
