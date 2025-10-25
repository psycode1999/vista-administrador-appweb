import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { Receipt, ReceiptStatus } from '../types';
import Badge from '../components/ui/Badge';
import ConfirmationModal from '../components/modals/ConfirmationModal';

const ReceiptsView: React.FC = () => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReceiptIds, setSelectedReceiptIds] = useState<string[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [dateFilter, setDateFilter] = useState('');

    const fetchReceipts = async () => {
        setIsLoading(true);
        try {
            const data = await api.getReceipts();
            setReceipts(data);
        } catch (error) {
            console.error("Failed to fetch receipts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReceipts();
    }, []);
    
    const filteredReceipts = useMemo(() => {
        if (!dateFilter) {
            return receipts;
        }
        return receipts.filter(receipt => receipt.date.startsWith(dateFilter));
    }, [receipts, dateFilter]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedReceiptIds(filteredReceipts.map(r => r.id));
        } else {
            setSelectedReceiptIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedReceiptIds(prev =>
            prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
        );
    };

    const handleDeleteClick = () => {
        if (selectedReceiptIds.length === 0) return;
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await api.deleteReceipts(selectedReceiptIds);
            setSelectedReceiptIds([]);
            fetchReceipts();
        } catch (error) {
            console.error("Failed to delete receipts", error);
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };
    
    const headers = ['ID Recibo', 'Comercio', 'Saldo pendiente', 'Monto recibido', 'Diferencia', 'Creado por', 'Fecha', 'Estado'];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Panel de Recibos</h1>
                 <div className="flex items-center space-x-4">
                     <input
                        type="text"
                        placeholder="Filtrar por fecha (AAAA-MM-DD)..."
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                        onClick={handleDeleteClick}
                        disabled={selectedReceiptIds.length === 0}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        <span>Eliminar</span>
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                             <th scope="col" className="px-6 py-3">
                                <input 
                                    type="checkbox" 
                                    className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                                    onChange={handleSelectAll}
                                    checked={filteredReceipts.length > 0 && selectedReceiptIds.length === filteredReceipts.length}
                                    disabled={filteredReceipts.length === 0}
                                />
                            </th>
                            {headers.map((header, index) => (
                                <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {header}
                                  </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {isLoading ? (
                            <tr>
                                <td colSpan={headers.length + 1} className="text-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                    <p className="mt-2 text-sm text-gray-500">Cargando recibos...</p>
                                </td>
                            </tr>
                        ) : filteredReceipts.length > 0 ? (
                            filteredReceipts.map(receipt => (
                               <tr key={receipt.id} className={`${selectedReceiptIds.includes(receipt.id) ? 'bg-primary-50 dark:bg-gray-900/50' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50`}>
                                   <td className="px-6 py-4">
                                       <input type="checkbox" checked={selectedReceiptIds.includes(receipt.id)} onChange={() => handleSelectOne(receipt.id)} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700" />
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">{receipt.id}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{receipt.merchantName}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${receipt.pendingBalance.toFixed(2)}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">${receipt.amountReceived.toFixed(2)}</td>
                                   <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${receipt.difference > 0 ? 'text-red-500' : receipt.difference < 0 ? 'text-green-500' : 'text-gray-500'}`}>
                                    {receipt.difference < 0 ? `- $${Math.abs(receipt.difference).toFixed(2)}` : `$${receipt.difference.toFixed(2)}`}
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{receipt.createdBy}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(receipt.date).toLocaleString('es-ES')}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge color="blue">{receipt.status}</Badge></td>
                               </tr>
                            ))
                        ) : (
                            <tr><td colSpan={headers.length + 1} className="text-center py-10 text-gray-500">{dateFilter ? 'No hay recibos que coincidan con la fecha.' : 'No hay recibos disponibles.'}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isConfirming={isDeleting}
                title="Confirmar Eliminación de Recibo(s)"
                message={`¿Estás seguro de que quieres eliminar ${selectedReceiptIds.length} recibo(s)? Esta acción deshará los cambios de pago en la cuenta del comercio y no se puede deshacer.`}
                confirmText="Sí, Eliminar"
            />
        </div>
    );
};

export default ReceiptsView;