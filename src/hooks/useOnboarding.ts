
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
    const isNewUser = localStorage.getItem('is_new_user') === 'true';
    
    console.log('🔍 Verificando onboarding:', {
      onboardingCompleted,
      hasRealData,
      isNewUser,
      url: window.location.pathname
    });

    // Se é um usuário novo (que veio do checkout) e ainda não completou o onboarding
    if (isNewUser && !onboardingCompleted) {
      setState({
        isFirstVisit: true,
        completed: false,
        showDemo: true,
        currentStep: 1
      });
    } else {
      // Usuário existente ou que já passou pelo onboarding
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
    localStorage.removeItem('is_new_user'); // Remove flag de novo usuário
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
    localStorage.removeItem('is_new_user');
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

  const markAsNewUser = () => {
    console.log('🆕 Marcando como novo usuário');
    localStorage.setItem('is_new_user', 'true');
  };

  return {
    ...state,
    nextStep,
    completeOnboarding,
    resetOnboarding,
    showDemoData,
    hideDemoData,
    markRealDataAvailable,
    markAsNewUser
  };
}
