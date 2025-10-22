import React from 'react';
import Card from '../components/ui/Card';

const SettingsView: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Configuración</h1>
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Configuración de la Cuenta</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Esta es una vista de marcador de posición para la configuración. Aquí se podrían gestionar las preferencias del administrador, la configuración de notificaciones, los ajustes de seguridad y más.
        </p>
        <div className="mt-6 space-y-4 max-w-md">
            <div>
                <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de Administrador</label>
                <input type="text" id="adminName" readOnly defaultValue="Usuario Administrador" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 cursor-not-allowed" />
            </div>
            <div>
                <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                <input type="email" id="adminEmail" readOnly defaultValue="admin@marketplace.com" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 cursor-not-allowed" />
            </div>
            <div className="pt-4">
                <button
                    type="button"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                >
                    Guardar Cambios
                </button>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsView;
