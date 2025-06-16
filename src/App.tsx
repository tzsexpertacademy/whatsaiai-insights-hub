
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ClientConfigProvider } from './contexts/ClientConfigContext';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { WhatsAppConnection } from './components/WhatsAppConnection';
import { ChatInterface } from './components/ChatInterface';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { ConversationAnalysisDashboard } from '@/components/whatsapp/ConversationAnalysisDashboard';
import { WhatsAppAPIHubPage } from '@/components/WhatsAppAPIHubPage';

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <ClientConfigProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <Toaster />
            <QueryClientProvider client={queryClient}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/whatsapp" element={<WhatsAppConnection />} />
                <Route path="/chat" element={<ChatInterface />} />
                <Route path="/analysis" element={<ConversationAnalysisDashboard />} />
                
                <Route path="/whatsapp-api-hub" element={<WhatsAppAPIHubPage />} />
                
              </Routes>
            </QueryClientProvider>
          </div>
        </BrowserRouter>
      </ClientConfigProvider>
    </AuthProvider>
  );
}

export default App;
