import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginView from './views/LoginView';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './views/DashboardView';
import MerchantsView from './views/MerchantsView';
import OrdersView from './views/OrdersView';
import ProductsView from './views/ProductsView';
import TipsView from './views/TipsView';
import AuditView from './views/AuditView';
import SettingsView from './views/SettingsView';
import ReceiptsView from './views/ReceiptsView';
import MessagesView from './views/MessagesView';
import NotificationsView from './views/NotificationsView';
import { Notification } from './types';
import { api } from './services/api';

const App = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

const Main = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('Dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [contextId, setContextId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);


  const fetchNotifications = useCallback(async () => {
    setIsLoadingNotifications(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
        setIsLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);


  if (!user) {
    return <LoginView />;
  }

  const navigate = (view: string, id?: string) => {
    setContextId(id || null);
    setActiveView(view);
  };

  const renderView = () => {
    switch (activeView) {
      case 'Dashboard':
        return <DashboardView />;
      case 'Merchants':
        return <MerchantsView contextId={contextId} setContextId={setContextId} navigate={navigate} />;
      case 'Orders':
        return <OrdersView contextId={contextId} setContextId={setContextId} />;
      case 'Products':
        return <ProductsView />;
      case 'Tips':
        return <TipsView />;
      case 'Receipts':
        return <ReceiptsView />;
      case 'Messages':
        return <MessagesView contextId={contextId} setContextId={setContextId} />;
      case 'Notifications':
        return <NotificationsView 
                    navigate={navigate} 
                    notifications={notifications} 
                    isLoading={isLoadingNotifications}
                    refreshNotifications={fetchNotifications} 
                />;
      case 'Audit':
        return <AuditView />;
      case 'Settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isCollapsed={isSidebarCollapsed}
        setCollapsed={setIsSidebarCollapsed}
        notifications={notifications}
      />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;