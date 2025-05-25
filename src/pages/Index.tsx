
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { InsightsDashboard } from '@/components/InsightsDashboard';
import { AreasOfLife } from '@/components/AreasOfLife';
import { BehavioralProfile } from '@/components/BehavioralProfile';
import { EmotionalThermometer } from '@/components/EmotionalThermometer';
import { ObservatoryTimeline } from '@/components/ObservatoryTimeline';
import { Recommendations } from '@/components/Recommendations';
import { WhatsAppConnection } from '@/components/WhatsAppConnection';
import { SettingsPage } from '@/components/SettingsPage';
import { ProfilePage } from '@/components/ProfilePage';
import { ClientManagement } from '@/components/admin/ClientManagement';
import { DocumentAnalysis } from '@/components/DocumentAnalysis';

// Criamos um componente wrapper para carregar componentes dinâmicos que usam bibliotecas externas
const DynamicComponentLoader = ({ Component }) => {
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return <div className="p-8 text-center">Carregando...</div>;
  }
  
  return <Component />;
};

const Index = () => {
  console.log('Dashboard component rendering - current path:', window.location.pathname);
  
  try {
    console.log('Dashboard - Rendering main layout');
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <DashboardHeader />
              <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                <div className="max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={
                      <>
                        {console.log('Dashboard - Rendering InsightsDashboard')}
                        <InsightsDashboard />
                      </>
                    } />
                    <Route path="/areas" element={
                      <>
                        {console.log('Dashboard - Rendering AreasOfLife')}
                        <AreasOfLife />
                      </>
                    } />
                    <Route path="/profile" element={
                      <>
                        {console.log('Dashboard - Rendering BehavioralProfile')}
                        <BehavioralProfile />
                      </>
                    } />
                    <Route path="/emotions" element={
                      <>
                        {console.log('Dashboard - Rendering EmotionalThermometer')}
                        <EmotionalThermometer />
                      </>
                    } />
                    <Route path="/timeline" element={
                      <>
                        {console.log('Dashboard - Rendering ObservatoryTimeline')}
                        <ObservatoryTimeline />
                      </>
                    } />
                    <Route path="/recommendations" element={
                      <>
                        {console.log('Dashboard - Rendering Recommendations')}
                        <Recommendations />
                      </>
                    } />
                    <Route path="/connection" element={
                      <>
                        {console.log('Dashboard - Rendering WhatsAppConnection')}
                        <WhatsAppConnection />
                      </>
                    } />
                    <Route path="/analysis" element={
                      <>
                        {console.log('Dashboard - Rendering DocumentAnalysis')}
                        <DocumentAnalysis />
                      </>
                    } />
                    <Route path="/settings" element={
                      <>
                        {console.log('Dashboard - Rendering SettingsPage')}
                        <DynamicComponentLoader Component={SettingsPage} />
                      </>
                    } />
                    <Route path="/user-profile" element={
                      <>
                        {console.log('Dashboard - Rendering ProfilePage (user-profile)')}
                        <ProfilePage />
                      </>
                    } />
                    <Route path="/perfil" element={
                      <>
                        {console.log('Dashboard - Rendering ProfilePage (perfil)')}
                        <ProfilePage />
                      </>
                    } />
                    <Route path="/admin/clients" element={
                      <>
                        {console.log('Dashboard - Rendering ClientManagement')}
                        <ClientManagement />
                      </>
                    } />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>
    );
  } catch (error) {
    console.error('Error in Dashboard component:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro de Renderização no Dashboard</h1>
          <p className="text-gray-600">Erro: {error.message}</p>
          <p className="text-gray-500">Verifique o console para mais detalhes</p>
        </div>
      </div>
    );
  }
};

export default Index;
