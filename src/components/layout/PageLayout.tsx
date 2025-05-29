
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
      <PageHeader 
        title={title}
        description={description}
        showBackButton={showBackButton}
        backUrl={backUrl}
      >
        {headerActions}
      </PageHeader>
      
      <main className={combineResponsiveClasses(
        responsiveContainerClasses.content,
        responsiveContainerClasses.section,
        className
      )}>
        {children}
      </main>
    </div>
  );
}
