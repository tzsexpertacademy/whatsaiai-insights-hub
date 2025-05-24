
import React, { useEffect } from 'react';
import { useInfiniteLoopProtection } from '@/hooks/useInfiniteLoopProtection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface LoopProtectionWrapperProps {
  children: React.ReactNode;
}

export function LoopProtectionWrapper({ children }: LoopProtectionWrapperProps) {
  const { reportError } = useInfiniteLoopProtection({
    maxRenders: 30,
    maxErrors: 5,
    timeWindow: 3000,
    redirectTo: '/'
  });

  const [showRedirectAlert, setShowRedirectAlert] = React.useState(false);

  useEffect(() => {
    // Verifica se houve redirecionamento por loop protection
    const wasRedirected = localStorage.getItem('loop-protection-redirect');
    if (wasRedirected) {
      setShowRedirectAlert(true);
      localStorage.removeItem('loop-protection-redirect');
      
      // Remove o alerta após 5 segundos
      setTimeout(() => {
        setShowRedirectAlert(false);
      }, 5000);
    }
  }, []);

  return (
    <>
      {showRedirectAlert && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Sistema de Proteção Ativo:</strong> Foi detectado um possível loop infinito. 
              Você foi redirecionado para a página inicial por segurança.
            </AlertDescription>
          </Alert>
        </div>
      )}
      {children}
    </>
  );
}
