
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
      
      // Verificar se já está gravando
      if (isRecording) {
        console.warn('⚠️ Já está gravando');
        return;
      }

      // Limpar estado anterior
      cleanup();

      // Solicitar permissão do microfone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      console.log('📺 Stream de áudio obtido');

      // Verificar se o MediaRecorder suporta o formato
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/mpeg'
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error('Nenhum formato de áudio suportado pelo navegador');
      }

      console.log('🎵 Formato selecionado:', selectedMimeType);

      // Setup MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: selectedMimeType
      });

      audioChunksRef.current = [];

      // Configurar eventos do MediaRecorder
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('📦 Chunk de áudio recebido:', event.data.size, 'bytes');
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

        // Loop de análise de áudio
        const updateAudioLevel = () => {
          if (analyserRef.current && isRecording) {
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
            const normalizedLevel = Math.min(average / 128, 1); // Normalizar para 0-1
            setAudioLevel(normalizedLevel);
            animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
          }
        };

        updateAudioLevel();
      } catch (audioContextError) {
        console.warn('⚠️ Não foi possível criar contexto de áudio para feedback visual:', audioContextError);
        // Continuar sem feedback visual
      }

      // Iniciar gravação
      mediaRecorderRef.current.start(100); // Coletar dados a cada 100ms
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
          if (audioChunksRef.current.length === 0) {
            throw new Error('Nenhum dado de áudio foi capturado');
          }

          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
          });
          
          console.log('📄 Áudio gravado:', {
            size: audioBlob.size,
            type: audioBlob.type,
            chunks: audioChunksRef.current.length
          });

          if (audioBlob.size === 0) {
            throw new Error('Arquivo de áudio vazio');
          }

          // Converter blob para base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            const base64Audio = base64String.split(',')[1]; // Remove o prefixo data:audio/...;base64,
            
            console.log('✅ Áudio convertido para base64, tamanho:', base64Audio.length);
            
            toast({
              title: "✅ Gravação concluída",
              description: "Áudio processado com sucesso",
            });
            
            resolve(base64Audio);
          };
          
          reader.onerror = () => {
            console.error('❌ Erro ao converter áudio para base64');
            toast({
              title: "❌ Erro no processamento",
              description: "Não foi possível processar o áudio gravado",
              variant: "destructive",
            });
            resolve(null);
          };
          
          reader.readAsDataURL(audioBlob);

        } catch (error) {
          console.error('❌ Erro ao processar áudio:', error);
          toast({
            title: "❌ Erro no processamento",
            description: error instanceof Error ? error.message : "Erro desconhecido ao processar áudio",
            variant: "destructive",
          });
          resolve(null);
        } finally {
          cleanup();
        }
      };

      // Parar o MediaRecorder
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
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
