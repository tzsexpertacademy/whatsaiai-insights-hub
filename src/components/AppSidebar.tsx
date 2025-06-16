
import React from 'react';
import { Home, BarChart3, Settings, Brain, MessageSquare, Users, Calendar, BookOpen, UserCircle, LogOut, CreditCard } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarNavItem } from '@/components/SidebarNavItem';
import { SidebarSubscriptionStatus } from '@/components/SidebarSubscriptionStatus';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export function AppSidebar() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const mainItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home, end: true },
    { title: "Rotina", url: "/dashboard/routine", icon: Calendar },
    { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
    { title: "Chat", url: "/dashboard/chat", icon: MessageSquare },
    { title: "Observatório", url: "/dashboard/observatory", icon: Brain },
    { title: "Insights", url: "/dashboard/insights", icon: BookOpen },
  ];

  const configItems = [
    { title: "Configurações", url: "/dashboard/settings", icon: Settings },
    { title: "Perfil", url: "/dashboard/profile", icon: UserCircle },
  ];

  const handleSignOut = () => {
    // Implementar logout
    console.log('Logout solicitado');
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent className="flex flex-col h-full">
        <div className="flex-1">
          <SidebarGroup>
            <SidebarGroupLabel>Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarNavItem
                    key={item.url}
                    title={item.title}
                    url={item.url}
                    icon={item.icon}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Configurações</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {configItems.map((item) => (
                  <SidebarNavItem
                    key={item.url}
                    title={item.title}
                    url={item.url}
                    icon={item.icon}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarNavItem
                    title="Admin Panel"
                    url="/admin"
                    icon={Users}
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </div>

        {/* Status da Assinatura */}
        <div className="mt-auto">
          <SidebarSubscriptionStatus />
          
          {/* Logout */}
          <div className="p-3 border-t">
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Sair</span>}
            </button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
