
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Brain, Sparkles, Users, TrendingUp } from 'lucide-react';

export function LoginPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Estados para cadastro
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔑 Tentando fazer login com:', loginEmail);
      await login(loginEmail, loginPassword);
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao Observatório",
        duration: 2000
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      let errorMessage = "Erro ao fazer login";
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Email ou senha incorretos";
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Confirme seu email antes de fazer login";
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('📝 Criando conta real para:', signupEmail);
      await signup(signupEmail, signupPassword, { fullName, companyName });
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Redirecionando para seu observatório...",
        duration: 2000
      });
      
      // Aguardar um pouco para o contexto atualizar
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Erro no cadastro:', error);
      let errorMessage = "Erro ao criar conta";
      
      if (error.message?.includes('User already registered')) {
        errorMessage = "Email já cadastrado. Tente fazer login.";
      } else if (error.message?.includes('Password should be at least 6 characters')) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "Email inválido";
      }
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      {/* Background com efeito neural */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)]" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Observatório da Consciência</h1>
          <p className="text-gray-400">Acesse ou crie sua conta para começar</p>
        </div>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-white">Bem-vindo</CardTitle>
            <CardDescription className="text-gray-400">
              Entre na sua conta ou crie uma nova para começar
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="login" className="text-white data-[state=active]:bg-blue-600">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-white data-[state=active]:bg-green-600">
                  Criar Conta
                </TabsTrigger>
              </TabsList>

              {/* Tab de Login */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-white">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-white">Senha</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>

              {/* Tab de Cadastro */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-white">Nome Completo</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-company" className="text-white">Nome da Empresa (opcional)</Label>
                    <Input
                      id="signup-company"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Nome da sua empresa"
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">Mínimo de 6 caracteres</p>
                  </div>

                  <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Trial Gratuito Incluído</span>
                    </div>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• 7 dias grátis para explorar</li>
                      <li>• Acesso completo a todas as funcionalidades</li>
                      <li>• Depois apenas R$ 47/mês</li>
                      <li>• Cancele a qualquer momento</li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Criando conta...' : 'Criar Conta e Começar Trial'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Benefícios */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Por que escolher o Observatório?
              </h3>
              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-blue-400" />
                  <span>Análise profunda da sua consciência por IA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-3 h-3 text-purple-400" />
                  <span>Mapeamento de padrões emocionais e comportamentais</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-green-400" />
                  <span>Insights personalizados para seu crescimento</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            ← Voltar para página inicial
          </Button>
        </div>
      </div>
    </div>
  );
}
