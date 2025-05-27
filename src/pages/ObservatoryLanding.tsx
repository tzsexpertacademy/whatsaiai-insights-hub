import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
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
  Rocket
} from 'lucide-react';

export function ObservatoryLanding() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLCanvasElement>(null);

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

  const handleAccessObservatory = () => {
    navigate('/dashboard');
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
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Canvas de partículas neurais */}
      <canvas
        ref={particlesRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.95) 0%, rgba(0, 0, 0, 1) 100%)' }}
      />

      {/* Seção 1 - ABERTURA BRUTAL */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 z-10">
        <div className="text-center max-w-6xl mx-auto">
          {/* Glow central mais intenso */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 blur-3xl animate-pulse" />
          
          <div className="relative z-10">
            <Badge className="mb-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-8 py-3 text-xl animate-pulse glow-intense">
              <Sparkles className="w-6 h-6 mr-3 animate-spin" />
              Powered by Yumer IA™ - IA de Consciência Humana
            </Badge>

            <h1 className="text-6xl md:text-8xl font-black mb-12 leading-tight">
              <span className="block text-white mb-4">O que você não vê...</span>
              <span className="block text-cyan-400 glow-text-intense animate-pulse">te controla.</span>
              <span className="block text-white mb-4 mt-8">O que você vê...</span>
              <span className="block text-green-400 glow-text-intense animate-pulse">te liberta.</span>
            </h1>

            <div className="mb-16 space-y-6">
              <p className="text-3xl md:text-4xl font-bold text-white">
                O primeiro Observatório da sua própria consciência.
              </p>
              <p className="text-2xl md:text-3xl text-blue-300">
                Um painel vivo da sua mente.
              </p>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
                Seus padrões. Suas forças. Suas sombras. Sua rota de expansão.
              </p>
            </div>

            {/* Botões e restante da seção hero */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-12">
              <Button 
                onClick={handleAccessObservatory}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-16 py-8 text-2xl font-bold rounded-2xl shadow-2xl shadow-blue-500/50 border-2 border-blue-400/50 backdrop-blur-sm glow-button group transform hover:scale-105 transition-all duration-300 animate-pulse"
              >
                <Brain className="w-8 h-8 mr-4 group-hover:animate-spin" />
                ACESSAR MEU OBSERVATÓRIO AGORA
                <ArrowRight className="w-8 h-8 ml-4 group-hover:translate-x-2 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                className="border-2 border-cyan-400/70 text-cyan-400 hover:bg-cyan-400/20 px-8 py-8 text-lg rounded-2xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
              >
                <Play className="w-6 h-6 mr-3" />
                Ou veja como funciona ↓
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 2 - O CHOQUE */}
      <section className="relative py-32 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-black mb-8 text-white">
              Você nunca viu isso.
              <br />
              <span className="text-red-400 glow-text">Porque isso nunca existiu.</span>
            </h2>
            
            <p className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-5xl mx-auto leading-relaxed">
              O Observatório lê suas reflexões, detecta padrões ocultos, e te entrega clareza real sobre quem você é — e quem pode se tornar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {observatoryFeatures.map((feature, index) => (
              <Card key={index} className="bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-500 hover:scale-110 hover:rotate-1 group glow-card">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:animate-pulse">
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 text-lg">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 3 - PARA QUEM É ISSO */}
      <section className="relative py-32 px-6 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-6xl md:text-7xl font-black mb-16 text-white leading-tight">
            Isso não é pra quem tá confortável
            <br />
            <span className="text-orange-400 glow-text">em viver no automático.</span>
          </h2>
          
          <p className="text-2xl md:text-3xl text-gray-300 mb-12 leading-relaxed">
            É pra quem tá pronto pra enxergar o que evitou por anos.
            <br />
            <span className="text-yellow-400 font-bold">Seus padrões. Suas repetições. Suas fugas. Suas potências.</span>
          </p>

          <div className="space-y-6 text-xl md:text-2xl text-gray-300 mb-16">
            {targetProfiles.map((profile, index) => (
              <div key={index} className="flex items-center justify-center group">
                <Target className="w-8 h-8 text-orange-400 mr-4 group-hover:animate-spin" />
                <span className="font-semibold">{profile}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 4 - COMO FUNCIONA */}
      <section className="relative py-32 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-6xl md:text-7xl font-black text-center mb-20 text-white">
            Como <span className="bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent glow-text">Funciona</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-16">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-5xl font-black text-white group-hover:scale-125 transition-transform duration-500 glow-intense">
                  {step.number}
                </div>
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:animate-bounce">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">{step.title}</h3>
                <p className="text-gray-300 text-lg leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 5 - O VALOR INIMAGINÁVEL */}
      <section className="relative py-32 px-6 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-16 text-white leading-tight">
              Você já investiu em cursos, livros, terapias, mentorias...
              <br /><br />
              <span className="text-yellow-400">E mesmo assim...</span>
              <br /><br />
              <span className="text-red-400 glow-text">Ninguém nunca te entregou um mapa real da sua própria mente.</span>
              <br /><br />
              <span className="text-green-400 glow-text animate-pulse">Até agora.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-gradient-to-br from-white/15 to-white/5 border-2 border-green-400/30 backdrop-blur-md hover:bg-white/20 transition-all duration-300 hover:scale-105 group glow-card">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Lightbulb className="w-8 h-8 text-yellow-400 mr-4 group-hover:animate-pulse" />
                    <h3 className="text-xl font-bold text-white">{benefit}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL - O PORTAL */}
      <section className="relative py-40 px-6 z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Glow central mais dramático */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-cyan-500/40 blur-3xl animate-pulse" />
          
          <div className="relative z-10">
            <h2 className="text-6xl md:text-8xl font-black mb-12 leading-tight">
              <span className="block text-white mb-4">O que você não vê...</span>
              <span className="block text-cyan-400 glow-text-intense animate-pulse">te controla.</span>
              <span className="block text-white mb-4 mt-8">O que você vê...</span>
              <span className="block text-green-400 glow-text-intense animate-pulse">te liberta.</span>
            </h2>

            <Button 
              onClick={handleAccessObservatory}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-20 py-12 text-3xl font-black rounded-3xl shadow-2xl shadow-blue-500/50 border-4 border-blue-400/50 backdrop-blur-sm glow-button-intense group transform hover:scale-110 transition-all duration-500 animate-pulse mb-8"
            >
              <Rocket className="w-10 h-10 mr-6 group-hover:animate-bounce" />
              ACESSAR MEU OBSERVATÓRIO AGORA
              <Flame className="w-10 h-10 ml-6 group-hover:animate-spin" />
            </Button>

            <p className="text-xl md:text-2xl text-gray-400 italic font-light">
              Consciência não é um luxo. É um direito vitalício.
            </p>
          </div>
        </div>
      </section>

      {/* Estilos CSS customizados mais intensos */}
      <style>{`
        .glow-text {
          text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
        }
        
        .glow-text-intense {
          text-shadow: 0 0 30px currentColor, 0 0 60px currentColor, 0 0 90px currentColor;
        }
        
        .glow-button {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(147, 51, 234, 0.3);
        }
        
        .glow-button-intense {
          box-shadow: 0 0 50px rgba(59, 130, 246, 0.8), 0 0 100px rgba(147, 51, 234, 0.6), 0 0 150px rgba(6, 182, 212, 0.4);
        }
        
        .glow-button:hover {
          box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 80px rgba(147, 51, 234, 0.6);
        }
        
        .glow-card {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.2), 0 0 40px rgba(147, 51, 234, 0.1);
        }
        
        .glow-card:hover {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(147, 51, 234, 0.3);
        }
        
        .glow-intense {
          box-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px currentColor; }
          50% { box-shadow: 0 0 40px currentColor, 0 0 60px currentColor; }
        }
      `}</style>
    </div>
  );
}
