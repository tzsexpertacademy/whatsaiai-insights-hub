
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CreditCard, X } from 'lucide-react';

export function TrialExpirationReminder() {
  const { user, createCheckout } = useAuth();
  const [showReminder, setShowReminder] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);

  const isTrialExpired = user?.subscribed && user?.subscriptionEnd && 
    new Date(user.subscriptionEnd) <= new Date();

  useEffect(() => {
    if (!isTrialExpired || !user?.id) return;

    const storageKey = `trial_reminder_${user.id}`;
    const lastReminder = localStorage.getItem(storageKey);
    const now = Date.now();
    
    // Se nunca mostrou ou já passou 24h desde o último lembrete
    if (!lastReminder || (now - parseInt(lastReminder)) > 24 * 60 * 60 * 1000) {
      const currentCount = parseInt(localStorage.getItem(`${storageKey}_count`) || '0');
      
      // Mostrar até 3 lembretes
      if (currentCount < 3) {
        setReminderCount(currentCount + 1);
        setShowReminder(true);
        
        // Atualizar localStorage
        localStorage.setItem(storageKey, now.toString());
        localStorage.setItem(`${storageKey}_count`, (currentCount + 1).toString());
      }
    }
  }, [isTrialExpired, user?.id]);

  const handleSubscribe = async () => {
    try {
      await createCheckout();
      setShowReminder(false);
    } catch (error) {
      console.error('Error creating checkout:', error);
    }
  };

  const handleDismiss = () => {
    setShowReminder(false);
  };

  if (!showReminder || !isTrialExpired) {
    return null;
  }

  return (
    <Dialog open={showReminder} onOpenChange={setShowReminder}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Trial Expirado
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-left mt-4">
            <div className="space-y-4">
              <p className="text-gray-600">
                Seu período de trial gratuito de 7 dias expirou em{' '}
                <span className="font-semibold">
                  {user?.subscriptionEnd && new Date(user.subscriptionEnd).toLocaleDateString('pt-BR')}
                </span>
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Continue aproveitando todas as funcionalidades:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Análises ilimitadas por IA</li>
                  <li>• Integração completa com WhatsApp</li>
                  <li>• Relatórios detalhados e insights</li>
                  <li>• Suporte prioritário</li>
                </ul>
              </div>

              <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                <div className="text-2xl font-bold text-green-700">R$ 47/mês</div>
                <div className="text-sm text-green-600">Cancele a qualquer momento</div>
              </div>

              {reminderCount > 1 && (
                <div className="text-xs text-gray-500 text-center">
                  Lembrete {reminderCount} de 3
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          <Button
            onClick={handleSubscribe}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 font-semibold"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Assinar Agora
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="w-full"
          >
            Lembrar mais tarde
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
