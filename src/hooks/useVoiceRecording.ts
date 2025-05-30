import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseVoiceRecordingReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  audioLevel: number;
}

export function useVoiceRecording(): UseVoiceRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const cleanup = useCallback(() => {
    // Parar animação
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Fechar contexto de áudio
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Parar todas as tracks do stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🔇 Track parada:', track.kind);
      });
      streamRef.current = null;
    }

    // Limpar MediaRecorder
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }

    setAudioLevel(0);
    console.log('🧹 Cleanup de áudio completo');
  }, []);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Iniciando gravação de áudio...');
      
      if (isRecording) {
        console.warn('⚠️ Já está gravando');
        return;
      }

      cleanup();

      // Solicitar permissão do microfone com configurações específicas para melhor qualidade
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100, // Mudança para qualidade CD
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          volume: 1.0
        }
      });

      streamRef.current = stream;
      console.log('📺 Stream de áudio obtido com configurações:', {
        sampleRate: 44100,
        channelCount: 1,
        tracks: stream.getAudioTracks().map(track => ({
          kind: track.kind,
          label: track.label,
          enabled: track.enabled,
          muted: track.muted,
          settings: track.getSettings()
        }))
      });

      // Usar apenas WebM com Opus para melhor compatibilidade
      const preferredMimeType = 'audio/webm;codecs=opus';
      
      if (!MediaRecorder.isTypeSupported(preferredMimeType)) {
        console.error('❌ Formato preferido não suportado:', preferredMimeType);
        throw new Error('Navegador não suporta gravação de áudio no formato necessário');
      }

      console.log('✅ Usando formato:', preferredMimeType);

      // Configurar MediaRecorder com configurações otimizadas
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: preferredMimeType,
        audioBitsPerSecond: 128000
      });

      audioChunksRef.current = [];

      // Configurar eventos do MediaRecorder
      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('📦 Chunk recebido:', {
          size: event.data.size,
          type: event.data.type,
          timestamp: new Date().toISOString()
        });
        
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('❌ Erro no MediaRecorder:', event);
        toast({
          title: "Erro na gravação",
          description: "Erro interno do gravador de áudio",
          variant: "destructive",
        });
      };

      // Setup análise de áudio para feedback visual
      try {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        
        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateAudioLevel = () => {
          if (analyserRef.current && isRecording) {
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
            const normalizedLevel = Math.min(average / 128, 1);
            setAudioLevel(normalizedLevel);
            animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
          }
        };

        updateAudioLevel();
      } catch (audioContextError) {
        console.warn('⚠️ Não foi possível criar contexto de áudio para feedback visual:', audioContextError);
      }

      // Iniciar gravação com coleta frequente de dados
      mediaRecorderRef.current.start(250); // Coletar dados a cada 250ms
      setIsRecording(true);

      console.log('✅ Gravação iniciada com sucesso');
      
      toast({
        title: "🎤 Gravação iniciada",
        description: "Fale agora, sua voz está sendo gravada",
      });

    } catch (error) {
      console.error('❌ Erro ao iniciar gravação:', error);
      
      cleanup();
      setIsRecording(false);
      
      let errorMessage = "Não foi possível acessar o microfone";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Permissão de microfone negada. Permita o acesso ao microfone e tente novamente.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "Nenhum microfone encontrado. Conecte um microfone e tente novamente.";
        } else if (error.name === 'NotReadableError') {
          errorMessage = "Microfone está sendo usado por outro aplicativo.";
        }
      }
      
      toast({
        title: "❌ Erro na gravação",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [isRecording, toast, cleanup]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        console.warn('⚠️ Nenhuma gravação ativa para parar');
        resolve(null);
        return;
      }

      console.log('🛑 Parando gravação...');

      mediaRecorderRef.current.onstop = async () => {
        try {
          console.log('🔍 Processando gravação parada:', {
            totalChunks: audioChunksRef.current.length,
            chunkSizes: audioChunksRef.current.map(chunk => chunk.size),
            totalSize: audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0)
          });

          if (audioChunksRef.current.length === 0) {
            throw new Error('Nenhum dado de áudio foi capturado');
          }

          // Criar blob com verificação detalhada
          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm;codecs=opus';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          console.log('📄 Áudio final criado:', {
            size: audioBlob.size,
            type: audioBlob.type,
            chunks: audioChunksRef.current.length,
            sizeInKB: Math.round(audioBlob.size / 1024),
            durationEstimate: `~${Math.round(audioBlob.size / 16000)} segundos`
          });

          // Verificações de qualidade
          if (audioBlob.size === 0) {
            throw new Error('Arquivo de áudio vazio');
          }

          if (audioBlob.size < 2048) { // Mínimo 2KB
            console.warn('⚠️ Áudio muito pequeno:', audioBlob.size, 'bytes');
            throw new Error('Áudio muito curto. Fale por pelo menos 2 segundos.');
          }

          if (audioBlob.size > 25 * 1024 * 1024) { // Máximo 25MB
            throw new Error('Áudio muito longo. Máximo de 25MB permitido.');
          }

          // Converter blob para base64 com validação
          const reader = new FileReader();
          reader.onloadend = () => {
            try {
              const result = reader.result as string;
              console.log('📝 Conversão para base64:', {
                totalLength: result.length,
                hasPrefix: result.includes('data:'),
                hasComma: result.includes(','),
                prefix: result.substring(0, 50)
              });
              
              if (!result || !result.includes(',')) {
                throw new Error('Erro na conversão do áudio para base64');
              }
              
              const base64Audio = result.split(',')[1];
              
              if (!base64Audio || base64Audio.length === 0) {
                throw new Error('Áudio vazio após conversão para base64');
              }

              // Validar base64
              try {
                atob(base64Audio.substring(0, 100)); // Testar decodificação de uma parte pequena
              } catch (decodeError) {
                console.error('❌ Base64 inválido:', decodeError);
                throw new Error('Dados de áudio corrompidos');
              }
              
              console.log('✅ Áudio pronto para transcrição:', {
                base64Length: base64Audio.length,
                estimatedSizeKB: Math.round(base64Audio.length * 0.75 / 1024),
                firstChars: base64Audio.substring(0, 20),
                lastChars: base64Audio.substring(base64Audio.length - 20)
              });
              
              toast({
                title: "✅ Gravação concluída",
                description: `Áudio de ${Math.round(audioBlob.size / 1024)}KB processado`,
              });
              
              resolve(base64Audio);
            } catch (conversionError) {
              console.error('❌ Erro na conversão final:', conversionError);
              toast({
                title: "❌ Erro no processamento",
                description: "Erro ao converter áudio para transcrição",
                variant: "destructive",
              });
              resolve(null);
            }
          };
          
          reader.onerror = (error) => {
            console.error('❌ Erro ao ler arquivo:', error);
            toast({
              title: "❌ Erro no processamento",
              description: "Não foi possível processar o áudio gravado",
              variant: "destructive",
            });
            resolve(null);
          };
          
          reader.readAsDataURL(audioBlob);

        } catch (error) {
          console.error('❌ Erro ao processar áudio final:', error);
          toast({
            title: "❌ Erro no processamento",
            description: error instanceof Error ? error.message : "Erro desconhecido",
            variant: "destructive",
          });
          resolve(null);
        } finally {
          cleanup();
        }
      };

      // Parar o MediaRecorder com verificação de estado
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          console.log('📻 MediaRecorder parado');
        } else {
          console.warn('⚠️ MediaRecorder não estava gravando:', mediaRecorderRef.current.state);
        }
      } catch (error) {
        console.error('❌ Erro ao parar MediaRecorder:', error);
        cleanup();
        resolve(null);
      }
      
      setIsRecording(false);
    });
  }, [isRecording, toast, cleanup]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioLevel
  };
}
