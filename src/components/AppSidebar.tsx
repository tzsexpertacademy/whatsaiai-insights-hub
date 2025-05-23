
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  MessageCircle, 
  BarChart3, 
  Zap, 
  Bot,
  Settings,
  Home
} from 'lucide-react';
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

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Conexão WhatsApp", url: "/connection", icon: Zap },
  { title: "Chat", url: "/chat", icon: MessageCircle },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={`${collapsed ? "w-14" : "w-64"} border-r border-white/20 bg-gradient-to-b from-indigo-900 via-blue-900 to-slate-900 backdrop-blur-xl`}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <Bot className="h-8 w-8 text-indigo-400" />
          {!collapsed && (
            <h2 className="text-xl font-bold text-white">WhatsApp AI</h2>
          )}
        </div>
        <SidebarTrigger className="text-white hover:bg-white/10 self-end mb-4" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-indigo-300 font-medium">
            {!collapsed && "Navegação"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive(item.url) 
                          ? "bg-indigo-500/30 text-white border border-indigo-400/30" 
                          : "text-indigo-200 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
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
