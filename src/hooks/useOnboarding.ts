
import { useState, useEffect } from 'react';

interface OnboardingState {
  isFirstVisit: boolean;
  currentStep: number;
  showTour: boolean;
  showDemo: boolean;
  completed: boolean;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    isFirstVisit: true,
    currentStep: 0,
    showTour: false,
    showDemo: false,
    completed: false
  });

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
    const hasSeenWelcome = localStorage.getItem('welcome_seen') === 'true';

    console.log('🔍 Verificando onboarding:', {
      onboardingCompleted,
      hasSeenWelcome,
      url: window.location.pathname
    });

    setState(prev => ({
      ...prev,
      isFirstVisit: !onboardingCompleted && !hasSeenWelcome,
      completed: onboardingCompleted,
      showTour: false
    }));
  }, []);

  const completeWelcome = () => {
    console.log('✅ Completando welcome - indo para dashboard');
    localStorage.setItem('welcome_seen', 'true');
    setState(prev => ({ 
      ...prev, 
      isFirstVisit: false,
      showTour: true,
      currentStep: 1
    }));
  };

  const startTour = () => {
    console.log('🚀 Iniciando tour guiado');
    setState(prev => ({ 
      ...prev, 
      showTour: true, 
      currentStep: 1
    }));
  };

  const completeTour = () => {
    console.log('✅ Tour completado');
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('welcome_seen', 'true');
    setState(prev => ({ 
      ...prev, 
      showTour: false, 
      completed: true,
      currentStep: 0,
      isFirstVisit: false
    }));
  };

  const skipOnboarding = () => {
    console.log('⏭️ Pulando todo o onboarding');
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('welcome_seen', 'true');
    setState(prev => ({ 
      ...prev, 
      isFirstVisit: false,
      showTour: false, 
      completed: true,
      currentStep: 0
    }));
  };

  const resetOnboarding = () => {
    console.log('🔄 Reset completo do onboarding');
    localStorage.clear();
    setState({
      isFirstVisit: true,
      currentStep: 0,
      showTour: false,
      showDemo: false,
      completed: false
    });
    window.location.reload();
  };

  const showDemoData = () => {
    setState(prev => ({ ...prev, showDemo: true }));
  };

  const hideDemoData = () => {
    setState(prev => ({ ...prev, showDemo: false }));
  };

  return {
    ...state,
    completeWelcome,
    startTour,
    completeTour,
    skipOnboarding,
    resetOnboarding,
    showDemoData,
    hideDemoData
  };
}
