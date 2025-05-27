
import React from 'react';
import { responsiveContainerClasses, combineResponsiveClasses } from '@/utils/responsiveUtils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: 'auto' | 2 | 3 | 4;
  gap?: 'small' | 'medium' | 'large';
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  columns = 'auto', 
  gap = 'medium',
  className = ''
}: ResponsiveGridProps) {
  const gridClasses = {
    auto: responsiveContainerClasses.grid.autoFit,
    2: responsiveContainerClasses.grid.twoColumns,
    3: responsiveContainerClasses.grid.threeColumns,
    4: responsiveContainerClasses.grid.fourColumns
  };

  const gapClasses = {
    small: 'gap-3 sm:gap-4',
    medium: 'gap-4 sm:gap-6',
    large: 'gap-6 sm:gap-8'
  };

  const combinedClasses = combineResponsiveClasses(
    gridClasses[columns],
    gapClasses[gap],
    className
  );

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
}
