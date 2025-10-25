import React, { useEffect, useState } from 'react';
import { MerchantProfile, TipBalance, AccountStatus } from '../../types';
import { api } from '../../services/api';
import Card from '../ui/Card';
import AccountTab from '../tabs/AccountTab';
import ConfirmationModal from '../modals/ConfirmationModal';
import EarningsTab from '../tabs/EarningsTab';

const ChatBubbleLeftEllipsisIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.761 9.761 0 01-2.546-.421l-4.293 1.073a.75.75 0 01-.92-1.004l1.073-4.293A9.761 9.761 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const NoSymbolIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
);

const ArrowUturnLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
);


interface MerchantDetailPanelProps {
  merchantId: string | null;
  onClose: () => void;
  onDataUpdated: () => void;
  navigate: (view: string, id?: string) => void;
}

const MerchantDetailPanel: React.FC<MerchantDetailPanelProps> = ({ merchantId, onClose, onDataUpdated, navigate }) => {
    const [profile, setProfile] = useState<MerchantProfile | null>(null);
    const [balance, setBalance] = useState<TipBalance | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCancelDeletionModalOpen, setIsCancelDeletionModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'account' | 'earnings'>('account');

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
            setActiveTab('account'); // Reset to default tab when merchant changes
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

    const handleConfirmDisable = async () => {
        if (!merchantId) return;
        setIsActionLoading(true);
        try {
            await api.disableMerchant(merchantId);
            onDataUpdated();
            fetchDetails(); 
        } catch (error) {
            console.error("Failed to disable merchant", error);
        } finally {
            setIsActionLoading(false);
            setIsDisableModalOpen(false);
        }
    };
    
    const handleConfirmDelete = async () => {
        if (!merchantId) return;
        setIsActionLoading(true);
        try {
            await api.scheduleMerchantDeletion(merchantId);
            onDataUpdated();
            fetchDetails();
        } catch (error) {
            console.error("Failed to schedule merchant deletion", error);
        } finally {
            setIsActionLoading(false);
            setIsDeleteModalOpen(false);
        }
    };

    const handleConfirmCancelDeletion = async () => {
        if (!merchantId) return;
        setIsActionLoading(true);
        try {
            await api.cancelMerchantDeletion(merchantId);
            onDataUpdated();
            fetchDetails(); 
        } catch (error) {
            console.error("Failed to cancel merchant deletion", error);
        } finally {
            setIsActionLoading(false);
            setIsCancelDeletionModalOpen(false);
        }
    };
    
    const handleGoToChat = async () => {
        if (!merchantId) return;
        try {
            const conversation = await api.getOrCreateConversationForMerchant(merchantId);
            navigate('Messages', conversation.id);
        } catch (error) {
            console.error("Failed to navigate to chat", error);
        }
    };


  if (!merchantId) {
    return (
      <aside className="hidden md:block w-96 flex-shrink-0">
        <Card className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Selecciona un comercio para ver los detalles.</p>
        </Card>
      </aside>
    );
  }

  return (
    <aside className={`fixed inset-0 z-30 md:relative md:inset-auto md:z-auto transition-transform duration-300 ease-in-out ${merchantId ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 w-full md:w-96 flex-shrink-0`}>
        <div className="h-full bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto flex flex-col p-6 border-l border-gray-200 dark:border-gray-700">
            <div className="flex-shrink-0 flex items-start justify-between gap-4">
                 <div className="flex items-center gap-2 min-w-0">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white truncate">{profile?.accountName}</h2>
                    <div className="flex items-center flex-shrink-0">
                        {profile && (
                            <button onClick={handleGoToChat} title="Ir al chat" className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-blue-500 hover:text-blue-700"/>
                            </button>
                        )}
                        {profile && profile.accountStatus === AccountStatus.DELETION_PENDING && (
                            <button onClick={() => setIsCancelDeletionModalOpen(true)} title="Deshacer eliminación" className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <ArrowUturnLeftIcon className="w-5 h-5 text-green-500 hover:text-green-700"/>
                            </button>
                        )}
                        {profile && (profile.accountStatus === AccountStatus.ACTIVE || profile.accountStatus === AccountStatus.PENDING) && (
                            <button onClick={() => setIsDisableModalOpen(true)} title="Inhabilitar cuenta" className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <NoSymbolIcon className="w-5 h-5 text-yellow-500 hover:text-yellow-700"/>
                            </button>
                        )}
                        {profile && profile.accountStatus !== AccountStatus.DELETION_PENDING && (
                            <button onClick={() => setIsDeleteModalOpen(true)} title="Eliminar cuenta" className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <TrashIcon className="w-5 h-5 text-red-500 hover:text-red-700"/>
                            </button>
                        )}
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
                    aria-label="Cerrar panel de detalles"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'account'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                        Cuenta
                    </button>
                    <button
                        onClick={() => setActiveTab('earnings')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'earnings'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                        Ganancias
                    </button>
                </nav>
            </div>

            {isLoading && (
                 <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            )}
            
            {!isLoading && profile && (
                 <div className="flex-grow flex flex-col">
                     <div className="flex-grow">
                         {activeTab === 'account' && (
                             <AccountTab profile={profile} balance={balance} onBalanceUpdate={handleSuccessfulPayment} />
                         )}
                         {activeTab === 'earnings' && merchantId && (
                             <EarningsTab merchantId={merchantId} />
                         )}
                    </div>
                 </div>
            )}

            {!isLoading && !profile && (
                 <div className="flex-grow flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No se pudieron cargar los detalles.</p>
                </div>
            )}
        </div>
         <ConfirmationModal
                isOpen={isDisableModalOpen}
                onClose={() => setIsDisableModalOpen(false)}
                onConfirm={handleConfirmDisable}
                title="Confirmar Inhabilitación"
                message={`¿Estás seguro de que quieres inhabilitar la cuenta de "${profile?.accountName}"? Se le enviará un mensaje y la cuenta quedará suspendida.`}
                confirmText="Sí, Inhabilitar"
                isConfirming={isActionLoading}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que quieres eliminar la cuenta de "${profile?.accountName}"? La cuenta se marcará para eliminación y se borrará permanentemente en 3 días.`}
                confirmText="Sí, Eliminar"
                isConfirming={isActionLoading}
            />
            <ConfirmationModal
                isOpen={isCancelDeletionModalOpen}
                onClose={() => setIsCancelDeletionModalOpen(false)}
                onConfirm={handleConfirmCancelDeletion}
                title="Cancelar Eliminación"
                message={`¿Estás seguro de que quieres cancelar la eliminación de "${profile?.accountName}"? La cuenta será reactivada.`}
                confirmText="Sí, Cancelar Eliminación"
                isConfirming={isActionLoading}
            />
    </aside>
  );
};

export default MerchantDetailPanel;