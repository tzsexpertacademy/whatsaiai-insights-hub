
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { 
  Crown, 
  Calendar, 
  RefreshCw, 
  Settings,
  Gift,
  Zap,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function SubscriptionStatus() {
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
      await openCustomerPortal();
    } catch (error) {
      console.error('Error opening customer portal:', error);
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

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-gradient-to-br from-white via-white to-gray-50 shadow-xl border-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-green-500/5" />
        
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            Status da Assinatura
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Status atual */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user?.subscribed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                )}
                <span className="font-medium text-gray-700">Status:</span>
              </div>
              {user?.subscribed ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                  <Zap className="w-3 h-3 mr-1" />
                  {isTrialActive ? 'Trial Ativo' : 'Assinatura Ativa'}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  Inativo
                </Badge>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshSubscription}
              className="flex items-center gap-2 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          </div>

          {/* Detalhes da assinatura ativa */}
          {user?.subscribed && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Gift className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Plano Atual</div>
                    <div className="text-sm text-gray-600">
                      {user.subscriptionTier || 'Premium'}
                    </div>
                  </div>
                </div>
              </div>

              {user.subscriptionEnd && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {isTrialActive ? 'Trial válido até:' : 'Próxima cobrança:'}
                      </div>
                      <div className="text-sm font-semibold text-green-700">
                        {formatDate(user.subscriptionEnd)}
                      </div>
                    </div>
                  </div>
                  
                  {isTrialActive && (
                    <Badge className="bg-green-500 text-white hover:bg-green-500">
                      <Gift className="w-3 h-3 mr-1" />
                      7 Dias Grátis
                    </Badge>
                  )}
                </div>
              )}

              <Button
                onClick={handleManageSubscription}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar Assinatura
              </Button>
            </div>
          )}

          {/* Convite para trial */}
          {!user?.subscribed && (
            <div className="text-center space-y-6 p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-xl border border-green-200">
              <div className="space-y-3">
                <div className="p-3 bg-green-500 rounded-full w-fit mx-auto">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">
                    Comece seu Trial Gratuito
                  </h3>
                  <p className="text-gray-600 mb-4">
                    7 dias gratuitos para explorar todo o potencial do Observatório
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                    <CreditCard className="w-4 h-4" />
                    <span>Cartão necessário • Cancele a qualquer momento</span>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleStartTrial}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Gift className="w-5 h-5 mr-2" />
                Começar Trial Grátis - 7 Dias
              </Button>
              
              <p className="text-xs text-gray-500">
                Após o trial: R$ 47/mês • Sem compromisso
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
