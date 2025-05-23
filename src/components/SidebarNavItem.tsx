
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
                ? "bg-blue-600 text-white shadow-md font-semibold border border-blue-500" 
                : "text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 border border-transparent"
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
