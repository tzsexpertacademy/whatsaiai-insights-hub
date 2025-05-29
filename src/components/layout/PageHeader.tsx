
import React from 'react';
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { responsiveTextClasses, responsiveContainerClasses, combineResponsiveClasses } from '@/utils/responsiveUtils';

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backUrl?: string;
  children?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  showBackButton = false, 
  backUrl = '/dashboard',
  children 
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className={combineResponsiveClasses(
        responsiveContainerClasses.content,
        "py-3 sm:py-4"
      )}>
        <div className={responsiveContainerClasses.flex.between}>
          {/* Left side - Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Menu Trigger */}
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-8 w-8 sm:h-9 sm:w-9" />
              
              {/* Back button for mobile */}
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(backUrl)}
                  className="p-2 h-8 w-8 sm:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Title and Description */}
            <div className="min-w-0 flex-1">
              <h1 className={combineResponsiveClasses(
                responsiveTextClasses.title.h2,
                "text-gray-900 truncate"
              )}>
                {title}
              </h1>
              {description && (
                <p className={combineResponsiveClasses(
                  responsiveTextClasses.description,
                  "hidden sm:block mt-1"
                )}>
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Back button for desktop */}
            {showBackButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(backUrl)}
                className="hidden sm:flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}
            {children}
          </div>
        </div>

        {/* Mobile description */}
        {description && (
          <p className={combineResponsiveClasses(
            responsiveTextClasses.description,
            "sm:hidden mt-2"
          )}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
