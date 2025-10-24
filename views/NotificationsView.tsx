import React from 'react';
import { api } from '../services/api';
import { Notification } from '../types';
import Card from '../components/ui/Card';

const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;


interface NotificationsViewProps {
    navigate: (view: string, id?: string) => void;
    notifications: Notification[];
    isLoading: boolean;
    refreshNotifications: () => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ navigate, notifications, isLoading, refreshNotifications }) => {

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            await api.markNotificationAsRead(notification.id);
            refreshNotifications();
        }

        if (notification.linkTo) {
            navigate(notification.linkTo.view, notification.linkTo.targetId);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Centro de Notificaciones</h1>

            <Card className="max-w-4xl mx-auto">
                {isLoading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Cargando notificaciones...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.map(n => (
                            <li key={n.id}>
                                <button 
                                    onClick={() => handleNotificationClick(n)}
                                    className={`w-full text-left p-4 flex items-start space-x-4 transition-colors duration-200 ${!n.read ? 'bg-primary-50 dark:bg-gray-900/50' : ''} hover:bg-gray-100 dark:hover:bg-gray-700/50`}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        <BellIcon />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {n.message}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {new Date(n.timestamp).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 self-center">
                                        {!n.read && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" aria-label="No leido"></div>}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                         <CheckCircleIcon />
                        <p className="mt-2 font-medium">Todo al día</p>
                        <p className="text-sm">No tienes notificaciones nuevas.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default NotificationsView;