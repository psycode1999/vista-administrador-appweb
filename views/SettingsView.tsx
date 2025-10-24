import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import { api } from '../services/api';
import { AppSettings, ProfileSettings, NotificationSettings, FinancialSettings } from '../types';
import { useAuth } from '../context/AuthContext';

const SettingsView: React.FC = () => {
    const { updateUser } = useAuth();
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const data = await api.getSettings();
                setSettings(data);
                // Apply theme on initial load
                document.documentElement.classList.toggle('dark', data.profile.theme === 'dark');
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleProfileChange = (field: keyof ProfileSettings, value: string) => {
        if (!settings) return;
        setSettings({
            ...settings,
            profile: { ...settings.profile, [field]: value }
        });
    };

    const handleNotificationToggle = (field: keyof NotificationSettings) => {
        if (!settings) return;
        setSettings({
            ...settings,
            notifications: { ...settings.notifications, [field]: !settings.notifications[field] }
        });
    };
    
    const handleFinancialChange = (field: keyof FinancialSettings, value: string) => {
        if (!settings) return;
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
            setSettings({
                ...settings,
                financial: { ...settings.financial, [field]: numValue }
            });
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const updatedSettings = await api.updateSettings(settings);
            setSettings(updatedSettings);
            updateUser({ name: updatedSettings.profile.name, avatarUrl: updatedSettings.profile.avatarUrl });
            // Apply theme immediately
            document.documentElement.classList.toggle('dark', updatedSettings.profile.theme === 'dark');
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3s
        } catch (error) {
            console.error("Failed to save settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }
    
    if (!settings) {
        return <p>No se pudieron cargar las configuraciones.</p>;
    }
    
    return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Configuración</h1>
        <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 disabled:opacity-50 flex items-center"
        >
            {isSaving ? 'Guardando...' : (saveSuccess ? '¡Guardado!' : 'Guardar Cambios')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Perfil</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de Administrador</label>
                    <input type="text" id="adminName" value={settings.profile.name} onChange={e => handleProfileChange('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                    <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL del Avatar</label>
                    <input type="text" id="avatarUrl" value={settings.profile.avatarUrl} onChange={e => handleProfileChange('avatarUrl', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tema de la Interfaz</label>
                    <select id="theme" value={settings.profile.theme} onChange={e => handleProfileChange('theme', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500">
                        <option value="light">Claro</option>
                        <option value="dark">Oscuro</option>
                    </select>
                </div>
            </div>
        </Card>

        {/* Notification Settings */}
        <Card className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Notificaciones</h2>
            <div className="space-y-4">
              {Object.entries({
                onNewMerchant: "Nuevos comercios registrados",
                onStatusChange: "Cambios de estado de cuenta (Suspendida/Pendiente)",
                onNewMessage: "Nuevos mensajes de clientes o comercios"
              }).map(([key, label]) => (
                <label key={key} htmlFor={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700 dark:text-gray-300">{label}</span>
                  <div className="relative">
                    <input id={key} type="checkbox" className="sr-only" checked={settings.notifications[key as keyof NotificationSettings]} onChange={() => handleNotificationToggle(key as keyof NotificationSettings)} />
                    <div className={`block w-10 h-6 rounded-full ${settings.notifications[key as keyof NotificationSettings] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.notifications[key as keyof NotificationSettings] ? 'translate-x-full' : ''}`}></div>
                  </div>
                </label>
              ))}
            </div>
        </Card>

        {/* Financial Settings */}
        <Card className="lg:col-span-3">
             <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Ajustes Financieros y de Cobranza</h2>
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Define los días de retraso para las advertencias de pago y la suspensión automática de cuentas.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label htmlFor="dueWarningDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Advertencia 1 (días)</label>
                    <input type="number" id="dueWarningDays" value={settings.financial.dueWarningDays} onChange={e => handleFinancialChange('dueWarningDays', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                    <label htmlFor="lateWarningDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Advertencia 2 (días)</label>
                    <input type="number" id="lateWarningDays" value={settings.financial.lateWarningDays} onChange={e => handleFinancialChange('lateWarningDays', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                    <label htmlFor="veryLateWarningDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Advertencia 3 (días)</label>
                    <input type="number" id="veryLateWarningDays" value={settings.financial.veryLateWarningDays} onChange={e => handleFinancialChange('veryLateWarningDays', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                    <label htmlFor="suspensionDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Suspensión (días)</label>
                    <input type="number" id="suspensionDays" value={settings.financial.suspensionDays} onChange={e => handleFinancialChange('suspensionDays', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500" />
                </div>
             </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsView;