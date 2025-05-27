
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
  Zap
} from 'lucide-react';

export function SubscriptionStatus() {
  const { user, checkSubscription, openCustomerPortal } = useAuth();

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          Status da Assinatura
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            {user?.subscribed ? (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                <Zap className="w-3 h-3 mr-1" />
                Ativo
              </Badge>
            ) : (
              <Badge variant="secondary">
                Inativo
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshSubscription}
            className="flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Atualizar
          </Button>
        </div>

        {user?.subscribed && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Plano:</span>
              <Badge variant="outline">
                {user.subscriptionTier || 'Premium'}
              </Badge>
            </div>

            {user.subscriptionEnd && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {isTrialActive ? 'Trial até:' : 'Próxima cobrança:'}
                </span>
                <span className="text-sm font-medium">
                  {formatDate(user.subscriptionEnd)}
                </span>
                {isTrialActive && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Gift className="w-3 h-3 mr-1" />
                    Trial Grátis
                  </Badge>
                )}
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleManageSubscription}
              className="w-full flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Gerenciar Assinatura
            </Button>
          </>
        )}

        {!user?.subscribed && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Você não possui uma assinatura ativa
            </p>
            <Button 
              onClick={() => window.location.href = '/observatory'}
              className="bg-green-500 hover:bg-green-600"
            >
              <Gift className="w-4 h-4 mr-2" />
              Começar Trial Grátis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
