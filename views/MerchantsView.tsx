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

interface MerchantsViewProps {
    contextId: string | null;
    setContextId: (id: string | null) => void;
    navigate: (view: string, id?: string) => void;
}

const MerchantsView: React.FC<MerchantsViewProps> = ({ contextId, setContextId, navigate }) => {
    const [data, setData] = useState<MerchantWithBalance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
    const [filters, setFilters] = useState<MerchantFilters>({
        address: '',
        accountStatus: '',
        lastPaymentDate: '',
    });
    const [highlightedMerchantId, setHighlightedMerchantId] = useState<string | null>(null);
    const [targetMerchantId, setTargetMerchantId] = useState<string | null>(null);

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
            
            let dateMatch = true;
            if (filters.lastPaymentDate) {
                const parts = filters.lastPaymentDate.split('-');
                
                // Normalize month part if it's a single digit.
                if (parts.length > 1 && parts[1] && parts[1].length === 1) {
                    parts[1] = '0' + parts[1];
                }
                
                // Normalize day part if it's a single digit.
                if (parts.length > 2 && parts[2] && parts[2].length === 1) {
                    parts[2] = '0' + parts[2];
                }
            
                const normalizedDateFilter = parts.join('-');
                dateMatch = merchant.lastPaymentDate.startsWith(normalizedDateFilter);
            }

            return addressMatch && accountStatusMatch && dateMatch;
        });

        // Sort by last payment date chronologically
        processedMerchants.sort((a, b) => {
            if (!a.balance || !b.balance) return 0;
            return new Date(a.balance.lastPaymentDate).getTime() - new Date(b.balance.lastPaymentDate).getTime();
        });

        return processedMerchants;
    }, [data, filters]);
    
    // Effect 1: Detect incoming navigation request from contextId.
    useEffect(() => {
        if (contextId) {
            // Reset filters to ensure the target will be visible.
            setFilters({
                address: '',
                accountStatus: '',
                lastPaymentDate: '',
            });
            // Set the target ID we need to find and highlight.
            setTargetMerchantId(contextId);
            // Clear any other selections.
            setSelectedMerchantId(null);
        }
    }, [contextId]);

    // Effect 2: Watch for the target ID and wait for the data/DOM to be ready.
    useEffect(() => {
        // Proceed only if we have a target and the main data is loaded.
        if (!targetMerchantId || isLoading) {
            return;
        }

        // Check if the target merchant exists in the full dataset.
        const merchantExists = data.some(m => m.id === targetMerchantId);

        if (merchantExists) {
            // The filter reset is async. We need to wait for the DOM to update.
            // A small timeout pushes this logic to the end of the execution queue,
            // giving React time to re-render with the cleared filters.
            const timer = setTimeout(() => {
                const element = document.getElementById(`merchant-row-${targetMerchantId}`);
                if (element) {
                    // Success! Perform the scroll and highlight.
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setHighlightedMerchantId(targetMerchantId);

                    // Clean up: Reset the target and clear the context prop from the parent.
                    setTargetMerchantId(null);
                    setContextId(null);

                    // Remove the highlight after a few seconds for better UX.
                    const highlightTimer = setTimeout(() => {
                        setHighlightedMerchantId(null);
                    }, 2500);
                    
                    return () => clearTimeout(highlightTimer);
                } else {
                    // Element not found in DOM, even after delay. Abort.
                    setTargetMerchantId(null);
                    setContextId(null);
                }
            }, 100); // 100ms delay is usually sufficient for the DOM to update.

            return () => clearTimeout(timer);
        } else if (!isLoading) {
            // If data is loaded and the merchant ID is invalid, abort.
            setTargetMerchantId(null);
            setContextId(null);
        }
    }, [targetMerchantId, data, isLoading, setContextId]);


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
                            type="text"
                            placeholder="Filtrar por fecha (AAAA-MM-DD)..."
                            value={filters.lastPaymentDate}
                            onChange={(e) => handleFilterChange('lastPaymentDate', e.target.value)}
                            className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                <Table
                    headers={headers}
                    data={filteredAndSortedMerchants}
                    isLoading={isLoading}
                    renderRow={(merchant: MerchantWithBalance) => {
                        const { balance, daysDue } = merchant;
                         if (!balance) {
                            return (
                                <tr key={merchant.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{merchant.name}</td>
                                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-400">Sin datos de saldo</td>
                                </tr>
                            );
                        }

                        const saldoAnterior = balance.previousBalance ?? 0;
                        const ultimoPago = balance.lastPaymentAmount ?? 0;
                        const nuevasPropinas = balance.newTipsSinceLastPayment;
                        const diferencia = saldoAnterior - ultimoPago;
                        const displaySaldoActual = nuevasPropinas + diferencia;
                        
                        return (
                             <tr
                                key={merchant.id}
                                id={`merchant-row-${merchant.id}`}
                                onClick={() => setSelectedMerchantId(merchant.id)}
                                className={`cursor-pointer transition-all duration-500 ease-in-out ${
                                    merchant.id === highlightedMerchantId
                                        ? 'bg-primary-100 dark:bg-primary-900/50 ring-2 ring-primary-500'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{merchant.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${balance.totalTipsReceived.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${balance.totalTipsPaid.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${saldoAnterior.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="font-bold text-gray-900 dark:text-white">${displaySaldoActual.toFixed(2)}</div>
                                    {diferencia > 0 && (
                                        <div className="text-xs font-medium text-green-500">+RD{diferencia.toFixed(2)}</div>
                                    )}
                                     {diferencia < 0 && (
                                        <div className="text-xs font-medium text-red-500">-RD${Math.abs(diferencia).toFixed(2)}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${ultimoPago.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(balance.lastPaymentDate).toLocaleDateString('es-ES')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {(() => {
                                        if (!balance) return null;

                                        let statusText: string;
                                        let statusColorClass: string;
                                        let showDate = false;
                                        let dateString = '';
                                        
                                        switch (balance.status) {
                                            case AccountStatus.DELETION_PENDING:
                                                statusText = 'Eliminación';
                                                statusColorClass = 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300';
                                                break;
                                            case AccountStatus.SUSPENDED:
                                                statusText = 'Suspendida';
                                                statusColorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
                                                break;
                                            case AccountStatus.PENDING:
                                                statusText = 'Pendiente';
                                                if (daysDue >= 45) {
                                                    statusColorClass = 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
                                                } else if (daysDue >= 30) {
                                                    statusColorClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
                                                } else { // >= 15
                                                    statusColorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
                                                }
                                                showDate = true;
                                                dateString = `hace ${daysDue} día${daysDue !== 1 ? 's' : ''}`;
                                                break;
                                            case AccountStatus.ACTIVE:
                                            default:
                                                statusText = 'Activa';
                                                statusColorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
                                                break;
                                        }


                                        return (
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorClass}`}>
                                                    {statusText}
                                                </span>
                                                {showDate && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{dateString}</span>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </td>
                            </tr>
                        );
                    }}
                />
            </div>
            
            <MerchantDetailPanel
                merchantId={selectedMerchantId}
                onClose={() => setSelectedMerchantId(null)}
                onDataUpdated={fetchData}
                navigate={navigate}
            />
        </div>
    );
};

export default MerchantsView;