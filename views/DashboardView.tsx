import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../components/ui/Card';
import { api } from '../services/api';
import { DashboardStats, HistoricalDataPoint, DashboardMetricKey } from '../types';

const StatCard = ({ title, value, change, changeType, comparisonPeriod, isLoading, goodTrend = 'up', absoluteChange }: { title: string, value: string, change?: string, changeType?: 'increase' | 'decrease', comparisonPeriod?: string, isLoading?: boolean, goodTrend?: 'up' | 'down', absoluteChange?: string }) => {
    const isIncrease = changeType === 'increase';
    // A change is "good" if it's an increase and the good trend is up, OR it's a decrease and the good trend is down.
    const isGoodChange = (isIncrease && goodTrend === 'up') || (!isIncrease && goodTrend === 'down');

    return (
        <Card className="h-full">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3>
            {isLoading ? (
                <div className="mt-2 h-10 flex items-center">
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-3/4 rounded-md"></div>
                </div>
            ) : (
                <div className="mt-2">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
                    {change && (
                        <div className="mt-1">
                            <span className={`flex items-center text-sm font-medium ${isGoodChange ? 'text-green-600' : 'text-red-600'}`}>
                                {isIncrease ? '▲' : '▼'}
                                &nbsp;
                                {absoluteChange ? `${absoluteChange} (${change})` : change}
                            </span>
                             {comparisonPeriod && (
                                 <p className="text-xs text-gray-400 dark:text-gray-500">{comparisonPeriod}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

const DashboardView: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    const [activeMetric, setActiveMetric] = useState<DashboardMetricKey>('currentRevenue');
    const [chartData, setChartData] = useState<HistoricalDataPoint[]>([]);
    const [isLoadingChart, setIsLoadingChart] = useState(true);
    const [dateFilter, setDateFilter] = useState('');

    const statCardsMeta: { key: DashboardMetricKey; title: string; comparisonPeriod?: string }[] = [
        { key: 'currentRevenue', title: 'Ingresos Actuales', comparisonPeriod: 'respecto al mes anterior' },
        { key: 'totalThisMonth', title: 'Total de este mes', comparisonPeriod: 'respecto al mes anterior' },
        { key: 'ordersToday', title: 'Pedidos hoy', comparisonPeriod: 'respecto a ayer' },
        { key: 'newCustomers', title: 'Clientes Nuevos', comparisonPeriod: 'respecto a ayer' },
        { key: 'totalDue', title: 'Total por Cobrar' },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoadingStats(true);
            try {
                const data = await api.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setIsLoadingStats(false);
            }
        };
        fetchStats();
    }, []);
    
    useEffect(() => {
        const fetchChartData = async () => {
            setIsLoadingChart(true);
            try {
                const data = await api.getHistoricalChartData(activeMetric, dateFilter);
                setChartData(data);
            } catch (error) {
                console.error(`Failed to fetch chart data for ${activeMetric}:`, error);
                setChartData([]);
            } finally {
                setIsLoadingChart(false);
            }
        };

        const handler = setTimeout(() => {
             fetchChartData();
        }, 300);
       
       return () => clearTimeout(handler);

    }, [activeMetric, dateFilter]);
    
    const getMetricTitle = (metricKey: DashboardMetricKey) => {
        return statCardsMeta.find(m => m.key === metricKey)?.title || 'Datos';
    };

    const formatYAxisTick = (value: number) => {
        if (['currentRevenue', 'totalDue', 'totalThisMonth'].includes(activeMetric)) {
            return `$${(value / 1000).toFixed(0)}k`;
        }
        return value;
    };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Panel de Control</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCardsMeta.map(({ key, title, comparisonPeriod }) => (
          <div 
            key={key} 
            onClick={() => setActiveMetric(key)} 
            className={`rounded-lg cursor-pointer transition-all duration-300 ${activeMetric === key ? 'ring-2 ring-primary-500 shadow-lg' : 'ring-0 hover:ring-2 hover:ring-primary-300'}`}
          >
            <StatCard 
              title={title} 
              value={stats ? stats[key].value : ''} 
              change={stats ? stats[key].change : undefined} 
              changeType={stats ? stats[key].changeType : undefined}
              absoluteChange={stats ? stats[key].absoluteChange : undefined}
              comparisonPeriod={comparisonPeriod}
              isLoading={isLoadingStats}
              goodTrend={key === 'totalDue' ? 'down' : 'up'}
            />
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
             <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Historial de: <span className="text-primary-600 dark:text-primary-400">{getMetricTitle(activeMetric)}</span>
             </h2>
             <input
                type="text"
                placeholder="Filtrar fecha (AAAA-MM-DD)..."
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full sm:w-64 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
          </div>
          <div className="h-96">
            {isLoadingChart ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} stroke="currentColor" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="currentColor" />
                  <YAxis tick={{ fontSize: 12 }} stroke="currentColor" tickFormatter={formatYAxisTick} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.9)',
                      borderColor: '#4f46e5',
                      borderRadius: '0.5rem',
                      color: '#ffffff'
                    }}
                    itemStyle={{ color: '#c7d2fe' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="value" name={getMetricTitle(activeMetric)} stroke="#818cf8" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8, fill: '#4f46e5' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No hay datos para mostrar con los filtros actuales.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardView;