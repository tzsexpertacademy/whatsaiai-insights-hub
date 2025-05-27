
import { useState, useEffect } from 'react';

interface OnboardingState {
  isFirstVisit: boolean;
  showDemo: boolean;
  completed: boolean;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    isFirstVisit: true,
    showDemo: false,
    completed: false
  });

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
    
    console.log('🔍 Verificando onboarding:', {
      onboardingCompleted,
      url: window.location.pathname
    });

    setState({
      isFirstVisit: !onboardingCompleted,
      completed: onboardingCompleted,
      showDemo: !onboardingCompleted
    });
  }, []);

  const completeOnboarding = () => {
    console.log('✅ Completando onboarding');
    localStorage.setItem('onboarding_completed', 'true');
    setState({ 
      isFirstVisit: false,
      completed: true,
      showDemo: false
    });
  };

  const resetOnboarding = () => {
    console.log('🔄 Reset completo do onboarding');
    localStorage.clear();
    setState({
      isFirstVisit: true,
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
    completeOnboarding,
    resetOnboarding,
    showDemoData,
    hideDemoData
  };
}
