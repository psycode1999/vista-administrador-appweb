import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { TipPayment, Merchant } from '../types';
import Table from '../components/ui/Table';

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const deg2rad = (deg: number) => deg * (Math.PI / 180);
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const TipsView: React.FC = () => {
    const [tips, setTips] = useState<TipPayment[]>([]);
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        location: '',
        date: '',
        merchantName: '',
    });
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
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
                setMerchants(merchantsData);

            } catch (error) {
                console.error("Failed to fetch tip payments or filter options:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleLocationFilterChange = (value: string) => {
        if (value === '__NEARBY__') {
            setUserLocation(null);
            setFilters(prev => ({...prev, location: '__NEARBY__'}));

            if (!navigator.geolocation) {
                alert('La geolocalización no es soportada por este navegador.');
                setFilters(prev => ({ ...prev, location: '' }));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                },
                (error) => {
                    console.error("Error getting location", error);
                    alert('No se pudo obtener la ubicación. Por favor, revisa los permisos.');
                    setFilters(prev => ({ ...prev, location: '' }));
                }
            );
        } else {
            setUserLocation(null);
            setFilters(prev => ({ ...prev, location: value }));
        }
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // If changing another filter, disable location filtering
        if (name !== 'location') {
             setUserLocation(null);
        }
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredTips = useMemo(() => {
        let results = [...tips];
        
        if (filters.location === '__NEARBY__' && userLocation) {
            const NEARBY_RADIUS_KM = 5;
            const nearbyMerchantNames = new Set<string>();
            merchants.forEach(merchant => {
                const distance = getDistance(userLocation.lat, userLocation.lng, merchant.lat, merchant.lng);
                if (distance <= NEARBY_RADIUS_KM) {
                    nearbyMerchantNames.add(merchant.name);
                }
            });
            results = results.filter(tip => nearbyMerchantNames.has(tip.merchantName));
        } else if (filters.location && filters.location !== '__NEARBY__') {
            results = results.filter(tip => tip.location === filters.location);
        }

        if (filters.date) {
            results = results.filter(tip => tip.date.startsWith(filters.date));
        }
        if (filters.merchantName) {
            results = results.filter(tip => tip.merchantName === filters.merchantName);
        }

        return results;
    }, [tips, merchants, filters, userLocation]);

    const headers = ['ID Pedido', 'Cliente', 'Comercio', 'Locación', 'Fecha', 'Monto'];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Pagos de Propinas</h1>

            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        name="location"
                        value={filters.location}
                        onChange={(e) => handleLocationFilterChange(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">Todas las locaciones</option>
                        <option value="__NEARBY__">Cerca de mí</option>
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