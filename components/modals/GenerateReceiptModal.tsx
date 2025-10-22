import React, { useState, useEffect } from 'react';
import { MerchantProfile, TipBalance } from '../../types';
import { api } from '../../services/api';

interface GenerateReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    profile: MerchantProfile;
    tipBalance: TipBalance | null;
}

const GenerateReceiptModal: React.FC<GenerateReceiptModalProps> = ({ isOpen, onClose, onSuccess, profile, tipBalance }) => {
    const [amountReceived, setAmountReceived] = useState('');
    const [difference, setDifference] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const pendingBalance = tipBalance?.newBalance ?? 0;

    useEffect(() => {
        const received = parseFloat(amountReceived);
        if (!isNaN(received) && pendingBalance !== null) {
            setDifference(pendingBalance - received);
        } else if (amountReceived === '') {
            setDifference(0);
        } else {
             setDifference(pendingBalance);
        }
    }, [amountReceived, pendingBalance]);
    
    useEffect(() => {
        if (!isOpen) {
            setAmountReceived('');
            setDifference(0);
            setIsSubmitting(false);
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const received = parseFloat(amountReceived);
        if (isNaN(received) || received < 0) {
            setError('Por favor, ingresa un monto válido.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            await api.confirmTipPayment(profile.id, received, difference);
            onSuccess();
        } catch (err) {
            setError('Ocurrió un error al confirmar el pago.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Generar Recibo de Pago</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">A: Comercio</label>
                            <input type="text" readOnly value={profile.accountName} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">B: Saldo de propinas pendientes</label>
                            <input type="text" readOnly value={`$${pendingBalance.toFixed(2)}`} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">D: Fecha de creación</label>
                            <input type="text" readOnly value={new Date().toLocaleString('es-ES')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 cursor-not-allowed" />
                        </div>
                         <div>
                            <label htmlFor="amountReceived" className="block text-sm font-medium text-gray-700 dark:text-gray-300">E: Monto recibido</label>
                            <input 
                                type="number" 
                                id="amountReceived"
                                value={amountReceived}
                                onChange={(e) => setAmountReceived(e.target.value)}
                                placeholder="0.00"
                                required
                                step="0.01"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200 focus:ring-primary-500 focus:border-primary-500" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">F: Sobrante o faltante</label>
                            <input 
                                type="text" 
                                readOnly 
                                value={`$${difference.toFixed(2)}`} 
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 cursor-not-allowed font-bold ${difference > 0 ? 'text-red-500' : 'text-green-500'}`}
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50">
                            {isSubmitting ? 'Confirmando...' : 'Confirmar Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GenerateReceiptModal;
