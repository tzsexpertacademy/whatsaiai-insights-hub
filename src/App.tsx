
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { ClientConfigProvider } from "@/contexts/ClientConfigContext";
import { AnalysisDataProvider } from "@/contexts/AnalysisDataContext";
import { ThemeProvider } from "@/hooks/useTheme";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppRouter } from "@/components/AppRouter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <AuthProvider>
            <AdminProvider>
              <ClientConfigProvider>
                <AnalysisDataProvider>
                  <SidebarProvider defaultOpen={true}>
                    <AppRouter />
                  </SidebarProvider>
                </AnalysisDataProvider>
              </ClientConfigProvider>
            </AdminProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
