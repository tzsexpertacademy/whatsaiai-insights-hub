
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
    const hasRealData = localStorage.getItem('has_real_analysis_data') === 'true';
    
    console.log('🔍 Verificando onboarding:', {
      onboardingCompleted,
      hasRealData,
      url: window.location.pathname
    });

    // Se é primeira visita e não tem dados reais, mostra demo
    if (!onboardingCompleted && !hasRealData) {
      setState({
        isFirstVisit: true,
        completed: false,
        showDemo: true // Sempre mostra demo na primeira visita
      });
    } else if (onboardingCompleted && !hasRealData) {
      // Completou onboarding mas ainda não tem dados reais
      setState({
        isFirstVisit: false,
        completed: true,
        showDemo: false // Dashboard vazio aguardando análise
      });
    } else {
      // Tem dados reais
      setState({
        isFirstVisit: false,
        completed: true,
        showDemo: false
      });
    }
  }, []);

  const completeOnboarding = () => {
    console.log('✅ Completando onboarding - usuário quer análise real');
    localStorage.setItem('onboarding_completed', 'true');
    setState({ 
      isFirstVisit: false,
      completed: true,
      showDemo: false // Para de mostrar demo
    });
  };

  const markRealDataAvailable = () => {
    console.log('✅ Marcando dados reais como disponíveis');
    localStorage.setItem('has_real_analysis_data', 'true');
    setState(prev => ({ 
      ...prev, 
      showDemo: false 
    }));
  };

  const resetOnboarding = () => {
    console.log('🔄 Reset completo do onboarding');
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('has_real_analysis_data');
    setState({
      isFirstVisit: true,
      showDemo: true,
      completed: false
    });
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
    hideDemoData,
    markRealDataAvailable
  };
}
