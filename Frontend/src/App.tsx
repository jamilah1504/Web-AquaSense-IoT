import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginView } from './components/views/LoginView';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
// import { SimulationControlBar } from './components/layout/SimulationControlBar';
import { ToastContainer } from './components/common/ToastContainer';
import { WhatsAppPreviewModal } from './components/common/WhatsAppPreviewModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { MonitoringView } from './components/views/MonitoringView';
import { SensorDetailView } from './components/views/SensorDetailModal';
import { HistoryView } from './components/views/HistoryView';
import { AlertsView } from './components/views/AlertsView';
import { DevicesView } from './components/views/DevicesView';
import { ThresholdsView } from './components/views/ThresholdsView';
import { NotificationSettingsView } from './components/views/NotificationSettingsView';
import { ProfileView } from './components/views/ProfileView';

const MainLayout: React.FC = () => {
  const { currentUser, activeView } = useApp();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
        <LoginView />
        <ToastContainer />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'monitoring':
        return <MonitoringView />;
      case 'detail_sensor':
        return <SensorDetailView />;
      case 'history':
        return <HistoryView />;
      case 'alerts':
        return <AlertsView />;
      case 'devices':
        return <DevicesView />;
      case 'thresholds':
        return <ThresholdsView />;
      case 'notification_settings':
        return <NotificationSettingsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-white transition-colors duration-200">
      
      {/* Realtime IoT Interactive Simulation Control Bar */}
      {/* <SimulationControlBar /> */}

      <div className="flex-1 flex min-h-0 overflow-x-hidden">
        {/* Responsive Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 lg:pl-64">
          {/* Header */}
          <Header />

          {/* Page Content Viewport */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
            {renderActiveView()}
          </main>
        </div>
      </div>

      {/* Global Overlays and Modals */}
      <ToastContainer />
      <WhatsAppPreviewModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
