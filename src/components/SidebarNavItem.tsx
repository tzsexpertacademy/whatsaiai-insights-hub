
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  title: string;
  url: string;
  icon: LucideIcon;
}

export function SidebarNavItem({ title, url, icon: Icon }: SidebarNavItemProps) {
  const location = useLocation();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isActive = location.pathname === url;
  const isCollapsed = state === "collapsed";

  const handleClick = () => {
    // Fechar o menu no mobile após clicar em um item
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        asChild 
        tooltip={isCollapsed ? title : undefined}
        className={cn(
          "w-full h-10 px-3 rounded-lg transition-all duration-200",
          "hover:bg-blue-50 dark:hover:bg-gray-800",
          "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2",
          isActive && "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
        )}
      >
        <Link to={url} className="flex items-center gap-3 w-full min-w-0" onClick={handleClick}>
          <Icon className={cn(
            "h-5 w-5 flex-shrink-0 transition-colors",
            isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
          )} />
          {!isCollapsed && (
            <span className={cn(
              "font-medium text-sm truncate transition-colors",
              isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
            )}>
              {title}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
