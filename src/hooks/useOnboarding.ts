
import { useState, useEffect } from 'react';

interface OnboardingState {
  isFirstVisit: boolean;
  showDemo: boolean;
  completed: boolean;
  currentStep: number;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    isFirstVisit: false,
    showDemo: false,
    completed: true,
    currentStep: 0
  });

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
    const hasRealData = localStorage.getItem('has_real_analysis_data') === 'true';
    
    console.log('🔍 Verificando onboarding:', {
      onboardingCompleted,
      hasRealData,
      url: window.location.pathname
    });

    if (!onboardingCompleted && !hasRealData) {
      // Primeira visita - inicia experiência
      setState({
        isFirstVisit: true,
        completed: false,
        showDemo: true,
        currentStep: 1
      });
    } else {
      // Usuário já passou pelo onboarding
      setState({
        isFirstVisit: false,
        completed: true,
        showDemo: false,
        currentStep: 0
      });
    }
  }, []);

  const nextStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1
    }));
  };

  const completeOnboarding = () => {
    console.log('✅ Completando onboarding');
    localStorage.setItem('onboarding_completed', 'true');
    setState({ 
      isFirstVisit: false,
      completed: true,
      showDemo: false,
      currentStep: 0
    });
    
    window.dispatchEvent(new CustomEvent('onboarding-completed'));
  };

  const resetOnboarding = () => {
    console.log('🔄 Reset completo do onboarding');
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('has_real_analysis_data');
    setState({
      isFirstVisit: true,
      showDemo: true,
      completed: false,
      currentStep: 1
    });
  };

  const showDemoData = () => {
    setState(prev => ({ ...prev, showDemo: true }));
  };

  const hideDemoData = () => {
    setState(prev => ({ ...prev, showDemo: false }));
  };

  const markRealDataAvailable = () => {
    console.log('✅ Marcando dados reais como disponíveis');
    localStorage.setItem('has_real_analysis_data', 'true');
    setState(prev => ({ 
      ...prev, 
      showDemo: false 
    }));
  };

  return {
    ...state,
    nextStep,
    completeOnboarding,
    resetOnboarding,
    showDemoData,
    hideDemoData,
    markRealDataAvailable
  };
}
