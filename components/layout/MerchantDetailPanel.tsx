// Fix: Created MerchantDetailPanel component.
import React, { useEffect, useState } from 'react';
import { MerchantProfile } from '../../types';
import { api } from '../../services/api';
import Card from '../ui/Card';
import AccountTab from '../tabs/AccountTab';
import TipsTab from '../tabs/TipsTab';

interface MerchantDetailPanelProps {
  merchantId: string | null;
  onClose: () => void;
}

const MerchantDetailPanel: React.FC<MerchantDetailPanelProps> = ({ merchantId, onClose }) => {
    const [profile, setProfile] = useState<MerchantProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('cuenta');

    useEffect(() => {
        if (merchantId) {
            const fetchProfile = async () => {
                setIsLoading(true);
                setProfile(null);
                try {
                    const data = await api.getMerchantProfile(merchantId);
                    setProfile(data);
                } catch (error) {
                    console.error("Failed to fetch merchant profile", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProfile();
        } else {
            setProfile(null);
        }
    }, [merchantId]);

  if (!merchantId) {
    return (
      <aside className="w-96 flex-shrink-0">
        <Card className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Selecciona un comercio para ver los detalles.</p>
        </Card>
      </aside>
    );
  }

  return (
    <aside className={`w-96 flex-shrink-0 fixed bottom-0 right-0 top-16 transition-transform duration-300 ease-in-out ${merchantId ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto flex flex-col p-6 border-l border-gray-200 dark:border-gray-700">
            <div className="flex-shrink-0 flex items-start justify-between">
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Detalles del Comercio</h2>
                <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label="Cerrar panel de detalles"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {isLoading && (
                 <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            )}
            
            {!isLoading && profile && (
                 <div className="mt-6 flex-grow flex flex-col">
                    <ul className="flex border-b border-gray-200 dark:border-gray-700">
                        <li className="-mb-px mr-1">
                            <button 
                                onClick={() => setActiveTab('cuenta')}
                                className={`inline-block border-l border-t border-r rounded-t py-2 px-4 font-semibold ${activeTab === 'cuenta' ? 'bg-white dark:bg-gray-800 text-primary-700 dark:text-white' : 'text-gray-500 hover:text-primary-700 dark:hover:text-white bg-gray-50 dark:bg-gray-800/50'}`}
                            >
                                Cuenta
                            </button>
                        </li>
                         <li className="mr-1">
                            <button 
                                onClick={() => setActiveTab('propinas')}
                                className={`inline-block py-2 px-4 font-semibold ${activeTab === 'propinas' ? 'bg-white dark:bg-gray-800 text-primary-700 dark:text-white border-l border-t border-r rounded-t' : 'text-gray-500 hover:text-primary-700 dark:hover:text-white bg-gray-50 dark:bg-gray-800/50'}`}
                            >
                                Propinas
                            </button>
                        </li>
                    </ul>
                    <div className="flex-grow">
                        {activeTab === 'cuenta' && <AccountTab profile={profile} />}
                        {activeTab === 'propinas' && <TipsTab merchantId={profile.id} profile={profile} />}
                    </div>
                 </div>
            )}

            {!isLoading && !profile && (
                 <div className="flex-grow flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No se pudieron cargar los detalles.</p>
                </div>
            )}
        </div>
    </aside>
  );
};

export default MerchantDetailPanel;