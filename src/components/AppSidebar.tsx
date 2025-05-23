
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
  Smartphone,
  Shield
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
  { title: "Painel Admin", url: "/admin/clients", icon: Shield },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";
  
  return (
    <Sidebar 
      className="border-r bg-white dark:bg-gray-900 shadow-lg"
      collapsible="icon"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800 flex-shrink-0">
            <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate">Observatório</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Insights Pessoais</p>
            </div>
          )}
        </div>
        <SidebarTrigger className="text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-white w-8 h-8 rounded-md transition-colors border border-gray-300 dark:border-gray-600" />
      </div>

      <SidebarContent className="px-2 py-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-800 dark:text-white font-semibold text-xs mb-2 px-2 uppercase tracking-wide">
            {!isCollapsed ? "PRINCIPAL" : ""}
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
          <SidebarGroupLabel className="text-gray-800 dark:text-white font-semibold text-xs mb-2 px-2 uppercase tracking-wide">
            {!isCollapsed ? "WHATSAPP" : ""}
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
          <SidebarGroupLabel className="text-gray-800 dark:text-white font-semibold text-xs mb-2 px-2 uppercase tracking-wide">
            {!isCollapsed ? "SISTEMA" : ""}
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
