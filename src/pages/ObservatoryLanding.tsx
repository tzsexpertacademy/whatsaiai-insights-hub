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
  Quote
} from 'lucide-react';

export function ObservatoryLanding() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLCanvasElement>(null);

  // Animação de partículas neurais
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
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Criar partículas
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: Math.random() * 100,
        maxLife: 100 + Math.random() * 100
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        if (particle.life > particle.maxLife) {
          particles[index] = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            life: 0,
            maxLife: 100 + Math.random() * 100
          };
        }

        // Desenhar partícula
        const alpha = 1 - particle.life / particle.maxLife;
        ctx.fillStyle = `rgba(59, 130, 246, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
        ctx.fill();

        // Conectar partículas próximas
        particles.forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const lineAlpha = (1 - distance / 100) * alpha * 0.3;
            ctx.strokeStyle = `rgba(59, 130, 246, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
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

  const benefits = [
    {
      icon: Brain,
      title: "Clareza Mental",
      description: "Entenda onde você está, quem você é, e pra onde quer ir."
    },
    {
      icon: Zap,
      title: "Gestão Emocional", 
      description: "Veja seus padrões emocionais. Ajuste. Evolua."
    },
    {
      icon: Target,
      title: "Desbloqueio Cognitivo",
      description: "Pare de pensar pequeno. Rompa loops. Amplie sua visão."
    },
    {
      icon: TrendingUp,
      title: "Alta Performance Pessoal",
      description: "Alinhe mente, energia e ação."
    },
    {
      icon: Compass,
      title: "Propósito Ativado",
      description: "Deixe de sobreviver. Comece a viver com intenção real."
    }
  ];

  const features = [
    "Termômetro Emocional",
    "Mapa de Áreas da Vida", 
    "Análise de Padrões Cognitivos",
    "Radar de Habilidades"
  ];

  const testimonials = [
    {
      name: "Ana Silva",
      role: "Executiva",
      content: "Finalmente entendi meus padrões de autossabotagem. Mudou minha vida profissional.",
      rating: 5
    },
    {
      name: "Carlos Santos",
      role: "Empreendedor", 
      content: "Ver minha mente mapeada foi revelador. Agora tomo decisões com muito mais clareza.",
      rating: 5
    },
    {
      name: "Maria Costa",
      role: "Psicóloga",
      content: "Uma ferramenta revolucionária para autoconhecimento. Uso com meus pacientes também.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Canvas de partículas */}
      <canvas
        ref={particlesRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.9) 0%, rgba(0, 0, 0, 1) 100%)' }}
      />

      {/* Header/Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Efeito de brilho central */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl" />
          
          <div className="relative z-10">
            <Badge className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-6 py-2 text-lg animate-pulse">
              <Sparkles className="w-5 h-5 mr-2" />
              Powered by Kairon™ - IA de Consciência Humana
            </Badge>

            <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent leading-tight">
              O que você não vê...
              <br />
              <span className="text-cyan-400 glow-text">te controla.</span>
              <br />
              O que você vê...
              <br />
              <span className="text-green-400 glow-text">te liberta.</span>
            </h1>

            <p className="text-xl md:text-2xl mb-4 text-gray-300 max-w-4xl mx-auto leading-relaxed">
              A primeira plataforma de consciência pessoal.
            </p>
            <p className="text-2xl md:text-3xl mb-12 font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              O Observatório da sua própria mente.
            </p>
            <p className="text-lg md:text-xl mb-12 text-gray-400 max-w-3xl mx-auto">
              Descubra seus padrões. Suas forças. Suas sombras. Sua rota de evolução.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                onClick={handleAccessObservatory}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-6 text-xl rounded-xl shadow-2xl shadow-blue-500/25 border border-blue-400/30 backdrop-blur-sm hover-glow group"
              >
                <Brain className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                Acessar meu Observatório
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                className="border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 px-8 py-6 text-lg rounded-xl backdrop-blur-sm"
              >
                <Play className="w-5 h-5 mr-2" />
                Ver como funciona
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 2 - O Que É */}
      <section className="relative py-32 px-6 z-10">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white">
            Você nunca teve acesso a isso.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Até agora.
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed">
            O Observatório lê suas conversas, seus pensamentos, suas reflexões — e transforma tudo em clareza.
            <br /><br />
            <span className="text-blue-400 font-semibold">Um mapa vivo da sua consciência.</span>
            <br /><br />
            Ele te mostra seus padrões mentais, emocionais e comportamentais.
            Mostra seus pontos cegos. Suas zonas de expansão.
            E te entrega dados, gráficos e reflexões sobre quem você é — e quem pode se tornar.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:animate-pulse">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 3 - Como Funciona */}
      <section className="relative py-32 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-20 text-white">
            Como <span className="bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">Funciona</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-4xl font-bold text-white group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Fale com seu segundo cérebro</h3>
              <p className="text-gray-300 text-lg">
                Interaja, escreva, fale. O Observatório lê suas reflexões, suas perguntas, seus pensamentos.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Ele escaneia sua consciência</h3>
              <p className="text-gray-300 text-lg">
                Inteligência semântica, emocional e comportamental. Ele detecta padrões que você nem sabia que existiam.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-4xl font-bold text-white group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Você recebe seu Mapa da Mente</h3>
              <p className="text-gray-300 text-lg">
                Um painel interativo com seus padrões, forças, gaps, pontos cegos, habilidades e sua evolução no tempo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 4 - Benefícios */}
      <section className="relative py-32 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-8 text-white">
            Autoconhecimento não é luxo.
            <br />
            <span className="bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
              É sobrevivência mental.
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:scale-105 group hover-glow">
                <CardContent className="p-8">
                  <benefit.icon className="w-12 h-12 text-cyan-400 mb-6 group-hover:animate-pulse" />
                  <h3 className="text-2xl font-bold text-white mb-4">{benefit.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 5 - Para Quem É */}
      <section className="relative py-32 px-6 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-16 text-white">
            Para <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Quem É</span> Isso?
          </h2>
          
          <div className="space-y-8 text-xl md:text-2xl text-gray-300">
            <p className="flex items-center justify-center">
              <Target className="w-8 h-8 text-orange-400 mr-4" />
              Pra quem quer parar de se sabotar.
            </p>
            <p className="flex items-center justify-center">
              <Eye className="w-8 h-8 text-blue-400 mr-4" />
              Pra quem quer clareza sobre si.
            </p>
            <p className="flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-green-400 mr-4" />
              Pra quem quer elevar sua vida, sua carreira, seus relacionamentos, sua saúde mental e física.
            </p>
            <p className="flex items-center justify-center">
              <Zap className="w-8 h-8 text-purple-400 mr-4" />
              Pra quem não aceita mais viver no automático.
            </p>
          </div>
        </div>
      </section>

      {/* Seção 6 - Depoimentos */}
      <section className="relative py-32 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-20 text-white">
            Quem já <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Despertou</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:rotate-1 group">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-cyan-400 mb-4 group-hover:animate-pulse" />
                  <p className="text-gray-300 text-lg mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-400">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-32 px-6 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl" />
          
          <div className="relative z-10">
            <h2 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent leading-tight">
              O que você não vê...
              <br />
              <span className="text-cyan-400 glow-text">te controla.</span>
              <br />
              O que você vê...
              <br />
              <span className="text-green-400 glow-text">te liberta.</span>
            </h2>

            <p className="text-2xl md:text-3xl mb-12 text-gray-300">
              Entre agora no seu Observatório.
              <br />
              <span className="text-white font-semibold">Acesso imediato. Sem limites. Sem desculpas.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button 
                onClick={handleAccessObservatory}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-16 py-8 text-2xl rounded-xl shadow-2xl shadow-blue-500/25 border border-blue-400/30 backdrop-blur-sm hover-glow group animate-pulse"
              >
                <Brain className="w-8 h-8 mr-4 group-hover:animate-pulse" />
                Acessar meu Observatório
                <ArrowRight className="w-8 h-8 ml-4 group-hover:translate-x-2 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                className="border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 px-12 py-8 text-xl rounded-xl backdrop-blur-sm"
              >
                Quero entender melhor
              </Button>
            </div>

            <p className="text-gray-500 text-lg italic">
              "Bem-vindo ao começo de quem você realmente é."
            </p>
          </div>
        </div>
      </section>

      {/* Estilos CSS customizados */}
      <style>{`
        .glow-text {
          text-shadow: 0 0 20px currentColor;
        }
        
        .hover-glow:hover {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
