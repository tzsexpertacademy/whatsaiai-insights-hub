
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClientConfigProvider } from "@/contexts/ClientConfigContext";
import { ThemeProvider } from "@/hooks/useTheme";
import { AppRouter } from "@/components/AppRouter";

const queryClient = new QueryClient();

const App = () => {
  console.log('App component rendering');
  
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="observatorio-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <ClientConfigProvider>
                  <AppRouter />
                </ClientConfigProvider>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('Error in App component:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro Crítico da Aplicação</h1>
          <p className="text-gray-600">Verifique o console do navegador para mais detalhes</p>
        </div>
      </div>
    );
  }
};

export default App;
