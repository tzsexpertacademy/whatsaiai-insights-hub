
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Eye, 
  Heart, 
  Target, 
  Brain, 
  Calendar,
  Lightbulb,
  AlertTriangle,
  FileText,
  Settings,
  User,
  Activity
} from 'lucide-react';

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3, description: "Visão geral" },
  { title: "Termômetro Emocional", url: "/dashboard/thermometer", icon: Heart, description: "Estados emocionais" },
  { title: "Áreas da Vida", url: "/dashboard/areas", icon: Target, description: "Mapeamento completo" },
  { title: "Perfil Comportamental", url: "/dashboard/behavioral", icon: Brain, description: "Análise psicológica" },
  { title: "Linha do Tempo", url: "/dashboard/timeline", icon: Calendar, description: "Evolução pessoal" },
];

const analysisItems = [
  { title: "Insights", url: "/dashboard/insights", icon: Lightbulb, description: "Descobertas personalizadas" },
  { title: "Recomendações", url: "/dashboard/recommendations", icon: Eye, description: "Sugestões de crescimento" },
  { title: "Pontos de Dor", url: "/dashboard/pain-points", icon: AlertTriangle, description: "Áreas de atenção" },
  { title: "Documentos", url: "/dashboard/documents", icon: FileText, description: "Análise de conversas" },
];

const configItems = [
  { title: "Configurações", url: "/dashboard/settings", icon: Settings, description: "Configurar sistema" },
  { title: "Perfil", url: "/dashboard/profile", icon: User, description: "Dados pessoais" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === "collapsed";
  
  const getNavCls = (path: string) =>
    isActive(path) 
      ? "bg-blue-100 text-blue-900 font-medium border-r-2 border-blue-600" 
      : "hover:bg-gray-100 text-gray-700";

  return (
    <Sidebar className="border-r border-gray-200 bg-white" collapsible="icon">
      <SidebarContent className="bg-white">
        {/* Header fixo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h2 className="font-bold text-gray-900 truncate">Observatório</h2>
                <p className="text-xs text-gray-500 truncate">Consciência Pessoal</p>
              </div>
            )}
          </div>
          <SidebarTrigger className="absolute top-4 right-4" />
        </div>

        {/* Status fixo */}
        {!isCollapsed && (
          <div className="p-4 bg-green-50 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-600 flex-shrink-0" />
              <Badge className="bg-green-100 text-green-800 text-xs">Sistema Operacional</Badge>
            </div>
            <p className="text-xs text-green-700">Pronto para análise</p>
          </div>
        )}

        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium px-4 py-2">
            {isCollapsed ? "📊" : "📊 Principais"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`${getNavCls(item.url)} p-3 flex items-center gap-3 rounded-lg mx-2 transition-colors`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 truncate">{item.description}</p>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu de Análises */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium px-4 py-2">
            {isCollapsed ? "🧠" : "🧠 Análises"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`${getNavCls(item.url)} p-3 flex items-center gap-3 rounded-lg mx-2 transition-colors`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 truncate">{item.description}</p>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu de Configurações */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium px-4 py-2">
            {isCollapsed ? "⚙️" : "⚙️ Sistema"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`${getNavCls(item.url)} p-3 flex items-center gap-3 rounded-lg mx-2 transition-colors`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 truncate">{item.description}</p>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
