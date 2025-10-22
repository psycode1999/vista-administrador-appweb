import React from 'react';
import { MerchantProfile, ActivityStatus, AccountStatus } from '../../types';
import Badge from '../ui/Badge';

const DetailRow = ({ label, value, children }: { label: string; value?: string | number; children?: React.ReactNode }) => (
    <div>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</h4>
        {children ? children : <p className="text-md text-gray-800 dark:text-gray-200">{value}</p>}
    </div>
);

interface AccountTabProps {
    profile: MerchantProfile;
}

const AccountTab: React.FC<AccountTabProps> = ({ profile }) => {
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
        </div>
    );
};

export default AccountTab;
