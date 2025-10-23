import React, { useState, useEffect } from 'react';
import { TipBalance, AccountStatus } from '../../types';
import { api } from '../../services/api';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import GenerateReceiptModal from '../modals/GenerateReceiptModal';
import { MerchantProfile } from '../../types';

interface TipsTabProps {
    merchantId: string;
    profile: MerchantProfile;
}

const TipsTab: React.FC<TipsTabProps> = ({ merchantId, profile }) => {
    const [balance, setBalance] = useState<TipBalance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const fetchBalance = async () => {
        setIsLoading(true);
        try {
            const data = await api.getTipBalance(merchantId);
            setBalance(data ?? null);
        } catch (error) {
            console.error("Failed to fetch tip balance", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, [merchantId]);
    
    const handleSuccess = () => {
        setIsModalOpen(false);
        fetchBalance(); 
    };

    const headers = ['Total propinas recibidas', 'Propinas totales pagadas', 'Último Saldo', 'Saldo actual', 'Último Pago', 'Fecha pago', 'Estado'];

    return (
        <div className="py-4">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Cuenta Corriente de Propinas</h3>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm"
                >
                    Generar Recibo
                </button>
            </div>
            <Table
                headers={headers}
                data={balance ? [balance] : []}
                isLoading={isLoading}
                renderRow={(item: TipBalance) => {
                    const displayedDifference = (item.previousBalance !== null && item.lastPaymentAmount !== null) 
                        ? item.previousBalance - item.lastPaymentAmount 
                        : null;
                    
                    return (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${item.totalTipsReceived.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${item.totalTipsPaid.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${(item.previousBalance ?? 0).toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                               <div>${item.currentBalance.toFixed(2)}</div>
                                {displayedDifference !== null && (
                                    displayedDifference > 0 ? (
                                        <div className="text-xs text-green-500 font-medium">+ ${displayedDifference.toFixed(2)}</div>
                                    ) : displayedDifference < 0 ? (
                                        <div className="text-xs text-red-500 font-medium">- ${Math.abs(displayedDifference).toFixed(2)}</div>
                                    ) : null
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${(item.lastPaymentAmount ?? 0).toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(item.lastPaymentDate).toLocaleString('es-ES')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                               <Badge color={item.status === AccountStatus.ACTIVE ? 'green' : 'red'}>{item.status}</Badge>
                            </td>
                        </tr>
                    );
                }}
            />
            
            {profile && balance && (
              <GenerateReceiptModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  onSuccess={handleSuccess}
                  profile={profile}
                  tipBalance={balance}
              />
            )}
        </div>
    );
};

export default TipsTab;