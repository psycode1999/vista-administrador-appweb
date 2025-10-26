import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EarningsTabProps {
    merchantId: string;
}

const EarningsTab: React.FC<EarningsTabProps> = ({ merchantId }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            if (!merchantId) return;
            setIsLoading(true);
            try {
                const data = await api.getOrdersByMerchant(merchantId);
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch merchant orders for earnings tab:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [merchantId]);

    const chartData = useMemo(() => {
        const relevantOrders = orders.filter(order => {
            const isRelevantStatus = order.status === OrderStatus.DELIVERED || order.status === OrderStatus.SHIPPED;
            const matchesDate = dateFilter ? order.date.startsWith(dateFilter) : true;
            return isRelevantStatus && matchesDate;
        });

        const earningsByDate = relevantOrders.reduce((acc, order) => {
            const subtotal = order.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
            if (!acc[order.date]) {
                acc[order.date] = 0;
            }
            acc[order.date] += subtotal;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(earningsByDate)
            .map(([date, earnings]) => ({ date, earnings: parseFloat(earnings.toFixed(2)) }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    }, [orders, dateFilter]);

    return (
        <div className="py-4">
            <div className="mb-4">
                <label htmlFor="earningsDateFilter" className="sr-only">Filtrar por fecha</label>
                <input
                    id="earningsDateFilter"
                    type="text"
                    placeholder="Filtrar por fecha (AAAA-MM-DD)..."
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>
            <div className="h-80">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} stroke="currentColor" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="currentColor" angle={-60} textAnchor="end" interval="auto" />
                            <YAxis tick={{ fontSize: 10 }} stroke="currentColor" tickFormatter={(value) => `$${value}`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                                    borderColor: '#4f46e5',
                                    borderRadius: '0.5rem',
                                }}
                                itemStyle={{ color: '#c7d2fe' }}
                                labelStyle={{ fontWeight: 'bold', color: '#ffffff' }}
                                // FIX: The 'value' from recharts' formatter can be of an uncertain type.
                                // We check if it's a valid number before formatting to prevent runtime errors.
                                formatter={(value: unknown) => {
                                    if (typeof value === 'number' && !isNaN(value)) {
                                      return [`$${value.toFixed(2)}`, 'Ganancias'];
                                    }
                                    return [`$0.00`, 'Ganancias'];
                                }}
                            />
                            <Bar dataKey="earnings" name="Ganancias" fill="#6366f1" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-center">
                        <p className="text-gray-500 dark:text-gray-400">No hay datos de ganancias para mostrar con los filtros actuales.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EarningsTab;