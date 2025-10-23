import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MerchantOrderSummary, Order, OrderStatus, OrderFilterOptions, MerchantSummaryFilters } from '../types';
import Table from '../components/ui/Table';
import MerchantOrdersPanel from '../components/panels/MerchantOrdersPanel';
import OrderDetailPanel from '../components/panels/OrderDetailPanel';

const OrdersView: React.FC = () => {
    const [summaries, setSummaries] = useState<MerchantOrderSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMerchant, setSelectedMerchant] = useState<MerchantOrderSummary | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filters, setFilters] = useState<MerchantSummaryFilters>({
        date: '',
        product: '',
        location: '',
        status: '',
    });
    const [filterOptions, setFilterOptions] = useState<OrderFilterOptions>({ products: [], locations: [] });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const options = await api.getOrderFilterOptions();
                setFilterOptions(options);
            } catch (error) {
                console.error("Failed to fetch filter options:", error);
            }
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        const fetchSummaries = async () => {
            setIsLoading(true);
            try {
                const data = await api.getMerchantOrderSummaries(filters);
                setSummaries(data);
            } catch (error) {
                console.error("Failed to fetch merchant order summaries:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        const handler = setTimeout(() => {
            fetchSummaries();
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [filters]);

    const handleFilterChange = (filterName: keyof MerchantSummaryFilters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleSelectOrder = (order: Order) => {
        setSelectedOrder(order);
    };

    const handleCloseDetailPanel = () => {
        setSelectedOrder(null);
    };

    const handleCloseMerchantPanel = () => {
        setSelectedMerchant(null);
        setSelectedOrder(null);
    };

    const headers = ['Comercios', 'Pedidos recibidos', 'Ganancias de hoy', 'Ganancias esperadas'];
    const statusOptions = Object.values(OrderStatus);

    return (
        <div className="relative h-full">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Pedidos por Comercio</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                 <input 
                    type="text" 
                    placeholder="Buscar por fecha (AAAA-MM-DD)" 
                    value={filters.date} 
                    onChange={e => handleFilterChange('date', e.target.value)} 
                    className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                />
                 <select 
                    value={filters.product} 
                    onChange={e => handleFilterChange('product', e.target.value)} 
                    className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value="">Todos los productos</option>
                    {filterOptions.products.map(p => <option key={p} value={p}>{p}</option>)}
                 </select>
                 <select 
                    value={filters.location} 
                    onChange={e => handleFilterChange('location', e.target.value)} 
                    className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value="">Todas las locaciones</option>
                    {filterOptions.locations.map(l => <option key={l} value={l}>{l}</option>)}
                 </select>
                 <select 
                    value={filters.status} 
                    onChange={e => handleFilterChange('status', e.target.value as OrderStatus | '')} 
                    className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value="">Estado del pedido (todos)</option>
                    {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                 </select>
            </div>
            
            <Table
                headers={headers}
                data={summaries}
                isLoading={isLoading}
                renderRow={(summary: MerchantOrderSummary) => (
                    <tr key={summary.merchantId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{summary.merchantName}</td>
                        <td 
                            className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-600 dark:text-primary-400 cursor-pointer"
                            onClick={() => setSelectedMerchant(summary)}
                        >
                            {summary.ordersToday}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">${summary.totalRevenue.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">${summary.expectedRevenue.toFixed(2)}</td>
                    </tr>
                )}
            />
            
            <div className={`fixed inset-0 z-30 transition-opacity duration-300 ${selectedMerchant ? 'bg-black/30' : 'bg-transparent pointer-events-none'}`} onClick={handleCloseMerchantPanel}></div>

            {selectedOrder ? (
                 <OrderDetailPanel
                    order={selectedOrder}
                    onClose={handleCloseDetailPanel}
                />
            ) : selectedMerchant ? (
                <MerchantOrdersPanel
                    merchant={selectedMerchant}
                    onClose={handleCloseMerchantPanel}
                    onSelectOrder={handleSelectOrder}
                />
            ) : null}
        </div>
    );
};

export default OrdersView;