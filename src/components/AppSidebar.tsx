
import React from 'react';
import { Home, BarChart3, Settings, Brain, MessageSquare, Users, Calendar, BookOpen, UserCircle, LogOut, CreditCard } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarNavItem } from '@/components/SidebarNavItem';
import { SidebarSubscriptionStatus } from '@/components/SidebarSubscriptionStatus';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export function AppSidebar() {
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const { collapsed } = useSidebar();

  const mainItems = [
    { to: "/dashboard", icon: Home, label: "Dashboard", end: true },
    { to: "/dashboard/routine", icon: Calendar, label: "Rotina" },
    { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/dashboard/chat", icon: MessageSquare, label: "Chat" },
    { to: "/dashboard/observatory", icon: Brain, label: "Observatório" },
    { to: "/dashboard/insights", icon: BookOpen, label: "Insights" },
  ];

  const configItems = [
    { to: "/dashboard/settings", icon: Settings, label: "Configurações" },
    { to: "/dashboard/profile", icon: UserCircle, label: "Perfil" },
  ];

  const isActive = (path: string, end?: boolean) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = (path: string, end?: boolean) => {
    const baseClasses = "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary";
    const activeClasses = "bg-muted text-primary";
    
    return isActive(path, end) ? `${baseClasses} ${activeClasses}` : baseClasses;
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible>
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent className="flex flex-col h-full">
        <div className="flex-1">
          <SidebarGroup>
            <SidebarGroupLabel>Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarNavItem
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    end={item.end}
                    collapsed={collapsed}
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
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    collapsed={collapsed}
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
                    to="/admin"
                    icon={Users}
                    label="Admin Panel"
                    collapsed={collapsed}
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </div>

        {/* Status da Assinatura */}
        <div className="mt-auto">
          <SidebarSubscriptionStatus collapsed={collapsed} />
          
          {/* Logout */}
          <div className="p-3 border-t">
            <button
              onClick={signOut}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sair</span>}
            </button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
