
import React from 'react';
import { PageHeader } from './PageHeader';
import { responsiveContainerClasses, combineResponsiveClasses } from '@/utils/responsiveUtils';

interface PageLayoutProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backUrl?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ 
  title, 
  description, 
  showBackButton = false,
  backUrl = '/dashboard',
  headerActions,
  children,
  className = ''
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-x-hidden">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
          {headerActions && (
            <div className="mt-4">
              {headerActions}
            </div>
          )}
        </div>
        
        <main className={combineResponsiveClasses(
          responsiveContainerClasses.content,
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
