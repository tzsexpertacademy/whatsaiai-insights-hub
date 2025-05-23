
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const isOpen = sidebar.open;

  console.log(`SidebarNavItem ${title} - current location:`, location.pathname, 'url:', url);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink 
          to={url} 
          className={({ isActive }) => {
            console.log(`NavLink ${title} - isActive:`, isActive);
            return `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group w-full ${
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg font-semibold" 
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            }`;
          }}
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
