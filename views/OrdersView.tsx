import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';

const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.DELIVERED: return 'green';
        case OrderStatus.SHIPPED: return 'blue';
        case OrderStatus.PROCESSING: return 'blue';
        case OrderStatus.PENDING: return 'yellow';
        case OrderStatus.CANCELLED: return 'red';
        default: return 'gray';
    }
};

const OrdersView: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const data = await api.getOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const orderDate = new Date(order.date);
            if (startDate && new Date(startDate) > orderDate) {
                return false;
            }
            if (endDate && new Date(endDate) < orderDate) {
                return false;
            }
            return true;
        });
    }, [orders, startDate, endDate]);

    const headers = ['ID Pedido', 'Cliente', 'Comercio', 'Fecha', 'Total', 'Estado'];

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Pedidos</h1>
                <div className="flex items-center space-x-2">
                    <label htmlFor="startDate" className="text-sm font-medium text-gray-500 dark:text-gray-300">Desde:</label>
                    <input 
                        type="date" 
                        id="startDate" 
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)} 
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <label htmlFor="endDate" className="text-sm font-medium text-gray-500 dark:text-gray-300">Hasta:</label>
                    <input 
                        type="date" 
                        id="endDate" 
                        value={endDate} 
                        onChange={e => setEndDate(e.target.value)} 
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>
            <Table
                headers={headers}
                data={filteredOrders}
                isLoading={isLoading}
                renderRow={(order: Order) => (
                    <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{order.customerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.merchantName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${order.total.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge color={getStatusBadgeColor(order.status)}>{order.status}</Badge>
                        </td>
                    </tr>
                )}
            />
        </div>
    );
};

export default OrdersView;
