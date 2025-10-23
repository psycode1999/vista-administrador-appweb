import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { Merchant, AccountStatus, TipBalance } from '../types';
import Table from '../components/ui/Table';
import MerchantDetailPanel from '../components/layout/MerchantDetailPanel';

interface MerchantWithBalance extends Merchant {
  balance?: TipBalance;
}

interface MerchantFilters {
    address: string;
    accountStatus: AccountStatus | '';
    lastPaymentDate: string;
}

// Haversine formula to calculate distance between two points on Earth
const haversineDistance = (
    coords1: { lat: number; lng: number },
    coords2: { lat: number; lng: number }
): number => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in kilometers

    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};


const MerchantsView: React.FC = () => {
    const [data, setData] = useState<MerchantWithBalance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [filters, setFilters] = useState<MerchantFilters>({
        address: '',
        accountStatus: '',
        lastPaymentDate: '',
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [merchantsData, balancesData] = await Promise.all([
                api.getMerchants(),
                api.getAllTipBalances(),
            ]);

            const balancesMap = new Map(balancesData.map(b => [b.id, b]));
            
            const combinedData: MerchantWithBalance[] = merchantsData.map(merchant => ({
                ...merchant,
                balance: balancesMap.get(merchant.id),
            }));

            setData(combinedData);
        } catch (error) {
            console.error("Failed to fetch merchant data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setLocationError(null);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationError("No se pudo obtener la ubicación. El orden por proximidad está desactivado.");
                }
            );
        } else {
             setLocationError("La geolocalización no es compatible con este navegador.");
        }

    }, [fetchData]);

    const handleFilterChange = (
        filterName: keyof MerchantFilters,
        value: string
    ) => {
        setFilters((prev) => ({ ...prev, [filterName]: value }));
    };

    const filteredAndSortedMerchants = useMemo(() => {
        const normalizeString = (str: string) => 
            str
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');

        let processedMerchants = [...data];

        // Apply filters
        processedMerchants = processedMerchants.filter((merchant) => {
            if (!merchant.balance) return false;
            
            const addressMatch = normalizeString(merchant.address).includes(normalizeString(filters.address));
            const accountStatusMatch = !filters.accountStatus || merchant.balance.status === filters.accountStatus;
            const dateMatch = !filters.lastPaymentDate || new Date(merchant.balance.lastPaymentDate).toISOString().split('T')[0] === filters.lastPaymentDate;
            return addressMatch && accountStatusMatch && dateMatch;
        });

        // Apply sorting by distance if user location is available
        if (userLocation) {
            processedMerchants.sort((a, b) => {
                const distanceA = haversineDistance(userLocation, { lat: a.lat, lng: a.lng });
                const distanceB = haversineDistance(userLocation, { lat: b.lat, lng: b.lng });
                return distanceA - distanceB;
            });
        }

        return processedMerchants;
    }, [data, filters, userLocation]);

    const headers = ['Comercio', 'Total Recibido', 'Total Pagado', 'Saldo Anterior', 'Saldo Actual', 'Último Pago', 'Fecha Pago', 'Estado'];

    return (
        <div className="flex gap-6 h-full">
             <div className="flex-1">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Gestionar Comercios</h1>

                <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-4">
                    <input
                        type="text"
                        placeholder="Buscar por dirección..."
                        value={filters.address}
                        onChange={(e) => handleFilterChange('address', e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                            value={filters.accountStatus}
                            onChange={(e) => handleFilterChange('accountStatus', e.target.value)}
                            className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Estado de Cuenta (Todos)</option>
                            {Object.values(AccountStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input
                            type="date"
                            value={filters.lastPaymentDate}
                            onChange={(e) => handleFilterChange('lastPaymentDate', e.target.value)}
                            className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    {locationError && <p className="text-xs text-center text-yellow-600 dark:text-yellow-400">{locationError}</p>}
                </div>

                <Table
                    headers={headers}
                    data={filteredAndSortedMerchants}
                    isLoading={isLoading}
                    renderRow={(merchant: MerchantWithBalance) => {
                        const { balance } = merchant;
                        return (
                             <tr key={merchant.id} onClick={() => setSelectedMerchantId(merchant.id)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{merchant.name}</td>
                                {balance ? (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${balance.totalTipsReceived.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${balance.totalTipsPaid.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${(balance.previousBalance ?? 0).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">${balance.currentBalance.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${(balance.lastPaymentAmount ?? 0).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(balance.lastPaymentDate).toLocaleDateString('es-ES')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {(() => {
                                                const lastPaymentDate = new Date(balance.lastPaymentDate);
                                                const today = new Date();
                                                lastPaymentDate.setHours(0, 0, 0, 0);
                                                today.setHours(0, 0, 0, 0);
                                                const diffTime = today.getTime() - lastPaymentDate.getTime();
                                                const daysSincePayment = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                                
                                                let statusColorClass = '';
                                                const isSpecialDay = [15, 30, 45, 60].includes(daysSincePayment);

                                                if (daysSincePayment === 60) {
                                                    statusColorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
                                                } else if (daysSincePayment === 45) {
                                                    statusColorClass = 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
                                                } else if (daysSincePayment === 30) {
                                                    statusColorClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
                                                } else if (daysSincePayment === 15) {
                                                    statusColorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
                                                } else {
                                                    statusColorClass = balance.status === AccountStatus.ACTIVE
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
                                                }

                                                // Determine if the date string should be shown
                                                const showDate = balance.status === AccountStatus.SUSPENDED || isSpecialDay;
                                                
                                                // Format the date string to show exact days
                                                const dateString = `hace ${daysSincePayment} día${daysSincePayment !== 1 ? 's' : ''}`;
                                                
                                                let statusText: string = balance.status;
                                                if (daysSincePayment === 15 || daysSincePayment === 30 || daysSincePayment === 45) {
                                                    statusText = 'Pendiente';
                                                }


                                                return (
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColorClass}`}>
                                                            {statusText}
                                                        </span>
                                                        {showDate && (
                                                            <span className="text-gray-500 dark:text-gray-400">{dateString}</span>
                                                        )}
                                                    </div>
                                                )
                                            })()}
                                        </td>
                                    </>
                                ) : (
                                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-400">Sin datos de saldo</td>
                                )}
                            </tr>
                        );
                    }}
                />
            </div>
            <MerchantDetailPanel 
                merchantId={selectedMerchantId} 
                onClose={() => setSelectedMerchantId(null)} 
                onDataUpdated={fetchData}
            />
        </div>
    );
};

export default MerchantsView;