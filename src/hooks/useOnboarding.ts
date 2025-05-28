
import { useState, useEffect } from 'react';

interface OnboardingState {
  isFirstVisit: boolean;
  showDemo: boolean;
  completed: boolean;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    isFirstVisit: false,
    showDemo: false,
    completed: true
  });

  useEffect(() => {
    const hasRealData = localStorage.getItem('has_real_analysis_data') === 'true';
    
    console.log('🔍 Verificando onboarding:', {
      hasRealData,
      url: window.location.pathname
    });

    // Sempre vai direto para o dashboard real
    setState({
      isFirstVisit: false,
      completed: true,
      showDemo: false
    });
  }, []);

  const completeOnboarding = () => {
    console.log('✅ Completando onboarding - transição para dashboard real');
    localStorage.setItem('onboarding_completed', 'true');
    setState({ 
      isFirstVisit: false,
      completed: true,
      showDemo: false
    });
    
    window.dispatchEvent(new CustomEvent('onboarding-completed'));
  };

  const resetOnboarding = () => {
    console.log('🔄 Reset completo do onboarding');
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('has_real_analysis_data');
    setState({
      isFirstVisit: false,
      showDemo: false,
      completed: true
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
    completeOnboarding,
    resetOnboarding,
    showDemoData,
    hideDemoData,
    markRealDataAvailable
  };
}
