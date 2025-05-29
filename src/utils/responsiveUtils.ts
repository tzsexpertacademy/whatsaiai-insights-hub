
import React from 'react';

/**
 * Utilitários para padrões de responsividade consistentes no projeto
 */

// Classes padrão para containers responsivos
export const responsiveContainerClasses = {
  // Container principal com overflow controlado
  page: "min-h-screen overflow-x-hidden",
  
  // Container de conteúdo com padding responsivo otimizado para mobile
  content: "max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8",
  
  // Container de seção
  section: "space-y-3 sm:space-y-4 md:space-y-6 w-full overflow-x-hidden",
  
  // Grid responsivo padrão
  grid: {
    twoColumns: "grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6",
    threeColumns: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6",
    fourColumns: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6",
    autoFit: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
  },
  
  // Flex responsivo
  flex: {
    column: "flex flex-col gap-3 sm:gap-4",
    row: "flex flex-col sm:flex-row gap-3 sm:gap-4",
    between: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4",
    center: "flex flex-col items-center justify-center gap-3 sm:gap-4",
    wrap: "flex flex-wrap items-center gap-2 sm:gap-3"
  }
};

// Classes padrão para texto responsivo
export const responsiveTextClasses = {
  // Títulos principais
  title: {
    h1: "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight",
    h2: "text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-tight",
    h3: "text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-tight",
    h4: "text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-tight"
  },
  
  // Texto de corpo
  body: {
    large: "text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed",
    medium: "text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed",
    small: "text-xs sm:text-sm leading-relaxed"
  },
  
  // Descrições
  description: "text-slate-600 text-xs sm:text-sm md:text-base break-words",
  
  // Labels
  label: "text-xs sm:text-sm font-medium"
};

// Classes padrão para espaçamento responsivo
export const responsiveSpacingClasses = {
  // Padding interno
  padding: {
    small: "p-2 sm:p-3 md:p-4 lg:p-6",
    medium: "p-3 sm:p-4 md:p-6 lg:p-8",
    large: "p-4 sm:p-6 md:p-8 lg:p-12"
  },
  
  // Margin entre elementos
  margin: {
    small: "mb-2 sm:mb-3 md:mb-4 lg:mb-6",
    medium: "mb-3 sm:mb-4 md:mb-6 lg:mb-8",
    large: "mb-4 sm:mb-6 md:mb-8 lg:mb-12"
  },
  
  // Gap entre elementos
  gap: {
    small: "gap-1 sm:gap-2 md:gap-3",
    medium: "gap-2 sm:gap-3 md:gap-4 lg:gap-6",
    large: "gap-3 sm:gap-4 md:gap-6 lg:gap-8"
  }
};

// Classes padrão para botões responsivos
export const responsiveButtonClasses = {
  // Tamanhos de botão
  size: {
    small: "px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm",
    medium: "px-3 py-2 text-sm sm:px-4 sm:py-3 sm:text-base",
    large: "px-4 py-3 text-base sm:px-6 sm:py-4 sm:text-lg"
  },
  
  // Botão full width responsivo
  fullWidth: "w-full sm:w-auto",
  
  // Ícones em botões
  icon: {
    small: "w-3 h-3 sm:w-4 sm:h-4",
    medium: "w-4 h-4 sm:w-5 sm:h-5",
    large: "w-5 h-5 sm:w-6 sm:h-6"
  }
};

// Classes padrão para cards responsivos
export const responsiveCardClasses = {
  // Card básico
  base: "bg-white/80 backdrop-blur-sm border-0 rounded-lg shadow-sm hover:shadow-md transition-all duration-300",
  
  // Padding interno do card
  padding: "p-3 sm:p-4 md:p-6 lg:p-8",
  
  // Header do card
  header: "pb-2 sm:pb-3 md:pb-4 lg:pb-6",
  
  // Content do card
  content: "space-y-2 sm:space-y-3 md:space-y-4"
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
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

// Classes utilitárias para mobile-first
export const mobileFirstClasses = {
  // Hide/show baseado no tamanho da tela
  hideOnMobile: "hidden sm:block",
  showOnMobile: "block sm:hidden",
  hideOnTablet: "sm:hidden lg:block",
  showOnTablet: "hidden sm:block lg:hidden",
  hideOnDesktop: "lg:hidden",
  showOnDesktop: "hidden lg:block",
  
  // Touch targets otimizados
  touchTarget: "min-h-[44px] min-w-[44px] touch-manipulation",
  
  // Scroll responsivo
  scrollContainer: "overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
};
