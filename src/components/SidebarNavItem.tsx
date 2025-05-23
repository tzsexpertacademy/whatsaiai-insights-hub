
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface SidebarNavItemProps {
  title: string;
  url: string;
  icon: LucideIcon;
}

export function SidebarNavItem({ title, url, icon: Icon }: SidebarNavItemProps) {
  const sidebar = useSidebar();
  const isOpen = sidebar.open;

  return (
    <SidebarMenuItem key={title}>
      <SidebarMenuButton asChild>
        <NavLink 
          to={url} 
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
            isActive 
              ? "bg-indigo-500/30 text-white border border-indigo-400/30" 
              : "text-indigo-200 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Icon className="h-5 w-5" />
          {isOpen && <span className="font-medium">{title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
