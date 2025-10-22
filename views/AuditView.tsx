import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AuditLog } from '../types';
import Table from '../components/ui/Table';

const AuditView: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const data = await api.getAuditLogs();
                setLogs(data);
            // Fix: Added missing curly braces to the catch block to correct the syntax error.
            } catch (error) {
                console.error("Failed to fetch audit logs:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const headers = ['Fecha', 'Usuario', 'Acción', 'Detalles'];
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Registro de Auditoría</h1>
            <Table
                headers={headers}
                data={logs}
                isLoading={isLoading}
                renderRow={(log: AuditLog) => (
                    <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(log.timestamp).toLocaleString('es-ES')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{log.user}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                           <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{log.action}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{log.details}</td>
                    </tr>
                )}
            />
        </div>
    );
};

export default AuditView;