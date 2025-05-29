
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { 
  Crown, 
  RefreshCw, 
  Settings,
  Gift,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function SidebarSubscriptionStatus() {
  const { user, checkSubscription, openCustomerPortal, createCheckout } = useAuth();

  const handleRefreshSubscription = async () => {
    try {
      await checkSubscription();
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  const handleManageSubscription = async () => {
    try {
      // Se o trial expirou ou não tem assinatura, vai para checkout
      if (!user?.subscribed || isTrialExpired) {
        await createCheckout();
      } else {
        // Se tem assinatura ativa, vai para portal de gerenciamento
        await openCustomerPortal();
      }
    } catch (error) {
      console.error('Error managing subscription:', error);
    }
  };

  const handleStartTrial = async () => {
    try {
      await createCheckout();
    } catch (error) {
      console.error('Error starting trial:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isTrialActive = user?.subscribed && user?.subscriptionEnd && 
    new Date(user.subscriptionEnd) > new Date();
  
  const isTrialExpired = user?.subscribed && user?.subscriptionEnd && 
    new Date(user.subscriptionEnd) <= new Date();

  return (
    <Card className="bg-gradient-to-br from-white via-white to-gray-50 shadow-sm border border-gray-200">
      <CardContent className="p-4 space-y-3">
        {/* Status compacto */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {user?.subscribed && !isTrialExpired ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-orange-500" />
            )}
            <span className="text-sm font-medium text-gray-700">
              {user?.subscribed && !isTrialExpired ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshSubscription}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>

        {/* Detalhes da assinatura ativa */}
        {user?.subscribed && !isTrialExpired ? (
          <div className="space-y-2">
            {isTrialActive && (
              <Badge className="w-full justify-center bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                <Gift className="w-3 h-3 mr-1" />
                Trial - 7 Dias Grátis
              </Badge>
            )}
            
            {user.subscriptionEnd && (
              <div className="text-center">
                <div className="text-xs text-gray-600">
                  {isTrialActive ? 'Trial até:' : 'Próxima cobrança:'}
                </div>
                <div className="text-xs font-semibold text-green-700">
                  {formatDate(user.subscriptionEnd)}
                </div>
              </div>
            )}

            <Button
              onClick={handleManageSubscription}
              size="sm"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs"
            >
              <Settings className="w-3 h-3 mr-1" />
              Gerenciar
            </Button>
          </div>
        ) : (
          /* Trial expirado ou sem assinatura */
          <div className="text-center space-y-2">
            {isTrialExpired ? (
              /* Trial expirado - precisa pagar */
              <div className="space-y-2">
                <Badge className="w-full justify-center bg-red-100 text-red-800 hover:bg-red-100 text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Trial Expirado
                </Badge>
                
                <div className="text-xs text-red-600 font-medium">
                  Sua assinatura expirou
                </div>
                
                <Button 
                  onClick={handleManageSubscription}
                  size="sm"
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs"
                >
                  <CreditCard className="w-3 h-3 mr-1" />
                  Assinar Agora
                </Button>
              </div>
            ) : (
              /* Sem trial - convite */
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-800">
                  Trial Gratuito
                </div>
                <div className="text-xs text-gray-600">
                  7 dias grátis
                </div>
                
                <Button 
                  onClick={handleStartTrial}
                  size="sm"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs"
                >
                  <Gift className="w-3 h-3 mr-1" />
                  Começar Trial
                </Button>
                
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <CreditCard className="w-3 h-3" />
                  <span>Depois R$ 47/mês</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
