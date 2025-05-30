
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWhatsAppConnection } from '@/hooks/useWhatsAppConnection';
import { Badge } from "@/components/ui/badge";
import { Zap, Download, ExternalLink, PlayCircle, CheckCircle, AlertCircle } from 'lucide-react';

export function MakeConfig() {
  const { 
    connectionState, 
    makeConfig, 
    updateMakeConfig, 
    toggleAutoReply,
    generateQRCode,
    getConnectionStatus
  } = useWhatsAppConnection();

  const status = getConnectionStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Make.com Configuration
            {connectionState.isConnected ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Configure webhooks for WhatsApp automation via Make.com
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="qrWebhook">QR Code Webhook</Label>
              <Input
                id="qrWebhook"
                value={makeConfig.qrWebhook}
                onChange={(e) => updateMakeConfig({ qrWebhook: e.target.value })}
                placeholder="https://hook.make.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusWebhook">Status Webhook</Label>
              <Input
                id="statusWebhook"
                value={makeConfig.statusWebhook}
                onChange={(e) => updateMakeConfig({ statusWebhook: e.target.value })}
                placeholder="https://hook.make.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sendWebhook">Send Message Webhook</Label>
              <Input
                id="sendWebhook"
                value={makeConfig.sendMessageWebhook}
                onChange={(e) => updateMakeConfig({ sendMessageWebhook: e.target.value })}
                placeholder="https://hook.make.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="autoReplyWebhook">Auto Reply Webhook</Label>
              <Input
                id="autoReplyWebhook"
                value={makeConfig.autoReplyWebhook}
                onChange={(e) => updateMakeConfig({ autoReplyWebhook: e.target.value })}
                placeholder="https://hook.make.com/..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="autoReply"
              checked={connectionState.autoReplyEnabled}
              onCheckedChange={toggleAutoReply}
              disabled={!connectionState.isConnected}
            />
            <Label htmlFor="autoReply">Enable Auto Reply</Label>
          </div>

          {!connectionState.isConnected && (
            <Button onClick={generateQRCode} className="w-full">
              Generate QR Code
            </Button>
          )}

          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              Configure these webhooks in Make.com to enable WhatsApp automation
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-green-500" />
            Make.com Templates
          </CardTitle>
          <CardDescription>
            Download pre-configured scenarios for quick setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-green-500" />
                Scenario 1: WhatsApp Connection
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Basic WhatsApp connection and QR code generation
              </p>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-blue-500" />
                Scenario 2: Message Handling
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Receive and process incoming WhatsApp messages
              </p>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-purple-500" />
                Scenario 3: AI Auto-Reply
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Intelligent automatic responses using AI
              </p>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>

          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription>
              <strong>Setup Guide:</strong> Follow our complete guide to configure WhatsApp automation with Make.com
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
