
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
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink 
          to={url} 
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
            ${isActive 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]" 
              : "text-foreground hover:bg-accent hover:text-accent-foreground hover:scale-[1.01] hover:shadow-md"
            }
          `}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {isOpen && (
            <span className="font-medium text-sm truncate">{title}</span>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
