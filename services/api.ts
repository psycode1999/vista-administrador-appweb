import {
  Notification, Merchant, TipsStatus, AccountStatus, MerchantProfile,
  ActivityStatus, TipBalance, MerchantOrderSummary, Order, OrderStatus, OrderFilterOptions,
  MerchantSummaryFilters, Product, ProductCategory, TipPayment, AuditLog, Receipt, ReceiptStatus, DashboardStats,
  DashboardMetricKey, HistoricalDataPoint, DashboardStat
} from '../types';

// Helper to create a date string in YYY-MM-DD format
const toDateString = (date: Date) => date.toISOString().split('T')[0];

// --- MOCK DATA ---

const rawMerchants: Omit<Merchant, 'lat' | 'lng'>[] = [
    { id: 'MERCH-1', name: 'Café del Sol', address: 'Av. Siempre Viva 123', tipPerTransaction: 0.25, lastPaymentDate: '2023-10-10', tipsStatus: TipsStatus.PENDING, daysDue: 15, amountDue: 120.50, accountStatus: AccountStatus.ACTIVE },
    { id: 'MERCH-2', name: 'Libros y Letras', address: 'Calle Falsa 456', tipPerTransaction: 0.15, lastPaymentDate: '2023-11-01', tipsStatus: TipsStatus.PAID, daysDue: 0, amountDue: 0, accountStatus: AccountStatus.ACTIVE },
    { id: 'MERCH-3', name: 'Ropa Urbana Co.', address: 'Blvd. de los Sueños 789', tipPerTransaction: 0.20, lastPaymentDate: '2023-09-05', tipsStatus: TipsStatus.PENDING, daysDue: 50, amountDue: 350.75, accountStatus: AccountStatus.ACTIVE },
    { id: 'MERCH-4', name: 'TecnoGadgets', address: 'Paseo de la Reforma 101', tipPerTransaction: 0.30, lastPaymentDate: '2023-08-20', tipsStatus: TipsStatus.PENDING, daysDue: 66, amountDue: 890.00, accountStatus: AccountStatus.SUSPENDED },
    { id: 'MERCH-5', name: 'Verde Fresco', address: 'Insurgentes Sur 202', tipPerTransaction: 0.10, lastPaymentDate: '2023-10-25', tipsStatus: TipsStatus.PENDING, daysDue: 5, amountDue: 45.20, accountStatus: AccountStatus.ACTIVE },
    { id: 'MERCH-6', name: 'El Rincón del Gourmet', address: 'Plaza de la Constitución 1', tipPerTransaction: 0.25, lastPaymentDate: '2023-09-15', tipsStatus: TipsStatus.PENDING, daysDue: 40, amountDue: 210.00, accountStatus: AccountStatus.ACTIVE },
];

let products: Product[] = [
    { id: 'PROD-1', name: 'Café Americano', brand: 'Cafetal', merchantName: 'Café del Sol', category: ProductCategory.COFFEE, price: 3.50, stock: 100 },
    { id: 'PROD-2', name: 'Libro de Ficción', brand: 'Ediciones Imaginarias', merchantName: 'Libros y Letras', category: ProductCategory.BOOKS, price: 15.00, stock: 50 },
    { id: 'PROD-3', name: 'Camiseta Gráfica', brand: 'Urban Style', merchantName: 'Ropa Urbana Co.', category: ProductCategory.CLOTHING, price: 25.00, stock: 80 },
    { id: 'PROD-4', name: 'Audífonos Inalámbricos', brand: 'SoundWave', merchantName: 'TecnoGadgets', category: ProductCategory.ELECTRONICS, price: 79.99, stock: 30 },
    { id: 'PROD-5', name: 'Manzanas Orgánicas (kg)', brand: 'Naturaleza Viva', merchantName: 'Verde Fresco', category: ProductCategory.GROCERIES, price: 4.50, stock: 200 },
    { id: 'PROD-6', name: 'Queso Brie Francés', brand: 'Le Gourmet', merchantName: 'El Rincón del Gourmet', category: ProductCategory.GOURMET, price: 12.75, stock: 40 },
    { id: 'PROD-7', name: 'Latte', brand: 'Cafetal', merchantName: 'Café del Sol', category: ProductCategory.COFFEE, price: 4.00, stock: 100 },
];

let orders: Order[] = [
    { id: 'ORD-1', merchantId: 'MERCH-1', customerName: 'Ana García', customerAddress: 'Calle A #1', location: 'Centro', date: toDateString(new Date()), status: OrderStatus.PROCESSING, products: [{id: 'PROD-1', name: 'Café Americano', price: 3.50, quantity: 2}], merchantTip: 1.00, platformTip: 0.50, method: 'Tarjeta de Crédito' },
    { id: 'ORD-2', merchantId: 'MERCH-2', customerName: 'Carlos Rodríguez', customerAddress: 'Calle B #2', location: 'Polanco', date: toDateString(new Date()), status: OrderStatus.PENDING, products: [{id: 'PROD-2', name: 'Libro de Ficción', price: 15.00, quantity: 1}], merchantTip: 2.00, platformTip: 1.00, method: 'PayPal' },
    { id: 'ORD-3', merchantId: 'MERCH-1', customerName: 'Sofía Martínez', customerAddress: 'Calle C #3', location: 'Condesa', date: toDateString(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), status: OrderStatus.DELIVERED, products: [{id: 'PROD-7', name: 'Latte', price: 4.00, quantity: 1}], merchantTip: 1.50, platformTip: 0.75, method: 'Efectivo' },
    { id: 'ORD-4', merchantId: 'MERCH-4', customerName: 'Luis Hernández', customerAddress: 'Calle D #4', location: 'Santa Fe', date: toDateString(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), status: OrderStatus.CANCELLED, products: [{id: 'PROD-4', name: 'Audífonos Inalámbricos', price: 79.99, quantity: 1}], merchantTip: 0, platformTip: 0, method: 'Tarjeta de Crédito' },
];

let notifications: Notification[] = [
    { id: '1', message: 'El pago de propinas para "Café del Sol" está pendiente.', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), read: false },
    { id: '2', message: 'Nuevo pedido #ORD-2 recibido para "Libros y Letras".', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), read: false },
    { id: '3', message: 'La cuenta de "TecnoGadgets" ha sido suspendida.', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), read: true },
];

const initialReceipts: Omit<Receipt, 'id'| 'merchantName' | 'status'>[] = [
    { merchantId: 'MERCH-2', pendingBalance: 25.50, amountReceived: 25.50, difference: 0, createdBy: 'Usuario Administrador', date: new Date('2023-11-01T10:00:00Z').toISOString() },
    { merchantId: 'MERCH-5', pendingBalance: 75.20, amountReceived: 30.00, difference: 45.20, createdBy: 'Usuario Administrador', date: new Date('2023-10-25T14:30:00Z').toISOString() },
    { merchantId: 'MERCH-1', pendingBalance: 170.50, amountReceived: 50.00, difference: 120.50, createdBy: 'Usuario Administrador', date: new Date('2023-10-10T11:00:00Z').toISOString() },
];


let auditLogs: AuditLog[] = [
    { id: 'LOG-1', timestamp: new Date().toISOString(), user: 'Usuario Administrador', action: 'LOGIN', details: 'Inicio de sesión exitoso.' },
    { id: 'LOG-2', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), user: 'Sistema', action: 'UPDATE_STATUS', details: 'Cuenta de "TecnoGadgets" suspendida por falta de pago.' },
    { id: 'LOG-3', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), user: 'Usuario Administrador', action: 'CREATE_RECEIPT', details: 'Recibo #REC-123 generado para "Libros y Letras".' },
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- DATA CONSISTENCY LOGIC ---
let merchants: Merchant[];
let tipBalances: TipBalance[];
let receipts: Receipt[];

function initializeAndSyncData() {
    // 1. Create fresh state from the raw definitions.
    merchants = rawMerchants.map(m => ({
        ...JSON.parse(JSON.stringify(m)),
        lat: 19.4326 + (Math.random() - 0.5) * 0.1,
        lng: -99.1332 + (Math.random() - 0.5) * 0.1
    }));
    
    tipBalances = rawMerchants.map(m => ({
        id: m.id,
        totalTipsReceived: m.amountDue, // Total debt accumulated before any payments
        totalTipsPaid: 0,
        previousBalance: null,
        currentBalance: m.amountDue,
        lastPaymentAmount: null,
        lastPaymentDate: new Date(m.lastPaymentDate).toISOString(),
        status: m.accountStatus,
    }));

    // 2. Sort receipts chronologically to apply them in order.
    const sortedReceipts = [...receipts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 3. Apply each receipt transaction to the fresh state.
    for (const receipt of sortedReceipts) {
        const merchant = merchants.find(m => m.id === receipt.merchantId);
        const balance = tipBalances.find(b => b.id === receipt.merchantId);

        if (merchant && balance) {
            const amountReceived = receipt.amountReceived;
            
            balance.previousBalance = balance.currentBalance;
            balance.currentBalance -= amountReceived;
            if (balance.currentBalance < 0) balance.currentBalance = 0;
            balance.totalTipsPaid += amountReceived;
            
            balance.lastPaymentAmount = amountReceived;
            balance.lastPaymentDate = receipt.date;

            // Update merchant record to reflect the latest state after this payment
            merchant.amountDue = balance.currentBalance;
            merchant.lastPaymentDate = toDateString(new Date(receipt.date));
            merchant.tipsStatus = balance.currentBalance > 0 ? TipsStatus.PENDING : TipsStatus.PAID;
            merchant.daysDue = 0; 
        }
    }

    // 4. Override some dates for demonstration of the status color feature
    const today = new Date();
    const merchantsToUpdate = [
        { id: 'MERCH-1', daysAgo: 15 },
        { id: 'MERCH-3', daysAgo: 30 },
        { id: 'MERCH-6', daysAgo: 45 },
        { id: 'MERCH-4', daysAgo: 60 },
    ];
    
    merchantsToUpdate.forEach(({ id, daysAgo }) => {
        const merchant = merchants.find(m => m.id === id);
        const balance = tipBalances.find(b => b.id === id);
        if (merchant && balance) {
            const newDate = new Date(today);
            newDate.setDate(today.getDate() - daysAgo);
            const newDateString = newDate.toISOString();
            
            merchant.lastPaymentDate = toDateString(newDate);
            balance.lastPaymentDate = newDateString;
        }
    });
}

// Initialize global receipts from the raw definition, ensuring they have full properties
receipts = initialReceipts.map((r, i) => ({
    ...r,
    id: `REC-10${i}`,
    merchantName: rawMerchants.find(m => m.id === r.merchantId)?.name ?? 'N/A',
    status: ReceiptStatus.GENERATED,
}));
// Run the synchronization function once when the module is loaded.
initializeAndSyncData();


// --- NEW CENTRALIZED DATA GENERATION FOR DASHBOARD ---

// Centralized configuration for metrics
const metricConfigs: { [key in DashboardMetricKey]: { base: number; trend: boolean; isCurrency: boolean } } = {
    currentRevenue: { base: 1500, trend: true, isCurrency: true },
    ordersToday: { base: 40, trend: true, isCurrency: false },
    newCustomers: { base: 15, trend: Math.random() > 0.5, isCurrency: false },
    totalThisMonth: { base: 2200, trend: true, isCurrency: true },
    totalDue: { base: 1600, trend: false, isCurrency: true },
};

// Cache for the generated historical data to ensure consistency across API calls for a single "session"
const historicalDataCache: Partial<Record<DashboardMetricKey, HistoricalDataPoint[]>> = {};

// The single, authoritative function for generating historical data for ALL metrics.
const generateAllHistoricalData = () => {
    // Clear previous cache to ensure fresh data on a full refresh.
    Object.keys(historicalDataCache).forEach(key => delete historicalDataCache[key as DashboardMetricKey]);

    const today = new Date();
    const daysToGenerate = 30;

    const pseudoRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    const generateFluctuatedValue = (base: number, dayIndex: number, positiveTrend: boolean, metricKey: string) => {
        const seed = dayIndex + metricKey.charCodeAt(0) + today.getDate();
        const fluctuation = (pseudoRandom(seed) - 0.4) * (base * 0.1);
        const trend = positiveTrend ? (dayIndex * (base * 0.01)) : (-dayIndex * (base * 0.005));
        return Math.max(0, base + fluctuation + trend);
    };

    // Generate and cache data for ALL metrics.
    for (const key of Object.keys(metricConfigs) as DashboardMetricKey[]) {
        const config = metricConfigs[key];
        const data: HistoricalDataPoint[] = [];
        for (let i = daysToGenerate - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const value = generateFluctuatedValue(config.base, daysToGenerate - i, config.trend, key);
            data.push({
                date: toDateString(date),
                value: config.isCurrency ? value : Math.floor(value),
            });
        }
        historicalDataCache[key] = data;
    }
};


// --- API FUNCTIONS ---
export const api = {
    async getNotifications(): Promise<Notification[]> {
        await sleep(300);
        return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    async markNotificationAsRead(id: string): Promise<void> {
        await sleep(100);
        const index = notifications.findIndex(n => n.id === id);
        if (index > -1) {
            notifications[index].read = true;
        }
    },
    async getMerchants(): Promise<Merchant[]> {
        await sleep(500);
        return merchants;
    },
    async getMerchantProfile(id: string): Promise<MerchantProfile> {
        await sleep(350);
        const merchant = merchants.find(m => m.id === id);
        if (!merchant) throw new Error("Merchant not found");
        return {
            id: merchant.id,
            accountName: merchant.name,
            phone: `+52 55 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
            address: merchant.address,
            tipPerTransaction: merchant.tipPerTransaction,
            sellerName: `Vendedor de ${merchant.name}`,
            creationDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
            activity: Math.random() > 0.3 ? ActivityStatus.ONLINE : ActivityStatus.OFFLINE,
            lastConnection: new Date(Date.now() - Math.random() * 10 * 60 * 1000).toISOString(),
            accountStatus: merchant.accountStatus,
        };
    },
    async getTipBalance(merchantId: string): Promise<TipBalance | undefined> {
        await sleep(200);
        return tipBalances.find(b => b.id === merchantId);
    },
    async getAllTipBalances(): Promise<TipBalance[]> {
        await sleep(400);
        return tipBalances;
    },
    async getMerchantOrderSummaries(filters: MerchantSummaryFilters): Promise<MerchantOrderSummary[]> {
        await sleep(600);
        
        const filteredOrders = orders.filter(o => {
            if (filters.date && o.date !== filters.date) return false;
            if (filters.product && !o.products.some(p => p.name === filters.product)) return false;
            if (filters.location && o.location !== filters.location) return false;
            if (filters.status && o.status !== filters.status) return false;
            return true;
        });

        const summaryMap: { [key: string]: MerchantOrderSummary } = {};
        
        merchants.forEach(m => {
             summaryMap[m.id] = {
                merchantId: m.id,
                merchantName: m.name,
                ordersToday: 0,
                totalRevenue: 0,
                expectedRevenue: 0,
            };
        });

        filteredOrders.forEach(order => {
            if (summaryMap[order.merchantId]) {
                const totalOrderValue = order.products.reduce((sum, p) => sum + p.price * p.quantity, 0) + order.merchantTip;
                summaryMap[order.merchantId].ordersToday++;
                if (order.status === OrderStatus.DELIVERED) {
                    summaryMap[order.merchantId].totalRevenue += totalOrderValue;
                }
                if (order.status !== OrderStatus.CANCELLED) {
                    summaryMap[order.merchantId].expectedRevenue += totalOrderValue;
                }
            }
        });

        return Object.values(summaryMap);
    },
    async getOrdersByMerchant(merchantId: string): Promise<Order[]> {
        await sleep(450);
        return orders.filter(o => o.merchantId === merchantId);
    },
    async getOrderFilterOptions(): Promise<OrderFilterOptions> {
        await sleep(100);
        const productSet = new Set<string>();
        const locationSet = new Set<string>();
        orders.forEach(o => {
            o.products.forEach(p => productSet.add(p.name));
            locationSet.add(o.location);
        });
        return {
            products: Array.from(productSet),
            locations: Array.from(locationSet)
        };
    },
    async getProducts(): Promise<Product[]> {
        await sleep(500);
        return products;
    },
    async addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
        await sleep(400);
        const newProduct: Product = {
            id: `PROD-${Date.now()}`,
            ...productData
        };
        products = [newProduct, ...products];
        return newProduct;
    },
    async updateProduct(id: string, productData: Partial<Omit<Product, 'id'>>): Promise<Product> {
        await sleep(400);
        const index = products.findIndex(p => p.id === id);
        if (index === -1) throw new Error("Product not found");
        products[index] = { ...products[index], ...productData };
        return products[index];
    },
    async deleteProducts(ids: string[]): Promise<void> {
        await sleep(600);
        products = products.filter(p => !ids.includes(p.id));
    },
    async getTipPayments(): Promise<TipPayment[]> {
        await sleep(300);
        return orders.filter(o => o.merchantTip > 0).map((o, i) => ({
            id: `TIP-${o.id}`,
            orderId: o.id,
            customerName: o.customerName,
            merchantName: merchants.find(m => m.id === o.merchantId)?.name ?? 'N/A',
            date: o.date,
            amount: o.merchantTip
        }));
    },
    async getAuditLogs(): Promise<AuditLog[]> {
        await sleep(400);
        return auditLogs;
    },
    async getReceipts(): Promise<Receipt[]> {
        await sleep(400);
        return receipts.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    async deleteReceipts(ids: string[]): Promise<void> {
        await sleep(500);
        // Remove the receipt(s) from the global list
        receipts = receipts.filter(r => !ids.includes(r.id));
        // Re-run the entire data initialization process to ensure all related
        // merchant and balance data is recalculated and consistent.
        initializeAndSyncData();
    },
    async confirmTipPayment(merchantId: string, amountReceived: number, difference: number): Promise<Receipt> {
        await sleep(700);
        
        // Find the state *before* this new payment.
        const balanceBeforePayment = tipBalances.find(b => b.id === merchantId);
        if (!balanceBeforePayment) throw new Error("Balance not found for merchant");
        
        const newReceipt: Receipt = {
            id: `REC-${Date.now()}`,
            merchantId: merchantId,
            merchantName: merchants.find(m => m.id === merchantId)?.name ?? 'N/A',
            pendingBalance: balanceBeforePayment.currentBalance, // Capture balance before payment
            amountReceived,
            difference,
            createdBy: 'Usuario Administrador',
            date: new Date().toISOString(),
            status: ReceiptStatus.GENERATED,
        };
        
        // Add the new receipt to the list of transactions
        receipts.unshift(newReceipt);
        
        // Re-initialize all data to apply the new transaction and ensure consistency
        initializeAndSyncData();
        
        // Find and return the newly created receipt (the instance in the global array)
        return receipts.find(r => r.id === newReceipt.id)!;
    },

    async getDashboardStats(): Promise<DashboardStats> {
        await sleep(800);
        
        // Main entry point for dashboard load. Generates/caches all data for this "session".
        if (Object.keys(historicalDataCache).length === 0) {
            generateAllHistoricalData();
        }

        const getStatFromCache = (metric: DashboardMetricKey): DashboardStat => {
            const data = historicalDataCache[metric];
            const config = metricConfigs[metric];
            
            if (!data || data.length < 2) {
                const value = data && data.length > 0 ? data[data.length - 1].value : 0;
                const formattedValue = config.isCurrency ? `$${value.toFixed(2)}` : value.toString();
                return { value: formattedValue };
            }

            const finalValue = data[data.length - 1].value;
            const initialValue = data[data.length - 2].value;

            const absoluteChange = finalValue - initialValue;
            // Handle case where initialValue is 0 to avoid division by zero
            const percentageChange = initialValue !== 0 
                ? (absoluteChange / Math.abs(initialValue)) * 100 
                : (absoluteChange > 0 ? 100 : 0);
            
            const formatValue = (val: number) => config.isCurrency ? `$${val.toFixed(2)}` : val.toFixed(0);
            const formatAbsChange = (val: number) => {
                const sign = val > 0 ? '+' : '';
                return config.isCurrency ? `${sign}$${val.toFixed(2)}` : `${sign}${val.toFixed(0)}`;
            };

            return {
                value: formatValue(finalValue),
                change: `${Math.abs(percentageChange).toFixed(2)}%`,
                changeType: percentageChange >= 0 ? 'increase' : 'decrease',
                absoluteChange: formatAbsChange(absoluteChange)
            };
        };
        
        const totalDueData = historicalDataCache['totalDue'];
        const totalDueValue = totalDueData && totalDueData.length > 0 ? totalDueData[totalDueData.length-1].value : 0;

        const stats: DashboardStats = {
            currentRevenue: getStatFromCache('currentRevenue'),
            ordersToday: getStatFromCache('ordersToday'),
            newCustomers: getStatFromCache('newCustomers'),
            totalThisMonth: getStatFromCache('totalThisMonth'),
            totalDue: { value: `$${totalDueValue.toFixed(2)}` }
        };

        return stats;
    },

    async getHistoricalChartData(metric: DashboardMetricKey, dateFilter?: string): Promise<HistoricalDataPoint[]> {
        await sleep(500);
        
        // If the cache is empty, generate it.
        if (Object.keys(historicalDataCache).length === 0) {
            generateAllHistoricalData();
        }

        let data = historicalDataCache[metric] || [];
        
        if (dateFilter) {
            return data.filter(d => d.date.includes(dateFilter));
        }

        return data;
    }
};