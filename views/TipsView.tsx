import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { TipPayment } from '../types';
import Table from '../components/ui/Table';

const TipsView: React.FC = () => {
    const [tips, setTips] = useState<TipPayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTips = async () => {
            setIsLoading(true);
            try {
                const data = await api.getTipPayments();
                setTips(data);
            } catch (error) {
                console.error("Failed to fetch tip payments:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTips();
    }, []);
    
    const headers = ['ID Pedido', 'Cliente', 'Comercio', 'Fecha', 'Monto'];
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Pagos de Propinas</h1>
            <Table
                headers={headers}
                data={tips}
                isLoading={isLoading}
// Fix: Explicitly type the 'tip' parameter to 'TipPayment' to fix type inference issues.
                renderRow={(tip: TipPayment) => (
                    <tr key={tip.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">{tip.orderId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{tip.customerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{tip.merchantName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(tip.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">${tip.amount.toFixed(2)}</td>
                    </tr>
                )}
            />
        </div>
    );
};

export default TipsView;