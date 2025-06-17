
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { ClientConfigProvider } from './contexts/ClientConfigContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { AppRouter } from './components/AppRouter';

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <ClientConfigProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <Toaster />
                <AppRouter />
              </div>
            </BrowserRouter>
          </QueryClientProvider>
        </ClientConfigProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
