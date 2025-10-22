import React, { useState, useEffect } from 'react';
import { TipBalance } from '../../types';
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

    const headers = ['Ingresos', 'Egresos', 'Faltantes/Sobrantes', 'Nuevo Saldo', 'Estado', 'Último Pago'];

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
                renderRow={(item: TipBalance) => (
                    <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">${item.income.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">${item.outcome.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${item.difference.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">${item.newBalance.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge color={item.status === 'Al día' ? 'green' : 'yellow'}>{item.status}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(item.lastPaymentDate).toLocaleDateString('es-ES')}</td>
                    </tr>
                )}
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
