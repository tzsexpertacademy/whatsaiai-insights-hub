import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, User, Building, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LoginPage() {
  const { login, signup, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAdminShortcut, setShowAdminShortcut] = useState(false);
  const [isProcessingAdmin, setIsProcessingAdmin] = useState(false);

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

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !isProcessingAdmin) {
      navigate('/');
    }
  }, [user, navigate, isProcessingAdmin]);

  const handleBrainClick = () => {
    setShowAdminShortcut(!showAdminShortcut);
  };

  const handleAdminAccess = async () => {
    console.log('🔧 Iniciando bypass admin direto');
    setIsProcessingAdmin(true);
    
    // Criar um email único para evitar conflitos
    const timestamp = Date.now();
    const adminEmail = `admin.temp.${timestamp}@observatorio.com`;
    const adminPassword = 'TempAdmin123!';

    try {
      toast({
        title: "Criando Acesso Admin Temporário",
        description: "Configurando conta admin...",
        duration: 3000
      });

      console.log('🔄 Criando conta admin temporária...');
      
      // Criar conta admin temporária
      await signup(adminEmail, adminPassword, {
        fullName: 'Admin Temporário',
        companyName: 'Observatório Psicológico - Admin'
      });

      console.log('✅ Conta admin temporária criada! Fazendo login...');

      // Aguardar um pouco e fazer login
      setTimeout(async () => {
        try {
          await login(adminEmail, adminPassword);
          console.log('✅ Login admin temporário bem-sucedido!');
          
          toast({
            title: "Acesso Admin Autorizado",
            description: "Redirecionando para painel master...",
            duration: 2000
          });

          // Aguardar e redirecionar
          setTimeout(() => {
            console.log('🚀 Redirecionando para /admin/master');
            navigate('/admin/master');
            setIsProcessingAdmin(false);
          }, 1500);

        } catch (loginError) {
          console.error('❌ Erro no login temporário:', loginError);
          setIsProcessingAdmin(false);
          
          toast({
            title: "Erro no Login",
            description: "Tente fazer login manualmente",
            variant: "destructive"
          });
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Erro ao criar admin temporário:', error);
      setIsProcessingAdmin(false);
      
      toast({
        title: "Erro no Bypass Admin",
        description: "Tente fazer login manualmente com suas credenciais",
        variant: "destructive"
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginData.email, loginData.password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta à plataforma"
      });
    } catch (error) {
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

    try {
      await signup(signupData.email, signupData.password, {
        fullName: signupData.fullName,
        companyName: signupData.companyName
      });
      toast({
        title: "Conta criada com sucesso!",
        description: "Você pode fazer login agora"
      });
    } catch (error) {
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
            <Brain 
              className="h-8 w-8 text-blue-600 cursor-pointer transition-colors hover:text-purple-600" 
              onClick={handleBrainClick}
            />
            <h1 className="text-2xl font-bold text-gray-900">Observatório Psicológico</h1>
          </div>
          <p className="text-gray-600">Análise comportamental avançada via WhatsApp</p>
          
          {/* Atalho Admin Melhorado */}
          {showAdminShortcut && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <Button
                onClick={handleAdminAccess}
                variant="outline"
                size="sm"
                disabled={isProcessingAdmin}
                className="text-xs flex items-center gap-2 hover:bg-blue-50 disabled:opacity-50"
              >
                <Shield className="h-3 w-3" />
                {isProcessingAdmin ? 'Criando Admin...' : 'Bypass Admin Master'}
              </Button>
              <p className="text-xs text-gray-500 mt-1">Cria conta admin temporária</p>
            </div>
          )}
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Acesse sua conta</CardTitle>
            <CardDescription className="text-center">
              Entre ou crie uma nova conta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

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
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo</Label>
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
                    <Label htmlFor="signup-email">Email</Label>
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
                    <Label htmlFor="signup-password">Senha</Label>
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
                    <Label htmlFor="signup-confirm">Confirmar Senha</Label>
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

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Criando conta...' : 'Criar conta'}
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
