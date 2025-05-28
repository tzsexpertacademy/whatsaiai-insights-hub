
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Brain, Mail, Lock, User, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/useOnboarding';

export function LoginPage() {
  const { login, signup, user, isLoading } = useAuth();
  const { markAsNewUser } = useOnboarding();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: ''
  });

  // Verificar se veio do checkout
  const fromCheckout = searchParams.get('checkout') === 'success';

  // Quando usuário se autentica
  useEffect(() => {
    if (user) {
      console.log('✅ Usuário autenticado, redirecionando para dashboard');
      
      // Se veio do checkout, marcar como novo usuário para mostrar tutorial
      if (fromCheckout) {
        markAsNewUser();
        toast({
          title: "Bem-vindo ao Observatório!",
          description: "Vamos começar sua jornada de autoconhecimento",
          duration: 2000
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!",
          duration: 2000
        });
      }
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  }, [user, navigate, toast, fromCheckout, markAsNewUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Tentando fazer login...');
    try {
      await login(loginData.email, loginData.password);
    } catch (error) {
      console.error('❌ Erro no login:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive"
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    if (!signupData.fullName.trim()) {
      toast({
        title: "Erro",
        description: "Nome completo é obrigatório",
        variant: "destructive"
      });
      return;
    }

    console.log('📝 Tentando criar conta...');
    try {
      await signup(signupData.email, signupData.password, {
        fullName: signupData.fullName,
        companyName: signupData.companyName
      });
      
      // Se veio do checkout, será marcado como novo usuário no useEffect acima
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao criar conta",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Observatório</h1>
          </div>
          <p className="text-gray-600">Seu painel de consciência pessoal</p>
          {fromCheckout && (
            <p className="text-sm text-green-600 font-medium mt-2">
              ✅ Assinatura confirmada! Crie sua conta para começar
            </p>
          )}
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {fromCheckout ? 'Complete seu cadastro' : 'Acesse seu Observatório'}
            </CardTitle>
            <CardDescription className="text-center">
              {fromCheckout ? 'Crie sua conta para acessar a plataforma' : 'Entre ou crie sua conta para começar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={fromCheckout ? "signup" : "signup"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup">
                  {fromCheckout ? 'Criar Conta' : 'Criar Conta'}
                </TabsTrigger>
                <TabsTrigger value="login">Já tenho conta</TabsTrigger>
              </TabsList>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome completo"
                        className="pl-10"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-company">Empresa (Opcional)</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-company"
                        type="text"
                        placeholder="Nome da empresa"
                        className="pl-10"
                        value={signupData.companyName}
                        onChange={(e) => setSignupData({...signupData, companyName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={signupData.email}
                        onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirmar Senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? 'Criando conta...' : 'Criar Conta e Acessar'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar no Observatório'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />
            
            <div className="text-center text-sm text-gray-600">
              <p>Ao criar uma conta, você concorda com nossos</p>
              <p>
                <span className="text-blue-600 hover:underline cursor-pointer">Termos de Serviço</span>
                {' e '}
                <span className="text-blue-600 hover:underline cursor-pointer">Política de Privacidade</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
