
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Zap, Bot, Smartphone } from 'lucide-react';
import { RealQRCodeGenerator } from './RealQRCodeGenerator';
import { QRCodeGenerator } from './QRCodeGenerator';
import { MakeConfig } from './MakeConfig';
import { WhatsAppPlatformConfig } from './WhatsAppPlatformConfig';
import { useSearchParams } from 'react-router-dom';

export function WhatsAppConfig() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('real');

  // Handle URL parameters to set the active tab
  useEffect(() => {
    const subtab = searchParams.get('subtab');
    if (subtab === 'chat') {
      setActiveTab('real'); // Set to real tab which contains the chat functionality
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="real" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            WhatsApp Real
          </TabsTrigger>
          <TabsTrigger value="make" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Make.com
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Plataformas
          </TabsTrigger>
          <TabsTrigger value="legacy" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Legacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="real">
          <RealQRCodeGenerator />
        </TabsContent>

        <TabsContent value="make">
          <MakeConfig />
        </TabsContent>

        <TabsContent value="platform">
          <WhatsAppPlatformConfig />
        </TabsContent>

        <TabsContent value="legacy">
          <QRCodeGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
