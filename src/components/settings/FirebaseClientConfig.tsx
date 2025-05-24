
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Database } from 'lucide-react';
import { useClientConfig } from '@/contexts/ClientConfigContext';

export function FirebaseClientConfig() {
  const { config, connectionStatus } = useClientConfig();

  const isConnected = connectionStatus.firebase;

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-orange-600" />
          Status Firebase (Cliente)
        </CardTitle>
        <CardDescription>
          Status da conexão Firebase configurada pelo cliente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          {isConnected ? (
            <>
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="text-green-600 font-medium">Conectado</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-6 w-6 text-red-500" />
              <span className="text-red-600 font-medium">Desconectado</span>
            </>
          )}
        </div>

        {isConnected && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 mb-2">
              Projeto ID: {config.firebase.projectId}
            </p>
            <p className="text-sm text-green-700">
              Database URL: {config.firebase.databaseURL}
            </p>
          </div>
        )}

        <div className="mt-4">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Configuração Válida" : "Configuração Necessária"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
