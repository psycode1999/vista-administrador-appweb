import {
  DashboardStats,
  Notification,
  Order,
  OrderStatus,
  Product,
  TipPayment,
  AuditLog,
  Merchant,
  TipsStatus,
  AccountStatus,
  MerchantProfile,
  ActivityStatus,
  TipBalance,
} from '../types';

// Helper function to simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const mockNotifications: Notification[] = [
  { id: '1', message: 'Nuevo pedido #12345 recibido.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: false },
  { id: '2', message: 'El comerciante "La Buena Mesa" tiene un pago de propinas vencido.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: false },
  { id: '3', message: 'Reporte de ventas semanal listo para descargar.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true },
];

const mockMerchants: Merchant[] = [
    { id: 'm1', name: 'Café del Sol', tipPerTransaction: 0.50, lastPaymentDate: '2024-07-15', tipsStatus: TipsStatus.PAID, amountDue: 0, daysDue: 0, accountStatus: AccountStatus.ACTIVE },
    { id: 'm2', name: 'Libros y Letras', tipPerTransaction: 0.75, lastPaymentDate: '2024-07-05', tipsStatus: TipsStatus.PENDING, amountDue: 150.25, daysDue: 16, accountStatus: AccountStatus.ACTIVE },
    { id: 'm3', name: 'Ropa Urbana Co.', tipPerTransaction: 1.00, lastPaymentDate: '2024-06-20', tipsStatus: TipsStatus.PENDING, amountDue: 320.50, daysDue: 31, accountStatus: AccountStatus.ACTIVE },
    { id: 'm4', name: 'TecnoGadgets', tipPerTransaction: 1.25, lastPaymentDate: '2024-06-04', tipsStatus: TipsStatus.OVERDUE, amountDue: 550.00, daysDue: 47, accountStatus: AccountStatus.ACTIVE },
    { id: 'm5', name: 'Verde Fresco', tipPerTransaction: 0.40, lastPaymentDate: '2024-05-21', tipsStatus: TipsStatus.OVERDUE, amountDue: 890.75, daysDue: 61, accountStatus: AccountStatus.ACTIVE },
    { id: 'm6', name: 'El Rincón del Gourmet', tipPerTransaction: 1.50, lastPaymentDate: '2024-07-20', tipsStatus: TipsStatus.PAID, amountDue: 0, daysDue: 0, accountStatus: AccountStatus.ACTIVE },
];

const mockMerchantProfiles: Record<string, MerchantProfile> = {
    'm1': { id: 'm1', accountName: 'Café del Sol S.L.', phone: '123-456-7890', address: 'Calle Mayor 1, Madrid', tipPerTransaction: 0.50, sellerName: 'Ana Pérez', creationDate: '2023-01-15', activity: ActivityStatus.ONLINE, lastConnection: new Date(Date.now() - 1000 * 60 * 30).toISOString(), accountStatus: AccountStatus.ACTIVE },
    'm2': { id: 'm2', accountName: 'Librerías Letras S.A.', phone: '987-654-3210', address: 'Av. Diagonal 200, Barcelona', tipPerTransaction: 0.75, sellerName: 'Carlos Gómez', creationDate: '2022-11-20', activity: ActivityStatus.OFFLINE, lastConnection: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), accountStatus: AccountStatus.ACTIVE },
    'm3': { id: 'm3', accountName: 'Moda Urbana Global', phone: '555-123-4567', address: 'Plaza del Ayuntamiento 5, Valencia', tipPerTransaction: 1.00, sellerName: 'Lucía Fernández', creationDate: '2023-05-10', activity: ActivityStatus.OFFLINE, lastConnection: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), accountStatus: AccountStatus.ACTIVE },
    'm4': { id: 'm4', accountName: 'Tecnología Gadgets S.L.', phone: '111-222-3333', address: 'Calle Sierpes 10, Sevilla', tipPerTransaction: 1.25, sellerName: 'Javier Rodríguez', creationDate: '2023-08-01', activity: ActivityStatus.ONLINE, lastConnection: new Date(Date.now() - 1000 * 60 * 5).toISOString(), accountStatus: AccountStatus.ACTIVE },
    'm5': { id: 'm5', accountName: 'Alimentos Verde Fresco', phone: '444-555-6666', address: 'Mercado Central Puesto 8, Madrid', tipPerTransaction: 0.40, sellerName: 'María Sánchez', creationDate: '2021-03-22', activity: ActivityStatus.ONLINE, lastConnection: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), accountStatus: AccountStatus.ACTIVE },
    'm6': { id: 'm6', accountName: 'Gourmet Experience S.L.', phone: '222-333-4444', address: 'Calle de Serrano 50, Madrid', tipPerTransaction: 1.50, sellerName: 'Roberto Martínez', creationDate: '2022-09-01', activity: ActivityStatus.OFFLINE, lastConnection: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), accountStatus: AccountStatus.ACTIVE },
};


const mockOrders: Order[] = [
  { id: 'o1', customerName: 'Juan Pérez', merchantName: 'Café del Sol', date: '2024-07-20', total: 15.50, status: OrderStatus.DELIVERED },
  { id: 'o2', customerName: 'Ana García', merchantName: 'Libros y Letras', date: '2024-07-20', total: 45.00, status: OrderStatus.SHIPPED },
  { id: 'o3', customerName: 'Carlos Rodríguez', merchantName: 'TecnoGadgets', date: '2024-07-19', total: 299.99, status: OrderStatus.PROCESSING },
  { id: 'o4', customerName: 'Laura Martínez', merchantName: 'Verde Fresco', date: '2024-07-19', total: 78.20, status: OrderStatus.PENDING },
  { id: 'o5', customerName: 'Sofía López', merchantName: 'Ropa Urbana Co.', date: '2024-07-18', total: 65.00, status: OrderStatus.CANCELLED },
];

const mockProducts: Product[] = [
    { id: 'p1', name: 'Café Americano', merchantName: 'Café del Sol', category: 'Bebidas', price: 2.50, stock: 100 },
    { id: 'p2', name: 'Cien Años de Soledad', merchantName: 'Libros y Letras', category: 'Libros', price: 22.50, stock: 50 },
    { id: 'p3', name: 'Camiseta Gráfica', merchantName: 'Ropa Urbana Co.', category: 'Ropa', price: 25.00, stock: 0 },
    { id: 'p4', name: 'Auriculares Inalámbricos', merchantName: 'TecnoGadgets', category: 'Electrónica', price: 79.99, stock: 35 },
    { id: 'p5', name: 'Manzanas Orgánicas (kg)', merchantName: 'Verde Fresco', category: 'Alimentos', price: 3.99, stock: 200 },
];

const mockTipPayments: TipPayment[] = [
    { id: 't1', orderId: 'o1', customerName: 'Juan Pérez', merchantName: 'Café del Sol', date: '2024-07-20', amount: 2.00 },
    { id: 't2', orderId: 'o4', customerName: 'Laura Martínez', merchantName: 'Verde Fresco', date: '2024-07-19', amount: 5.00 },
];

const mockAuditLogs: AuditLog[] = [
    { id: 'a1', timestamp: '2024-07-21T10:00:00Z', user: 'admin@marketplace.com', action: 'LOGIN_SUCCESS', details: 'User logged in successfully from IP 192.168.1.1' },
    { id: 'a2', timestamp: '2024-07-21T10:05:00Z', user: 'admin@marketplace.com', action: 'VIEW_MERCHANTS', details: 'Accessed the merchants dashboard' },
    { id: 'a3', timestamp: '2024-07-21T10:06:00Z', user: 'admin@marketplace.com', action: 'SUSPEND_MERCHANT', details: 'Changed status of "Ropa Urbana Co." to SUSPENDED' },
];

const mockTipBalances: TipBalance[] = [
    { id: 'tb1', merchantId: 'm1', income: 120.50, outcome: 120.50, difference: 0, newBalance: 0, status: 'Al día', lastPaymentDate: '2024-07-15' },
    { id: 'tb2', merchantId: 'm2', income: 300.00, outcome: 149.75, difference: -0.50, newBalance: 150.25, status: 'Pendiente', lastPaymentDate: '2024-07-05' },
    { id: 'tb3', merchantId: 'm3', income: 500.00, outcome: 179.50, difference: 0, newBalance: 320.50, status: 'Pendiente', lastPaymentDate: '2024-06-20' },
    { id: 'tb4', merchantId: 'm4', income: 800.00, outcome: 250.00, difference: 0, newBalance: 550.00, status: 'Pendiente', lastPaymentDate: '2024-06-04' },
    { id: 'tb5', merchantId: 'm5', income: 1200.00, outcome: 309.25, difference: 0, newBalance: 890.75, status: 'Pendiente', lastPaymentDate: '2024-05-21' },
    { id: 'tb6', merchantId: 'm6', income: 250.00, outcome: 250.00, difference: 0, newBalance: 0, status: 'Al día', lastPaymentDate: '2024-07-20' },
];

export const api = {
  getNotifications: async (): Promise<Notification[]> => {
    await delay(500);
    return mockNotifications;
  },
  markNotificationAsRead: async (id: string): Promise<void> => {
    await delay(200);
    const notification = mockNotifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  },
  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay(1000);
    const totalAmountDue = mockMerchants.reduce((sum, m) => sum + m.amountDue, 0);
    return {
      totalRevenue: 154320.75,
      ordersToday: 82,
      newCustomers: 15,
      totalAmountDue: totalAmountDue,
    };
  },
  getOrders: async (): Promise<Order[]> => {
    await delay(1200);
    return mockOrders;
  },
  getProducts: async (): Promise<Product[]> => {
    await delay(800);
    return mockProducts;
  },
  getTipPayments: async (): Promise<TipPayment[]> => {
    await delay(700);
    return mockTipPayments;
  },
  getAuditLogs: async (): Promise<AuditLog[]> => {
    await delay(1500);
    return mockAuditLogs;
  },
  getMerchants: async (): Promise<Merchant[]> => {
      await delay(1000);
      return mockMerchants.map(merchant => {
          if (merchant.tipsStatus === TipsStatus.OVERDUE) {
              return { ...merchant, accountStatus: AccountStatus.SUSPENDED };
          }
          return merchant;
      });
  },
  getMerchantProfile: async (merchantId: string): Promise<MerchantProfile> => {
      await delay(800);
      if(mockMerchantProfiles[merchantId]) {
          let profile = { ...mockMerchantProfiles[merchantId] };
          const originalMerchant = mockMerchants.find(m => m.id === merchantId);

          if (originalMerchant && originalMerchant.tipsStatus === TipsStatus.OVERDUE) {
              profile.accountStatus = AccountStatus.SUSPENDED;
          }
          return profile;
      }
      throw new Error("Merchant profile not found");
  },
  getTipBalance: async (merchantId: string): Promise<TipBalance | undefined> => {
        await delay(600);
        return mockTipBalances.find(tb => tb.merchantId === merchantId);
  },
  confirmTipPayment: async (commerceId: string, amountReceived: number, difference: number): Promise<{ success: boolean }> => {
        await delay(1500);
        const merchant = mockMerchants.find(m => m.id === commerceId);
        if (merchant) {
            // Update merchant's balance
            merchant.lastPaymentDate = new Date().toISOString().split('T')[0];
            merchant.amountDue = difference; // The new amount due is the difference
            if (difference > 0) {
                 merchant.tipsStatus = TipsStatus.PENDING;
                 merchant.daysDue = 1;
            } else {
                 merchant.tipsStatus = TipsStatus.PAID;
                 merchant.daysDue = 0;
            }

            // Update tip balance record
            const tipBalance = mockTipBalances.find(tb => tb.merchantId === commerceId);
            if (tipBalance) {
                tipBalance.lastPaymentDate = new Date().toISOString().split('T')[0];
                tipBalance.newBalance = difference;
                tipBalance.status = difference > 0 ? 'Pendiente' : 'Al día';
            }

            // Add audit log
            mockAuditLogs.unshift({
                id: `a${mockAuditLogs.length + 1}`,
                timestamp: new Date().toISOString(),
                user: 'admin@marketplace.com',
                action: 'CONFIRM_RECEIPT',
                details: `Confirmed tip payment for ${merchant.name}. Amount: $${amountReceived}, Difference: $${difference.toFixed(2)}`
            });

            // Add notification
            mockNotifications.unshift({
                id: `n${mockNotifications.length + 1}`,
                message: `Hemos confirmado el cobro de tus propinas para ${merchant.name}. ¡Gracias!`,
                timestamp: new Date().toISOString(),
                read: false,
            });
            
            return { success: true };
        }
        return { success: false };
    }
};