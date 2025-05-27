
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
    // Check onboarding status from localStorage
    const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
    const onboardingStep = localStorage.getItem('onboarding_step');
    const hasSeenWelcome = localStorage.getItem('welcome_seen') === 'true';

    setState(prev => ({
      ...prev,
      isFirstVisit: !hasSeenWelcome,
      completed: onboardingCompleted,
      showTour: onboardingStep === '1' && !onboardingCompleted,
      currentStep: onboardingStep ? parseInt(onboardingStep) : 0
    }));
  }, []);

  const markWelcomeSeen = () => {
    localStorage.setItem('welcome_seen', 'true');
    setState(prev => ({ ...prev, isFirstVisit: false }));
  };

  const startTour = () => {
    localStorage.setItem('onboarding_step', '1');
    setState(prev => ({ ...prev, showTour: true, currentStep: 1 }));
  };

  const completeTour = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.removeItem('onboarding_step');
    setState(prev => ({ 
      ...prev, 
      showTour: false, 
      completed: true,
      currentStep: 0
    }));
  };

  const skipOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('welcome_seen', 'true');
    localStorage.removeItem('onboarding_step');
    setState(prev => ({ 
      ...prev, 
      isFirstVisit: false,
      showTour: false, 
      completed: true,
      currentStep: 0
    }));
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_step');
    localStorage.removeItem('welcome_seen');
    setState({
      isFirstVisit: true,
      currentStep: 0,
      showTour: false,
      showDemo: false,
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
    markWelcomeSeen,
    startTour,
    completeTour,
    skipOnboarding,
    resetOnboarding,
    showDemoData,
    hideDemoData
  };
}
