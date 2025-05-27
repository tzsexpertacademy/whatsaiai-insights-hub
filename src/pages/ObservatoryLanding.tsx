import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useParallax } from '@/hooks/useParallax';
import { CursorEffect } from '@/components/effects/CursorEffect';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Eye, 
  Zap, 
  Target, 
  TrendingUp, 
  Compass, 
  Sparkles,
  ArrowRight,
  Play,
  Users,
  Star,
  Quote,
  Activity,
  Map,
  BarChart3,
  Calendar,
  Lightbulb,
  Search,
  Flame,
  Rocket,
  Shield,
  Clock
} from 'lucide-react';

export function ObservatoryLanding() {
  const navigate = useNavigate();
  const { isAuthenticated, createCheckout, signup, login } = useAuth();
  const { toast } = useToast();
  const heroRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLCanvasElement>(null);
  const scrollY = useParallax();

  // Animação de partículas neurais mais intensa
  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Criar mais partículas para efeito mais denso
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        life: Math.random() * 100,
        maxLife: 100 + Math.random() * 150,
        size: Math.random() * 2 + 0.5
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        if (particle.life > particle.maxLife || particle.x < 0 || particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
          particles[index] = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            life: 0,
            maxLife: 100 + Math.random() * 150,
            size: Math.random() * 2 + 0.5
          };
        }

        // Desenhar partícula com glow
        const alpha = 1 - particle.life / particle.maxLife;
        const hue = (particle.life * 0.5) % 360;
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
        ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Conectar partículas próximas com mais intensidade
        particles.forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const lineAlpha = (1 - distance / 120) * alpha * 0.4;
            ctx.strokeStyle = `rgba(59, 130, 246, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleAccessObservatory = async () => {
    try {
      if (isAuthenticated) {
        // Se já está logado, vai direto para o checkout
        await createCheckout();
      } else {
        // Se não está logado, cria conta temporária e vai para checkout
        const timestamp = Date.now();
        const tempEmail = `temp.user.${timestamp}@observatorio.temp`;
        const tempPassword = 'TempPass123!';
        
        toast({
          title: "Criando sua conta...",
          description: "Preparando seu acesso ao Observatório",
          duration: 3000
        });

        // Criar conta temporária
        await signup(tempEmail, tempPassword, {
          fullName: 'Usuário Observatório',
          companyName: 'Trial Gratuito'
        });

        // Fazer login automático
        await login(tempEmail, tempPassword);
        
        // Aguardar um pouco e ir para checkout
        setTimeout(async () => {
          try {
            await createCheckout();
          } catch (error) {
            console.error('Error creating checkout after signup:', error);
            // Fallback para dashboard se houver erro
            navigate('/dashboard');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error in handleAccessObservatory:', error);
      toast({
        title: "Erro",
        description: "Houve um problema. Tente novamente ou faça login manualmente.",
        variant: "destructive"
      });
      // Fallback para página de auth
      navigate('/auth');
    }
  };

  const observatoryFeatures = [
    {
      icon: Activity,
      title: "Termômetro Emocional",
      description: "Seus estados emocionais mapeados em tempo real"
    },
    {
      icon: Map,
      title: "Radar de Áreas da Vida", 
      description: "Visualize onde você está forte e onde precisa evoluir"
    },
    {
      icon: Brain,
      title: "Mapeamento de Padrões Cognitivos",
      description: "Descubra seus loops mentais e crenças limitantes"
    },
    {
      icon: Calendar,
      title: "Linha do Tempo da Evolução",
      description: "Acompanhe sua jornada de crescimento pessoal"
    }
  ];

  const targetProfiles = [
    "Buscadores de clareza mental",
    "Empreendedores",
    "Profissionais de alta performance", 
    "Criadores",
    "Qualquer ser humano que se recusa a viver cego dentro da própria mente"
  ];

  const processSteps = [
    {
      number: "1",
      title: "Você Fala",
      description: "Suas conversas, reflexões e pensamentos alimentam o Observatório.",
      icon: Users
    },
    {
      number: "2", 
      title: "Ele Lê Você",
      description: "IA lê padrões emocionais, cognitivos, comportamentais e gera mapas da sua mente.",
      icon: Search
    },
    {
      number: "3",
      title: "Você Vê Você", 
      description: "Recebe seu painel pessoal. Suas forças, gaps, ciclos, evolução no tempo. Você aprende a se ler. A se melhorar. A se expandir.",
      icon: Eye
    }
  ];

  const benefits = [
    "Clareza mental instantânea",
    "Mapeamento de áreas negligenciadas", 
    "Diagnóstico de padrões emocionais e mentais",
    "Plano de evolução contínua baseado em você, não em fórmulas genéricas"
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <CursorEffect />
      
      {/* Canvas de partículas neurais com parallax */}
      <canvas
        ref={particlesRef}
        className="fixed inset-0 pointer-events-none z-0 w-full h-full"
        style={{ 
          background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.95) 0%, rgba(0, 0, 0, 1) 100%)',
          transform: `translateY(${scrollY * 0.5}px)`
        }}
      />

      {/* Seção 1 - ABERTURA BRUTAL */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 z-10">
        <div className="text-center max-w-6xl mx-auto w-full">
          {/* Glow central mais suave com parallax */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-cyan-500/15 blur-3xl opacity-60" 
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          />
          
          <div className="relative z-10">
            <ScrollReveal id="hero-badge" direction="scale" delay={200}>
              <Badge className="mb-8 sm:mb-12 bg-gradient-to-r from-slate-700 to-slate-800 text-slate-300 border-0 px-4 sm:px-6 py-2 sm:py-2 text-xs sm:text-sm opacity-70 hover:opacity-90 transition-opacity">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-2" />
                Powered by Yumer IA™ - IA de Consciência Humana
              </Badge>
            </ScrollReveal>

            <ScrollReveal id="hero-title" direction="up" delay={400}>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-8 sm:mb-12 leading-tight">
                <span className="block text-white mb-2 sm:mb-4">O que você não vê...</span>
                <span className="block text-cyan-400 glow-text-soft">te controla.</span>
                <span className="block text-white mb-2 sm:mb-4 mt-4 sm:mt-8">O que você vê...</span>
                <span className="block text-green-400 glow-text-soft">te liberta.</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal id="hero-subtitle" direction="up" delay={600}>
              <div className="mb-12 sm:mb-16 space-y-4 sm:space-y-6">
                <p className="text-xl sm:text-3xl md:text-4xl font-bold text-white px-2">
                  O primeiro Observatório da sua própria consciência.
                </p>
                <p className="text-lg sm:text-2xl md:text-3xl text-blue-300 px-2">
                  Um painel vivo da sua mente.
                </p>
                <p className="text-base sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto px-4">
                  Seus padrões. Suas forças. Suas sombras. Sua rota de expansão.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal id="hero-buttons" direction="up" delay={800}>
              <div className="flex flex-col gap-4 sm:gap-8 justify-center items-center mb-8 sm:mb-12 px-4">
                <Button 
                  onClick={handleAccessObservatory}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 sm:px-16 py-6 sm:py-8 text-lg sm:text-2xl font-bold rounded-2xl shadow-2xl shadow-green-500/30 border-2 border-green-400/30 backdrop-blur-sm glow-button-soft group transform hover:scale-105 transition-all duration-500"
                >
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-4 group-hover:rotate-12 transition-transform" />
                  <div className="text-center">
                    <div className="font-black">TESTE GRÁTIS 7 DIAS</div>
                    <div className="text-sm sm:text-base font-normal opacity-90">Depois apenas R$ 47/mês</div>
                  </div>
                  <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 ml-2 sm:ml-4 group-hover:translate-x-2 transition-transform" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 px-6 sm:px-8 py-4 sm:py-8 text-base sm:text-lg rounded-2xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  Ou veja como funciona ↓
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Seção 2 - O CHOQUE */}
      <section className="relative py-16 sm:py-32 px-4 sm:px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal id="features-title" direction="up">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black mb-6 sm:mb-8 text-white leading-tight">
                Você nunca viu isso.
                <br />
                <span className="text-red-400 glow-text-soft">Porque isso nunca existiu.</span>
              </h2>
              
              <p className="text-lg sm:text-2xl md:text-3xl text-gray-300 mb-8 sm:mb-12 max-w-5xl mx-auto leading-relaxed px-4">
                O Observatório lê suas reflexões, detecta padrões ocultos, e te entrega clareza real sobre quem você é — e quem pode se tornar.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {observatoryFeatures.map((feature, index) => (
              <ScrollReveal key={index} id={`feature-${index}`} direction="up" delay={index * 200}>
                <Card className="bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/15 backdrop-blur-md hover:bg-white/15 transition-all duration-700 hover:scale-105 hover:rotate-1 group glow-card-soft">
                  <CardContent className="p-4 sm:p-8 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">{feature.title}</h3>
                    <p className="text-gray-300 text-sm sm:text-lg">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 3 - PARA QUEM É ISSO */}
      <section className="relative py-16 sm:py-32 px-4 sm:px-6 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <ScrollReveal id="target-title" direction="up">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black mb-12 sm:mb-16 text-white leading-tight">
              Isso não é pra quem tá confortável
              <br />
              <span className="text-orange-400 glow-text-soft">em viver no automático.</span>
            </h2>
          </ScrollReveal>
          
          <ScrollReveal id="target-subtitle" direction="up" delay={200}>
            <p className="text-lg sm:text-2xl md:text-3xl text-gray-300 mb-8 sm:mb-12 leading-relaxed px-4">
              É pra quem tá pronto pra enxergar o que evitou por anos.
              <br />
              <span className="text-yellow-400 font-bold">Seus padrões. Suas repetições. Suas fugas. Suas potências.</span>
            </p>
          </ScrollReveal>

          <div className="space-y-4 sm:space-y-6 text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 sm:mb-16">
            {targetProfiles.map((profile, index) => (
              <ScrollReveal key={index} id={`profile-${index}`} direction="left" delay={index * 150}>
                <div className="flex items-center justify-center group px-4">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 mr-3 sm:mr-4 group-hover:rotate-45 transition-transform duration-500 flex-shrink-0" />
                  <span className="font-semibold text-center">{profile}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 4 - COMO FUNCIONA */}
      <section className="relative py-16 sm:py-32 px-4 sm:px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal id="process-title" direction="scale">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-center mb-12 sm:mb-20 text-white">
              Como <span className="bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent glow-text-soft">Funciona</span>
            </h2>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-16">
            {processSteps.map((step, index) => (
              <ScrollReveal key={index} id={`step-${index}`} direction="up" delay={index * 300}>
                <div className="text-center group">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-3xl sm:text-5xl font-black text-white group-hover:scale-110 transition-transform duration-700 glow-soft">
                    {step.number}
                  </div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                    <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">{step.title}</h3>
                  <p className="text-gray-300 text-base sm:text-lg leading-relaxed px-2">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 5 - O VALOR INIMAGINÁVEL */}
      <section className="relative py-16 sm:py-32 px-4 sm:px-6 z-10">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal id="value-title" direction="up">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-12 sm:mb-16 text-white leading-tight">
                Você já investiu em cursos, livros, terapias, mentorias...
                <br /><br />
                <span className="text-yellow-400">E mesmo assim...</span>
                <br /><br />
                <span className="text-red-400 glow-text-soft">Ninguém nunca te entregou um mapa real da sua própria mente.</span>
                <br /><br />
                <span className="text-green-400 glow-text-soft glow-pulse-soft">Até agora.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            {benefits.map((benefit, index) => (
              <ScrollReveal key={index} id={`benefit-${index}`} direction="up" delay={index * 200}>
                <Card className="bg-gradient-to-br from-white/10 to-white/5 border-2 border-green-400/20 backdrop-blur-md hover:bg-white/15 transition-all duration-500 hover:scale-105 group glow-card-soft">
                  <CardContent className="p-4 sm:p-8">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                      <h3 className="text-lg sm:text-xl font-bold text-white">{benefit}</h3>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL - O PORTAL (Nova Seção de Vendas) */}
      <section className="relative py-20 sm:py-40 px-4 sm:px-6 z-10 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          {/* Mapa neural pulsando no fundo */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl glow-pulse-soft opacity-40" 
            style={{ transform: `translateY(${scrollY * 0.2}px)` }}
          />
          
          <div className="relative z-10">
            <ScrollReveal id="final-cta-title" direction="scale" delay={200}>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-black mb-8 sm:mb-12 leading-tight">
                <span className="block text-white mb-2 sm:mb-4">O que você não vê...</span>
                <span className="block text-red-400 glow-text-soft glow-pulse-soft">te controla.</span>
                <span className="block text-white mb-2 sm:mb-4 mt-4 sm:mt-8">O que você vê...</span>
                <span className="block text-green-400 glow-text-soft glow-pulse-soft">te liberta.</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal id="final-cta-subtitle" direction="up" delay={400}>
              <div className="mb-12 sm:mb-16 space-y-4 sm:space-y-6">
                <p className="text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                  Ative seu Observatório.
                </p>
                <p className="text-xl sm:text-3xl md:text-4xl text-cyan-400 font-bold leading-tight">
                  Veja sua própria mente funcionando.
                </p>
                
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-2xl p-6 sm:p-8 mx-auto max-w-2xl mt-8 sm:mt-12">
                  <div className="flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mr-3" />
                    <span className="text-2xl sm:text-3xl font-bold text-green-400">7 dias grátis</span>
                  </div>
                  <p className="text-lg sm:text-xl text-white mb-2">
                    Depois, apenas <span className="font-black text-green-400">R$ 47/mês</span>
                  </p>
                  <p className="text-base sm:text-lg text-gray-300">
                    Sem contratos. Sem pegadinhas.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal id="final-cta-button" direction="up" delay={600}>
              <Button 
                onClick={handleAccessObservatory}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-12 sm:px-20 py-8 sm:py-12 text-xl sm:text-3xl font-black rounded-3xl shadow-2xl shadow-green-500/40 border-4 border-green-400/30 backdrop-blur-sm glow-button-soft group transform hover:scale-110 transition-all duration-700 mb-6 sm:mb-8"
              >
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 mr-4 sm:mr-6 group-hover:rotate-12 transition-transform duration-500" />
                <div className="text-center">
                  <div className="font-black">ACESSAR MEU OBSERVATÓRIO AGORA</div>
                  <div className="text-lg sm:text-xl font-normal opacity-90">7 DIAS GRÁTIS</div>
                </div>
                <Flame className="w-8 h-8 sm:w-10 sm:h-10 ml-4 sm:ml-6 group-hover:scale-110 transition-transform duration-500" />
              </Button>
            </ScrollReveal>

            <ScrollReveal id="final-cta-tagline" direction="up" delay={800}>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-400 italic font-light px-4">
                Consciência não é luxo. É sobrevivência mental.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Estilos CSS customizados mais suaves e harmônicos */}
      <style>{`
        .glow-text-soft {
          text-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
        }
        
        .glow-button-soft {
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.25), 0 0 30px rgba(16, 185, 129, 0.12);
        }
        
        .glow-button-soft:hover {
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.35), 0 0 40px rgba(16, 185, 129, 0.2);
        }
        
        .glow-card-soft {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.12), 0 0 30px rgba(147, 51, 234, 0.08);
        }
        
        .glow-card-soft:hover {
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.25), 0 0 50px rgba(147, 51, 234, 0.15);
        }
        
        .glow-soft {
          box-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
        }
        
        .glow-pulse-soft {
          animation: pulse-glow-soft 4s ease-in-out infinite;
        }
        
        @keyframes pulse-glow-soft {
          0%, 100% { 
            opacity: 0.8;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.02);
          }
        }
        
        @media (max-width: 768px) {
          .glow-text-soft {
            text-shadow: 0 0 5px currentColor, 0 0 10px currentColor;
          }
          
          .glow-button-soft {
            box-shadow: 0 0 10px rgba(34, 197, 94, 0.25), 0 0 20px rgba(16, 185, 129, 0.12);
          }
        }
      `}</style>
    </div>
  );
}
