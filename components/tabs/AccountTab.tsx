import React, { useState } from 'react';
import { MerchantProfile, ActivityStatus, AccountStatus, TipBalance } from '../../types';
import Badge from '../ui/Badge';
import GenerateReceiptModal from '../modals/GenerateReceiptModal';

const DetailRow = ({ label, value, children }: { label: string; value?: string | number; children?: React.ReactNode }) => (
    <div>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</h4>
        {children ? children : <p className="text-md text-gray-800 dark:text-gray-200">{value}</p>}
    </div>
);

interface AccountTabProps {
    profile: MerchantProfile;
    balance: TipBalance | null;
    onBalanceUpdate: () => void;
}

const AccountTab: React.FC<AccountTabProps> = ({ profile, balance, onBalanceUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSuccess = () => {
        setIsModalOpen(false);
        onBalanceUpdate();
    };

    return (
        <div className="py-4 space-y-5">
           <DetailRow label="Nombre de la cuenta" value={profile.accountName} />
           <DetailRow label="Teléfono" value={profile.phone} />
           <DetailRow label="Dirección" value={profile.address} />
           <DetailRow label="Propina por transacción" value={`$${profile.tipPerTransaction.toFixed(2)}`} />
           <DetailRow label="Nombre del vendedor" value={profile.sellerName} />
           <DetailRow label="Fecha de creación" value={new Date(profile.creationDate).toLocaleDateString('es-ES')} />
           <DetailRow label="Actividad">
              <Badge color={profile.activity === ActivityStatus.ONLINE ? 'green' : 'gray'}>{profile.activity}</Badge>
           </DetailRow>
           <DetailRow label="Última hora de conexión" value={new Date(profile.lastConnection).toLocaleString('es-ES')} />
           <DetailRow label="Estado de la cuenta">
                <Badge color={profile.accountStatus === AccountStatus.ACTIVE ? 'green' : 'red'}>{profile.accountStatus}</Badge>
           </DetailRow>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    disabled={!balance || balance.currentBalance <= 0}
                    className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Generar Recibo
                </button>
           </div>
            
            {profile && balance && (
              <GenerateReceiptModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  onSuccess={handleSuccess}
                  profile={profile}
                  tipBalance={balance}
              />
            )}
        </div>
    );
};

export default AccountTab;