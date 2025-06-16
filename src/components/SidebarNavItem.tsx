
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
}

export function SidebarNavItem({ title, url, icon: Icon, badge }: SidebarNavItemProps) {
  const location = useLocation();
  const { state } = useSidebar();
  const isActive = location.pathname === url;
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        asChild 
        tooltip={isCollapsed ? title : undefined}
        className={cn(
          "w-full h-10 px-3 rounded-lg transition-all duration-200",
          "hover:bg-blue-50 dark:hover:bg-gray-800",
          "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          isActive && "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
        )}
      >
        <Link to={url} className="flex items-center gap-3 w-full min-w-0 p-1">
          <Icon className={cn(
            "h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-colors",
            isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
          )} />
          {!isCollapsed && (
            <span className={cn(
              "font-medium text-xs sm:text-sm truncate transition-colors",
              isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
            )}>
              {title}
            </span>
          )}
          {badge && !isCollapsed && (
            <Badge className="ml-auto bg-green-100 text-green-800 text-xs">
              {badge}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
