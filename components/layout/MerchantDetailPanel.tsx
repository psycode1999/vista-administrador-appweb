// Fix: Created MerchantDetailPanel component.
import React, { useEffect, useState } from 'react';
import { MerchantProfile, TipBalance } from '../../types';
import { api } from '../../services/api';
import Card from '../ui/Card';
import AccountTab from '../tabs/AccountTab';

interface MerchantDetailPanelProps {
  merchantId: string | null;
  onClose: () => void;
  onDataUpdated: () => void;
}

const MerchantDetailPanel: React.FC<MerchantDetailPanelProps> = ({ merchantId, onClose, onDataUpdated }) => {
    const [profile, setProfile] = useState<MerchantProfile | null>(null);
    const [balance, setBalance] = useState<TipBalance | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchDetails = async () => {
        if (!merchantId) return;
        setIsLoading(true);
        setProfile(null);
        setBalance(null);
        try {
            const [profileData, balanceData] = await Promise.all([
                api.getMerchantProfile(merchantId),
                api.getTipBalance(merchantId),
            ]);
            setProfile(profileData);
            setBalance(balanceData ?? null);
        } catch (error) {
            console.error("Failed to fetch merchant details", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (merchantId) {
            fetchDetails();
        } else {
            setProfile(null);
            setBalance(null);
        }
    }, [merchantId]);

    const handleSuccessfulPayment = () => {
        fetchDetails(); // Refresh this panel's data
        onDataUpdated(); // Refresh the main merchants grid
    }

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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
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
                    <div className="flex-grow">
                        <AccountTab profile={profile} balance={balance} onBalanceUpdate={handleSuccessfulPayment} />
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