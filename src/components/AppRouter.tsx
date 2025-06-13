
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import { LoginPage } from '@/components/auth/LoginPage';
import { DashboardMain } from '@/components/dashboard/DashboardMain';
import { BehavioralProfile } from '@/components/BehavioralProfile';
import { AreasOfLife } from '@/components/AreasOfLife';
import { DailyRoutine } from '@/components/DailyRoutine';
import { VoiceChatInterface } from '@/components/VoiceChatInterface';
import { PainPointsAnalysis } from '@/components/PainPointsAnalysis';
import { DocumentAnalysis } from '@/components/DocumentAnalysis';
import { InsightsDashboard } from '@/components/InsightsDashboard';
import { Recommendations } from '@/components/Recommendations';
import { SettingsPage } from '@/components/SettingsPage';
import { ProfilePage } from '@/components/ProfilePage';
import { RoutinePage } from '@/components/RoutinePage';
import { NotificationsPage } from '@/components/NotificationsPage';
import { AnalyticsPage } from '@/components/AnalyticsPage';
import { ObservatoryTimeline } from '@/components/ObservatoryTimeline';
import { ChatWithAssistants } from '@/components/ChatWithAssistants';
import { WhatsAppConnection } from '@/components/WhatsAppConnection';
import { ChatInterface } from '@/components/ChatInterface';
import { ConversationAnalysisDashboard } from '@/components/whatsapp/ConversationAnalysisDashboard';
import { IndividualConversationAnalysis } from '@/components/whatsapp/IndividualConversationAnalysis';
import { CommercialDashboard } from '@/components/commercial/CommercialDashboard';
import { CommercialSettingsPage } from '@/components/commercial/CommercialSettingsPage';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminMasterDashboard } from '@/components/admin/AdminMasterDashboard';
import { AdminRoute } from '@/components/AdminRoute';
import NotFound from '@/pages/NotFound';
import { ObservatoryLanding } from '@/pages/ObservatoryLanding';
import { WelcomeTour } from '@/pages/WelcomeTour';
import { SolutionsHub } from '@/pages/SolutionsHub';
import { CommercialBrain } from '@/pages/CommercialBrain';
import AdminMaster from '@/pages/AdminMaster';

function AppRouter() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/observatory" element={<ObservatoryLanding />} />
        <Route path="/welcome" element={<WelcomeTour />} />
        <Route path="/solutions" element={<SolutionsHub />} />
        <Route path="/commercial/*" element={<CommercialBrain />} />

        {/* Protected routes */}
        {user ? (
          <>
            {/* Main Dashboard */}
            <Route path="/dashboard" element={<DashboardMain />} />
            
            {/* Behavioral Analysis */}
            <Route path="/dashboard/behavioral" element={<BehavioralProfile />} />
            <Route path="/dashboard/areas" element={<AreasOfLife />} />
            <Route path="/dashboard/routine" element={<DailyRoutine />} />
            <Route path="/dashboard/voice-chat" element={<VoiceChatInterface />} />
            <Route path="/dashboard/pain-points" element={<PainPointsAnalysis />} />
            <Route path="/dashboard/documents" element={<DocumentAnalysis />} />
            <Route path="/dashboard/insights" element={<InsightsDashboard />} />
            <Route path="/dashboard/recommendations" element={<Recommendations />} />
            
            {/* WhatsApp Integration */}
            <Route path="/dashboard/whatsapp" element={<WhatsAppConnection />} />
            <Route path="/dashboard/chat" element={<ChatInterface />} />
            <Route path="/dashboard/conversation-analysis" element={<ConversationAnalysisDashboard />} />
            <Route path="/dashboard/conversation-analysis/individual/:conversationId" element={<IndividualConversationAnalysis />} />
            
            {/* AI Interaction */}
            <Route path="/dashboard/chat-assistants" element={<ChatWithAssistants />} />
            <Route path="/dashboard/timeline" element={<ObservatoryTimeline />} />
            
            {/* Profile & Settings */}
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/dashboard/routine-page" element={<RoutinePage />} />
            <Route path="/dashboard/notifications" element={<NotificationsPage />} />
            <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
            
            {/* Commercial Routes */}
            <Route path="/commercial/dashboard" element={<CommercialDashboard />} />
            <Route path="/commercial/settings" element={<CommercialSettingsPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/master" element={
              <AdminRoute>
                <AdminMasterDashboard />
              </AdminRoute>
            } />
            <Route path="/master" element={<AdminMaster />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        )}
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
