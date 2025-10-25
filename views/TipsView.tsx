import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { TipPayment } from '../types';
import Table from '../components/ui/Table';

const TipsView: React.FC = () => {
    const [tips, setTips] = useState<TipPayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        location: '',
        date: '',
        merchantName: '',
    });
    const [filterOptions, setFilterOptions] = useState<{ locations: string[], merchants: string[] }>({
        locations: [],
        merchants: [],
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [tipsData, optionsData, merchantsData] = await Promise.all([
                    api.getTipPayments(),
                    api.getOrderFilterOptions(),
                    api.getMerchants()
                ]);

                setTips(tipsData);
                setFilterOptions({
                    locations: optionsData.locations,
                    merchants: merchantsData.map(m => m.name)
                });

            } catch (error) {
                console.error("Failed to fetch tip payments or filter options:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredTips = useMemo(() => {
        return tips.filter(tip => {
            const locationMatch = !filters.location || tip.location === filters.location;
            const dateMatch = !filters.date || tip.date.startsWith(filters.date);
            const merchantMatch = !filters.merchantName || tip.merchantName === filters.merchantName;
            return locationMatch && dateMatch && merchantMatch;
        });
    }, [tips, filters]);

    const headers = ['ID Pedido', 'Cliente', 'Comercio', 'Locación', 'Fecha', 'Monto'];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Pagos de Propinas</h1>

            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        name="location"
                        value={filters.location}
                        onChange={handleFilterChange}
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">Todas las locaciones</option>
                        {filterOptions.locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Filtrar por fecha (AAAA-MM-DD)..."
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <select
                        name="merchantName"
                        value={filters.merchantName}
                        onChange={handleFilterChange}
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">Todos los comercios</option>
                        {filterOptions.merchants.sort().map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
            </div>

            <Table
                headers={headers}
                data={filteredTips}
                isLoading={isLoading}
                renderRow={(tip: TipPayment) => (
                    <tr key={tip.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">{tip.orderId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{tip.customerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{tip.merchantName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{tip.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(`${tip.date}T00:00:00`).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">${tip.amount.toFixed(2)}</td>
                    </tr>
                )}
            />
        </div>
    );
};

export default TipsView;