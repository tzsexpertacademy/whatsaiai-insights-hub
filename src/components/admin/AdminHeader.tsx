
import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.clear();
      sessionStorage.clear();
      navigate('/auth');
      window.location.href = '/auth';
      toast({
        title: "Logout realizado",
        description: "Sessão admin encerrada com sucesso"
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/auth';
    }
  };

  const handleBackToHub = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBackToHub}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Hub
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Painel Master - CEO</h1>
          <p className="text-slate-600">Visão completa do negócio e métricas estratégicas</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Shield className="h-4 w-4" />
          <span>{user?.email}</span>
        </div>
        
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}
