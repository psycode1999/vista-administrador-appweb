// Fix: Created the MerchantsView component.
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Merchant, TipsStatus, AccountStatus } from '../types';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import MerchantDetailPanel from '../components/layout/MerchantDetailPanel';

const getAccountStatusBadgeColor = (status: AccountStatus) => {
    switch (status) {
        case AccountStatus.ACTIVE: return 'green';
        case AccountStatus.SUSPENDED: return 'red';
        default: return 'gray';
    }
};

const getTipsStatusBadgeStyle = (days: number): string => {
    if (days >= 60) return 'bg-red-100 text-red-600 dark:bg-red-400/20 dark:text-red-400';
    if (days >= 45) return 'bg-pink-100 text-pink-600 dark:bg-pink-400/20 dark:text-pink-400';
    if (days >= 30) return 'bg-orange-100 text-orange-600 dark:bg-orange-400/20 dark:text-orange-400';
    if (days >= 15) return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-400/20 dark:text-yellow-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};


const MerchantsView: React.FC = () => {
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);

    useEffect(() => {
        const fetchMerchants = async () => {
            setIsLoading(true);
            try {
                const data = await api.getMerchants();
                setMerchants(data);
            } catch (error) {
                console.error("Failed to fetch merchants:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMerchants();
    }, []);

    const headers = ['Comercio', 'Propina por transacción', 'Último pago', 'Estado Propinas', 'Por Cobrar', 'Estado de Cuenta'];

    return (
        <div className="flex gap-6 h-full">
             <div className="flex-1">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Gestionar Comercios</h1>
                <Table
                    headers={headers}
                    data={merchants}
                    isLoading={isLoading}
                    renderRow={(merchant: Merchant) => (
                        <tr key={merchant.id} onClick={() => setSelectedMerchantId(merchant.id)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{merchant.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${merchant.tipPerTransaction.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(merchant.lastPaymentDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {merchant.tipsStatus === TipsStatus.PAID ? (
                                    <Badge color="green">{merchant.tipsStatus}</Badge>
                                ) : (
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTipsStatusBadgeStyle(merchant.daysDue)}`}>
                                        {merchant.tipsStatus} ({merchant.daysDue} días)
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-medium">${merchant.amountDue.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Badge color={getAccountStatusBadgeColor(merchant.accountStatus)}>{merchant.accountStatus}</Badge>
                            </td>
                        </tr>
                    )}
                />
            </div>
            <MerchantDetailPanel merchantId={selectedMerchantId} onClose={() => setSelectedMerchantId(null)} />
        </div>
    );
};

export default MerchantsView;