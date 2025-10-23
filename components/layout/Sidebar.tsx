import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const MerchantIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const OrderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const ProductIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const TipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0 1H9.5M12 6h2.5m-2.5 0V3m0 3h.01M12 3v-1m0 1H9.5M12 3h2.5" /></svg>;
const AuditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944A12.02 12.02 0 0012 22a12.02 12.02 0 009-1.056c.343-.344.665-.72.962-1.124" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const ReceiptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;


const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed, setCollapsed }) => {
  const { user } = useAuth();
  if (!user) return null;

  const navItems = [
    { name: 'Panel', view: 'Dashboard', icon: <DashboardIcon /> },
    { name: 'Comercios', view: 'Merchants', icon: <MerchantIcon /> },
    { name: 'Pedidos', view: 'Orders', icon: <OrderIcon /> },
    { name: 'Productos', view: 'Products', icon: <ProductIcon /> },
    { name: 'Propinas', view: 'Tips', icon: <TipIcon /> },
    { name: 'Recibos', view: 'Receipts', icon: <ReceiptIcon /> },
    { name: 'Auditoría', view: 'Audit', icon: <AuditIcon /> },
    { name: 'Configuración', view: 'Settings', icon: <SettingsIcon /> },
  ];

  return (
    <nav className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 flex flex-col transition-width duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center h-16 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between px-4'}`}>
        {!isCollapsed && <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Marketplace</h1>}
        <button onClick={() => setCollapsed(!isCollapsed)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <div className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
                <ChevronLeftIcon />
            </div>
        </button>
      </div>
      <ul className="py-4 flex-grow">
        {navItems.map(item => (
          <li key={item.name}>
            <button
              onClick={() => setActiveView(item.view)}
              className={`flex items-center w-full py-3 text-left transition-colors duration-200 ${
                activeView === item.view
                  ? 'bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              } ${isCollapsed ? 'justify-center' : 'px-6'}`}
            >
              <span className={`${!isCollapsed ? 'mr-4' : ''}`}>{item.icon}</span>
              {!isCollapsed && item.name}
              {activeView === item.view && !isCollapsed && <div className="absolute left-0 h-full w-1 bg-primary-600 rounded-r-full" />}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;