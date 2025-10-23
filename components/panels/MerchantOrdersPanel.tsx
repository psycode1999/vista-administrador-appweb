import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { Order, OrderStatus, MerchantOrderSummary } from '../../types';
import Table from '../ui/Table';
import Badge from '../ui/Badge';

const StatusCard = ({ title, count, colorClass }: { title: string, count: number, colorClass: string }) => (
    <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>{count}</p>
    </div>
);

const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.DELIVERED:
        case OrderStatus.SHIPPED: return 'green';
        case OrderStatus.PROCESSING: return 'blue';
        case OrderStatus.PENDING: return 'yellow';
        case OrderStatus.CANCELLED: return 'red';
        default: return 'gray';
    }
};

interface MerchantOrdersPanelProps {
    merchant: MerchantOrderSummary;
    onClose: () => void;
    onSelectOrder: (order: Order) => void;
}

const MerchantOrdersPanel: React.FC<MerchantOrdersPanelProps> = ({ merchant, onClose, onSelectOrder }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('');
    const [productFilter, setProductFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
    
    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const data = await api.getOrdersByMerchant(merchant.merchantId);
                setOrders(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } catch (error) {
                console.error("Failed to fetch merchant orders:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [merchant.merchantId]);

    const { popularProducts, popularLocations } = useMemo(() => {
        const productCounts: Record<string, number> = {};
        const locationCounts: Record<string, number> = {};

        orders.forEach(order => {
            locationCounts[order.location] = (locationCounts[order.location] || 0) + 1;
            order.products.forEach(p => {
                productCounts[p.name] = (productCounts[p.name] || 0) + p.quantity;
            });
        });

        const popularProducts = Object.entries(productCounts).sort(([, a], [, b]) => b - a).map(([name]) => name);
        const popularLocations = Object.entries(locationCounts).sort(([, a], [, b]) => b - a).map(([name]) => name);
        
        return { popularProducts, popularLocations };
    }, [orders]);

    const statusOptions = Object.values(OrderStatus);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // Revert to simple, progressive search on the YYYY-MM-DD format.
            if (dateFilter && !order.date.startsWith(dateFilter)) {
                return false;
            }

            if (productFilter && !order.products.some(p => p.name === productFilter)) return false;
            if (locationFilter && order.location !== locationFilter) return false;
            if (statusFilter && order.status !== statusFilter) return false;
            return true;
        });
    }, [orders, dateFilter, productFilter, locationFilter, statusFilter]);

    const statusCounts = useMemo(() => {
        const counts = {
            [OrderStatus.PENDING]: 0,
            [OrderStatus.PROCESSING]: 0,
            [OrderStatus.SHIPPED]: 0, // This will hold both Enviado and Despachado
            [OrderStatus.CANCELLED]: 0,
        };
        filteredOrders.forEach(o => {
            if (o.status === OrderStatus.DELIVERED) {
                 counts[OrderStatus.SHIPPED]++;
            } else if (o.status in counts) {
                counts[o.status as keyof typeof counts]++;
            }
        });
        return counts;
    }, [filteredOrders]);

    const headers = ['Pedido', 'Estado', 'Fecha'];
    
    return (
        <div className="fixed bottom-0 right-0 left-0 h-4/5 bg-white dark:bg-gray-800 shadow-2xl rounded-t-2xl z-40 flex flex-col p-6 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
            <div className="flex-shrink-0 flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Pedidos de: {merchant.merchantName}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                 <input type="text" placeholder="Buscar por fecha (AAAA-MM-DD)" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                 <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Todos los productos</option>
                    {popularProducts.map(p => <option key={p} value={p}>{p}</option>)}
                 </select>
                 <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Todas las locaciones</option>
                    {popularLocations.map(l => <option key={l} value={l}>{l}</option>)}
                 </select>
                 <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as OrderStatus | '')} className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Estado del pedido (todos)</option>
                    {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                 </select>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatusCard title="Recibido" count={statusCounts[OrderStatus.PENDING]} colorClass="text-yellow-500" />
                <StatusCard title="Preparado" count={statusCounts[OrderStatus.PROCESSING]} colorClass="text-blue-500" />
                <StatusCard title="Enviado/Despachado" count={statusCounts[OrderStatus.SHIPPED]} colorClass="text-green-500" />
                <StatusCard title="Cancelado" count={statusCounts[OrderStatus.CANCELLED]} colorClass="text-red-500" />
            </div>

            <div className="flex-grow overflow-y-auto">
                 <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Pedidos del Cliente</h3>
                 <Table
                    headers={headers}
                    data={filteredOrders}
                    isLoading={isLoading}
                    renderRow={(order: Order) => (
                        <tr key={order.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50" onClick={() => onSelectOrder(order)}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{order.customerName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{order.id}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge color={getStatusBadgeColor(order.status)}>{order.status}</Badge></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(order.date).toLocaleDateString('es-ES')}</td>
                        </tr>
                    )}
                />
            </div>
        </div>
    );
};

export default MerchantOrdersPanel;