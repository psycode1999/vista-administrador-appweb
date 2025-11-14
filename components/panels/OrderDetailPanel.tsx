import React from 'react';
import { Order, OrderStatus } from '../../types';

interface OrderDetailPanelProps {
    order: Order;
    onClose: () => void;
}

const StatusStep = ({ status, active, completed }: { status: string, active: boolean, completed: boolean }) => (
    <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${active || completed ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'}`}>
            {completed ? '✓' : '•'}
        </div>
        <div className={`ml-2 text-sm ${active ? 'font-bold' : ''}`}>{status}</div>
    </div>
);

const OrderDetailPanel: React.FC<OrderDetailPanelProps> = ({ order, onClose }) => {
    
    const subtotal = order.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const calculatedTotal = subtotal + order.merchantTip + order.platformTip;
    
    const statusSteps = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED];
    const currentStatusIndex = statusSteps.indexOf(order.status);
    const isCancelled = order.status === OrderStatus.CANCELLED;

    return (
        <div className="fixed bottom-0 right-0 left-0 h-3/4 bg-white dark:bg-gray-800 shadow-2xl rounded-t-2xl z-50 flex flex-col p-6 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
            <div className="flex-shrink-0 flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Detalle del Pedido</h2>
                    <p className="text-sm font-mono text-gray-500">{order.id}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            <div className="flex-grow overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Seguimiento</h3>
                        {isCancelled ? (
                            <div className="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg text-red-700 dark:text-red-300 font-bold">
                                Pedido Cancelado
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                {statusSteps.map((status, index) => (
                                    <React.Fragment key={status}>
                                        <StatusStep status={status} active={index === currentStatusIndex} completed={index < currentStatusIndex} />
                                        {index < statusSteps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${index < currentStatusIndex ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Productos</h3>
                        <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                            {order.products.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-3 border-b dark:border-gray-700 last:border-b-0">
                                    <div>
                                        <p className="font-medium">{p.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {p.quantity} x ${p.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <p className="font-semibold">${(p.quantity * p.price).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="space-y-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Cliente</h3>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-gray-500">{order.customerAddress}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Resumen de Pago</h3>
                        <div className="space-y-1 mt-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Propina (Comercio)</span><span>${order.merchantTip.toFixed(2)}</span></div>
                             <div className="flex justify-between"><span className="text-gray-500">Propina (Plataforma)</span><span>${order.platformTip.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-base pt-2 border-t dark:border-gray-700"><span >Total</span><span>${calculatedTotal.toFixed(2)}</span></div>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Método de Pago</h3>
                        <p className="font-medium">{order.method}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Método de Entrega</h3>
                        <p className="font-medium">{order.deliveryMethod}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPanel;