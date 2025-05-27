
import React from 'react';
import { responsiveTextClasses, combineResponsiveClasses } from '@/utils/responsiveUtils';

interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body-large' | 'body-medium' | 'body-small' | 'description' | 'label';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function ResponsiveText({ 
  children, 
  variant = 'body-medium', 
  className = '',
  as 
}: ResponsiveTextProps) {
  const textClasses = {
    h1: responsiveTextClasses.title.h1,
    h2: responsiveTextClasses.title.h2,
    h3: responsiveTextClasses.title.h3,
    h4: responsiveTextClasses.title.h4,
    'body-large': responsiveTextClasses.body.large,
    'body-medium': responsiveTextClasses.body.medium,
    'body-small': responsiveTextClasses.body.small,
    description: responsiveTextClasses.description,
    label: responsiveTextClasses.label
  };

  const combinedClasses = combineResponsiveClasses(
    textClasses[variant],
    className
  );

  const defaultElements = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    'body-large': 'p',
    'body-medium': 'p',
    'body-small': 'p',
    description: 'p',
    label: 'span'
  };

  const Element = as || defaultElements[variant] || 'p';

  return React.createElement(Element, { className: combinedClasses }, children);
}
