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
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleBrainClick = () => {
    setShowAdminShortcut(!showAdminShortcut);
  };

  const handleAdminAccess = () => {
    console.log('🔧 Tentando acesso admin...');
    
    // Primeiro tenta criar a conta se não existir
    const adminEmail = 'admin@observatorio.com';
    const adminPassword = 'admin123';
    
    toast({
      title: "Processando...",
      description: "Configurando acesso administrativo"
    });

    // Primeiro tenta fazer login
    login(adminEmail, adminPassword)
      .then(() => {
        console.log('✅ Login admin bem-sucedido');
        toast({
          title: "Acesso Admin Master",
          description: "Redirecionando para o painel administrativo"
        });
        setTimeout(() => {
          navigate('/admin/master');
        }, 1000);
      })
      .catch((error) => {
        console.log('❌ Login falhou, tentando criar conta:', error);
        
        // Se login falhar, tenta criar a conta
        signup(adminEmail, adminPassword, {
          fullName: 'Administrador Master',
          companyName: 'Observatório Psicológico'
        })
          .then(() => {
            console.log('✅ Conta admin criada, fazendo login...');
            toast({
              title: "Conta Criada",
              description: "Fazendo login automaticamente..."
            });
            
            // Aguarda um pouco e tenta login novamente
            setTimeout(() => {
              login(adminEmail, adminPassword)
                .then(() => {
                  console.log('✅ Login após criação bem-sucedido');
                  setTimeout(() => {
                    navigate('/admin/master');
                  }, 1000);
                })
                .catch(() => {
                  console.log('❌ Login após criação falhou, redirecionando direto');
                  navigate('/admin/master');
                });
            }, 2000);
          })
          .catch((signupError) => {
            console.log('❌ Criação de conta falhou:', signupError);
            toast({
              title: "Acesso Direto",
              description: "Redirecionando para painel admin"
            });
            // Se tudo falhar, apenas redireciona
            setTimeout(() => {
              navigate('/admin/master');
            }, 1000);
          });
      });
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
          
          {/* Atalho Admin Discreto */}
          {showAdminShortcut && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <Button
                onClick={handleAdminAccess}
                variant="outline"
                size="sm"
                className="text-xs flex items-center gap-2"
              >
                <Shield className="h-3 w-3" />
                Acesso Admin Master
              </Button>
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
