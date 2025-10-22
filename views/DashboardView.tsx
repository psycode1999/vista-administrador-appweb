import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Ene', Ingresos: 4000 }, { name: 'Feb', Ingresos: 3000 },
  { name: 'Mar', Ingresos: 2000 }, { name: 'Abr', Ingresos: 2780 },
  { name: 'May', Ingresos: 1890 }, { name: 'Jun', Ingresos: 2390 },
  { name: 'Jul', Ingresos: 3490 },
];

const DashboardView: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const data = await api.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, value, change, isLoading }: { title: string, value: string | number, change?: string, isLoading: boolean }) => (
        <Card>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">{title}</h3>
            {isLoading ? (
                <div className="h-10 mt-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
            ) : (
                <>
                    <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">{value}</p>
                    {change && <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{change}</p>}
                </>
            )}
        </Card>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Panel de Control</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Ingresos Totales" 
                    value={stats ? `$${stats.totalRevenue.toLocaleString('es-ES')}` : '...'}
                    change="+5.2% vs mes anterior"
                    isLoading={isLoading} 
                />
                <StatCard 
                    title="Pedidos Hoy" 
                    value={stats ? stats.ordersToday : '...'}
                    change="-1.8% vs ayer"
                    isLoading={isLoading} 
                />
                <StatCard 
                    title="Nuevos Clientes" 
                    value={stats ? stats.newCustomers : '...'}
                    change="En la última semana"
                    isLoading={isLoading} 
                />
                <StatCard 
                    title="Total por Cobrar" 
                    value={stats ? `$${stats.totalAmountDue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}` : '...'}
                    isLoading={isLoading} 
                />
            </div>

             <div className="mt-8">
                <Card>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Ingresos Mensuales</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(31, 41, 55, 0.8)', // bg-gray-800 with opacity
                                    borderColor: 'rgba(55, 65, 81, 1)', // border-gray-600
                                    color: '#fff'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="Ingresos" fill="#4f46e5" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default DashboardView;