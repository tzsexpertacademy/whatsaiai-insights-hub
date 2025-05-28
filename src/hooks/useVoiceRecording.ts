
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
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Iniciando gravação de áudio...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Setup audio analysis for visual feedback
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Visual feedback loop
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setAudioLevel(average / 255);
          requestAnimationFrame(updateAudioLevel);
        }
      };

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      updateAudioLevel();

      console.log('✅ Gravação iniciada com sucesso');
      
      toast({
        title: "Gravação iniciada",
        description: "Fale agora, sua voz está sendo gravada",
      });

    } catch (error) {
      console.error('❌ Erro ao iniciar gravação:', error);
      toast({
        title: "Erro na gravação",
        description: "Não foi possível acessar o microfone",
        variant: "destructive",
      });
    }
  }, [isRecording, toast]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve(null);
        return;
      }

      console.log('🛑 Parando gravação...');

      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          console.log('📄 Áudio gravado:', audioBlob.size, 'bytes');

          // Convert blob to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            const base64Audio = base64String.split(',')[1]; // Remove data:audio/webm;base64, prefix
            
            console.log('✅ Áudio convertido para base64, tamanho:', base64Audio.length);
            resolve(base64Audio);
          };
          reader.readAsDataURL(audioBlob);

          // Cleanup
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }

          toast({
            title: "Gravação concluída",
            description: "Áudio processado com sucesso",
          });

        } catch (error) {
          console.error('❌ Erro ao processar áudio:', error);
          toast({
            title: "Erro no processamento",
            description: "Não foi possível processar o áudio gravado",
            variant: "destructive",
          });
          resolve(null);
        }
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);

      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    });
  }, [isRecording, toast]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioLevel
  };
}
