
import React from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <SidebarTrigger className="h-8 w-8 p-1 flex items-center justify-center">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
          </div>
          
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {children && (
          <div className="flex items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
