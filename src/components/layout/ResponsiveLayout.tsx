
import React from 'react';
import { responsiveContainerClasses, combineResponsiveClasses } from '@/utils/responsiveUtils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'page' | 'section' | 'content';
  padding?: 'small' | 'medium' | 'large';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}

export function ResponsiveLayout({ 
  children, 
  className = '', 
  variant = 'page',
  padding = 'medium',
  maxWidth = '7xl'
}: ResponsiveLayoutProps) {
  const baseClasses = {
    page: responsiveContainerClasses.page,
    section: responsiveContainerClasses.section,
    content: responsiveContainerClasses.content
  };

  const paddingClasses = {
    small: 'p-4 sm:p-6',
    medium: 'p-4 sm:p-6 lg:p-8',
    large: 'p-6 sm:p-8 lg:p-12'
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  const combinedClasses = combineResponsiveClasses(
    baseClasses[variant],
    variant === 'content' ? `${maxWidthClasses[maxWidth]} mx-auto` : '',
    variant !== 'content' ? paddingClasses[padding] : '',
    className
  );

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
}
