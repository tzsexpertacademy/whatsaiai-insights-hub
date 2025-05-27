
import React from 'react';

/**
 * Utilitários para padrões de responsividade consistentes no projeto
 */

// Classes padrão para containers responsivos
export const responsiveContainerClasses = {
  // Container principal com overflow controlado
  page: "min-h-screen overflow-x-hidden",
  
  // Container de conteúdo com padding responsivo
  content: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8",
  
  // Container de seção
  section: "space-y-4 sm:space-y-6 w-full overflow-x-hidden",
  
  // Grid responsivo padrão
  grid: {
    twoColumns: "grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6",
    threeColumns: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
    fourColumns: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6",
    autoFit: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
  },
  
  // Flex responsivo
  flex: {
    column: "flex flex-col gap-4",
    row: "flex flex-col sm:flex-row gap-4",
    between: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
    center: "flex flex-col items-center justify-center gap-4",
    wrap: "flex flex-wrap items-center gap-3"
  }
};

// Classes padrão para texto responsivo
export const responsiveTextClasses = {
  // Títulos principais
  title: {
    h1: "text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight",
    h2: "text-xl sm:text-2xl lg:text-3xl font-bold leading-tight",
    h3: "text-lg sm:text-xl lg:text-2xl font-bold leading-tight",
    h4: "text-base sm:text-lg lg:text-xl font-bold leading-tight"
  },
  
  // Texto de corpo
  body: {
    large: "text-base sm:text-lg lg:text-xl leading-relaxed",
    medium: "text-sm sm:text-base lg:text-lg leading-relaxed",
    small: "text-xs sm:text-sm lg:text-base leading-relaxed"
  },
  
  // Descrições
  description: "text-slate-600 text-sm sm:text-base break-words",
  
  // Labels
  label: "text-xs sm:text-sm font-medium"
};

// Classes padrão para espaçamento responsivo
export const responsiveSpacingClasses = {
  // Padding interno
  padding: {
    small: "p-3 sm:p-4 lg:p-6",
    medium: "p-4 sm:p-6 lg:p-8",
    large: "p-6 sm:p-8 lg:p-12"
  },
  
  // Margin entre elementos
  margin: {
    small: "mb-3 sm:mb-4 lg:mb-6",
    medium: "mb-4 sm:mb-6 lg:mb-8",
    large: "mb-6 sm:mb-8 lg:mb-12"
  },
  
  // Gap entre elementos
  gap: {
    small: "gap-2 sm:gap-3",
    medium: "gap-3 sm:gap-4 lg:gap-6",
    large: "gap-4 sm:gap-6 lg:gap-8"
  }
};

// Classes padrão para botões responsivos
export const responsiveButtonClasses = {
  // Tamanhos de botão
  size: {
    small: "px-3 py-2 text-sm sm:px-4 sm:py-2 sm:text-base",
    medium: "px-4 py-3 text-base sm:px-6 sm:py-3 sm:text-lg",
    large: "px-6 py-4 text-lg sm:px-8 sm:py-4 sm:text-xl"
  },
  
  // Botão full width responsivo
  fullWidth: "w-full sm:w-auto",
  
  // Ícones em botões
  icon: {
    small: "w-4 h-4 sm:w-5 sm:h-5",
    medium: "w-5 h-5 sm:w-6 sm:h-6",
    large: "w-6 h-6 sm:w-8 sm:h-8"
  }
};

// Classes padrão para cards responsivos
export const responsiveCardClasses = {
  // Card básico
  base: "bg-white/80 backdrop-blur-sm border-0 rounded-lg shadow-sm hover:shadow-md transition-all duration-300",
  
  // Padding interno do card
  padding: "p-4 sm:p-6 lg:p-8",
  
  // Header do card
  header: "pb-3 sm:pb-4 lg:pb-6",
  
  // Content do card
  content: "space-y-3 sm:space-y-4"
};

// Função helper para combinar classes responsivas
export function combineResponsiveClasses(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Hook para detectar tamanho da tela
export function useScreenSize() {
  const [screenSize, setScreenSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  });

  React.useEffect(() => {
    function handleResize() {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}

// Constantes para breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;
