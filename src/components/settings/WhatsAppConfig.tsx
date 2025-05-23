
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { QrCode, Smartphone, Wifi, WifiOff, Phone, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useClientConfig } from "@/contexts/ClientConfigContext";

// Baileys é importado apenas no lado do cliente para evitar erros de SSR
const BaileysImport = () => {
  if (typeof window !== 'undefined') {
    return import('@whiskeysockets/baileys');
  }
  return Promise.resolve(null);
};

// QRCode é importado apenas no lado do cliente
const QRCodeImport = () => {
  if (typeof window !== 'undefined') {
    return import('qrcode');
  }
  return Promise.resolve(null);
};

export function WhatsAppConfig() {
  const { config, updateConfig, saveConfig } = useClientConfig();
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [socket, setSocket] = useState<any>(null);
  const { toast } = useToast();

  const whatsappConfig = config.whatsapp;

  // Efetuar limpeza quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (socket) {
        try {
          socket.logout();
          socket.end(undefined);
        } catch (err) {
          console.error('Erro ao desconectar socket:', err);
        }
      }
    };
  }, [socket]);

  const generateQRCode = async () => {
    setIsGeneratingQr(true);
    setQrCodeData(null);
    
    try {
      // Importar Baileys dinamicamente
      const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = await BaileysImport();
      const QRCode = await QRCodeImport();
      
      if (!makeWASocket || !QRCode) {
        throw new Error('Falha ao carregar dependências');
      }
      
      // Configurar estado de autenticação
      const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
      
      // Criar socket WA
      const waSocket = makeWASocket({
        printQRInTerminal: false,
        auth: state,
        browser: ['Observatório WhatsApp', 'Chrome', '1.0.0'],
      });
      
      // Definir socket para uso posterior
      setSocket(waSocket);
      
      // Gerenciar eventos de conexão
      waSocket.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (connection === 'connecting') {
          setConnectionStatus('connecting');
        }
        
        // Quando receber QR code, converter para URL de imagem data
        if (qr) {
          try {
            const qrUrl = await QRCode.toDataURL(qr, { 
              margin: 3,
              scale: 8,
              errorCorrectionLevel: 'H'
            });
            setQrCodeData(qrUrl);
            updateConfig('whatsapp', { qrCode: qrUrl });
          } catch (err) {
            console.error('Erro ao gerar QR code:', err);
            toast({
              title: "Erro",
              description: "Falha ao gerar QR Code",
              variant: "destructive",
            });
          }
        }
        
        if (connection === 'open') {
          setConnectionStatus('connected');
          updateConfig('whatsapp', { isConnected: true });
          saveConfig();
          toast({
            title: "Conectado!",
            description: "WhatsApp conectado com sucesso",
          });
          setIsGeneratingQr(false);
        }
        
        if (connection === 'close') {
          setConnectionStatus('disconnected');
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          
          if (statusCode === DisconnectReason.loggedOut || statusCode === DisconnectReason.connectionClosed) {
            updateConfig('whatsapp', { isConnected: false, qrCode: '' });
            saveConfig();
            toast({
              title: "Desconectado",
              description: "A sessão do WhatsApp foi encerrada",
              variant: "destructive",
            });
          }
          
          setIsGeneratingQr(false);
        }
      });
      
      // Armazenar credenciais quando autenticado
      waSocket.ev.on('creds.update', saveCreds);
      
      // Ouvir mensagens recebidas
      waSocket.ev.on('messages.upsert', async (m: any) => {
        const message = m.messages[0];
        if (!message.key.fromMe) {
          // Processar mensagem recebida
          const senderJid = message.key.remoteJid;
          const messageContent = message.message?.conversation || 
                                message.message?.extendedTextMessage?.text || 
                                "Mídia recebida";
          
          console.log('Mensagem recebida:', { senderJid, messageContent });
          
          // Auto-responder se ativado
          if (whatsappConfig.autoReply) {
            await waSocket.sendMessage(senderJid, { 
              text: 'Recebemos sua mensagem! Responderemos em breve.' 
            });
          }
        }
      });
      
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      toast({
        title: "Erro de Conexão",
        description: "Falha ao inicializar conexão do WhatsApp",
        variant: "destructive",
      });
      setIsGeneratingQr(false);
    }
  };

  const handleConnect = async () => {
    if (!whatsappConfig.authorizedNumber) {
      toast({
        title: "Erro",
        description: "Por favor, informe o número autorizado",
        variant: "destructive",
      });
      return;
    }
    
    if (!whatsappConfig.isConnected) {
      // Iniciar processo de conexão
      await generateQRCode();
    }
  };

  const handleDisconnect = async () => {
    if (socket) {
      try {
        await socket.logout();
        socket.end(undefined);
        setSocket(null);
      } catch (err) {
        console.error('Erro ao desconectar:', err);
      }
    }
    
    updateConfig('whatsapp', { 
      isConnected: false, 
      qrCode: '' 
    });
    
    await saveConfig();
    
    toast({
      title: "Desconectado",
      description: "WhatsApp Business desconectado",
    });
    
    setConnectionStatus('disconnected');
    setQrCodeData(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              Status da Conexão
            </CardTitle>
            <CardDescription>
              Status atual do WhatsApp Business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              {whatsappConfig.isConnected ? (
                <>
                  <Wifi className="h-6 w-6 text-green-500" />
                  <span className="text-green-600 font-medium">Conectado</span>
                </>
              ) : connectionStatus === 'connecting' ? (
                <>
                  <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
                  <span className="text-amber-600 font-medium">Conectando...</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-6 w-6 text-red-500" />
                  <span className="text-red-600 font-medium">Desconectado</span>
                </>
              )}
            </div>
            
            {whatsappConfig.isConnected && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Número autorizado: {whatsappConfig.authorizedNumber}
                </p>
              </div>
            )}

            <div className="mt-4">
              <Label htmlFor="authorized">Número Autorizado (Conselheiro Principal)</Label>
              <Input
                id="authorized"
                placeholder="+55 11 99999-9999"
                value={whatsappConfig.authorizedNumber}
                onChange={(e) => updateConfig('whatsapp', { authorizedNumber: e.target.value })}
                disabled={whatsappConfig.isConnected || connectionStatus === 'connecting'}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Somente este número receberá respostas do conselheiro principal
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="autoReply">Resposta Automática</Label>
                <p className="text-xs text-gray-500">Enviar confirmação automática ao receber mensagens</p>
              </div>
              <Switch
                id="autoReply"
                checked={whatsappConfig.autoReply}
                onCheckedChange={(checked) => updateConfig('whatsapp', { autoReply: checked })}
              />
            </div>

            <div className="flex gap-2 mt-4">
              {!whatsappConfig.isConnected ? (
                <Button 
                  onClick={handleConnect} 
                  className="flex-1" 
                  disabled={!whatsappConfig.authorizedNumber || isGeneratingQr || connectionStatus === 'connecting'}
                >
                  {isGeneratingQr || connectionStatus === 'connecting' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    'Conectar WhatsApp'
                  )}
                </Button>
              ) : (
                <Button onClick={handleDisconnect} variant="destructive" className="flex-1">
                  Desconectar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-blue-600" />
              QR Code WhatsApp Business
            </CardTitle>
            <CardDescription>
              Escaneie com seu WhatsApp Business para conectar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!qrCodeData && !whatsappConfig.qrCode ? (
              <div className="text-center py-8">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Clique no botão abaixo para gerar o QR Code</p>
                <Button onClick={generateQRCode} disabled={isGeneratingQr || !whatsappConfig.authorizedNumber}>
                  {isGeneratingQr ? 'Gerando...' : 'Gerar QR Code'}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                  {connectionStatus === 'connecting' && !qrCodeData && !whatsappConfig.qrCode ? (
                    <div className="w-48 h-48 mx-auto rounded-lg flex items-center justify-center">
                      <Loader2 className="h-16 w-16 text-blue-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-64 h-64 mx-auto rounded-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src={qrCodeData || whatsappConfig.qrCode} 
                        alt="QR Code para WhatsApp" 
                        className="max-w-full max-h-full"
                      />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  1. Abra o WhatsApp Business no seu celular
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  2. Vá em Menu → Dispositivos conectados
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  3. Escaneie este código QR
                </p>
                <Button 
                  onClick={generateQRCode} 
                  variant="outline" 
                  size="sm"
                  disabled={isGeneratingQr || connectionStatus === 'connecting'}
                >
                  {isGeneratingQr ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    'Gerar Novo QR Code'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle>Como Funciona a Integração</CardTitle>
          <CardDescription>
            Entenda o fluxo de funcionamento do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
              <h3 className="font-medium text-blue-900 mb-1">Captura</h3>
              <p className="text-sm text-blue-700">Todas as conversas são capturadas automaticamente</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
              <h3 className="font-medium text-green-900 mb-1">Análise</h3>
              <p className="text-sm text-green-700">IA analisa padrões e comportamentos</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
              <h3 className="font-medium text-purple-900 mb-1">Insights</h3>
              <p className="text-sm text-purple-700">Dashboard exibe métricas e recomendações</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
