import {
  Notification, Merchant, TipsStatus, AccountStatus, MerchantProfile,
  ActivityStatus, TipBalance, MerchantOrderSummary, Order, OrderStatus, OrderFilterOptions,
  MerchantSummaryFilters, Product, ProductCategory, TipPayment, AuditLog, Receipt, ReceiptStatus, DashboardStats,
  DashboardMetricKey, HistoricalDataPoint, DashboardStat, Conversation, Message, Role, MessageStatus, AppSettings
} from '../types';

// Helper to create a date string in YYY-MM-DD format
const toDateString = (date: Date) => date.toISOString().split('T')[0];

// --- MOCK DATA ---

let settings: AppSettings = {
    profile: {
        name: 'Usuario Administrador',
        avatarUrl: 'https://i.pravatar.cc/150?u=admin',
        theme: 'light',
    },
    notifications: {
        onNewMerchant: true,
        onStatusChange: true,
        onNewMessage: true,
    },
    financial: {
        dueWarningDays: 15,
        lateWarningDays: 30,
        veryLateWarningDays: 45,
        suspensionDays: 60,
    }
};

const rawMerchants: Omit<Merchant, 'lat' | 'lng'>[] = [
    { id: 'MERCH-1', name: 'Café del Sol', address: 'Av. Siempre Viva 123', tipPerTransaction: 0.25, lastPaymentDate: '2023-10-10', tipsStatus: TipsStatus.PENDING, daysDue: 15, amountDue: 120.50, accountStatus: AccountStatus.ACTIVE },
    { id: 'MERCH-2', name: 'Libros y Letras', address: 'Calle Falsa 456', tipPerTransaction: 0.15, lastPaymentDate: '2023-11-01', tipsStatus: TipsStatus.PAID, daysDue: 0, amountDue: 0, accountStatus: AccountStatus.ACTIVE },
    { id: 'MERCH-3', name: 'Ropa Urbana Co.', address: 'Blvd. de los Sueños 789', tipPerTransaction: 0.20, lastPaymentDate: '2023-09-05', tipsStatus: TipsStatus.PENDING, daysDue: 50, amountDue: 350.75, accountStatus: AccountStatus.ACTIVE },
    { id: 'MERCH-4', name: 'TecnoGadgets', address: 'Paseo de la Reforma 101', tipPerTransaction: 0.30, lastPaymentDate: '2023-08-20', tipsStatus: TipsStatus.PENDING, daysDue: 66, amountDue: 890.00, accountStatus: AccountStatus.SUSPENDED },
    { id: 'MERCH-5', name: 'Verde Fresco', address: 'Insurgentes Sur 202', tipPerTransaction: 0.10, lastPaymentDate: '2023-10-25', tipsStatus: TipsStatus.PENDING, daysDue: 5, amountDue: 45.20, accountStatus: AccountStatus.ACTIVE },
    { id: 'MERCH-6', name: 'El Rincón del Gourmet', address: 'Plaza de la Constitución 1', tipPerTransaction: 0.25, lastPaymentDate: '2023-09-15', tipsStatus: TipsStatus.PENDING, daysDue: 40, amountDue: 210.00, accountStatus: AccountStatus.ACTIVE },
    { id: 'MERCH-7', name: 'La Esquina Creativa', address: 'Calle de la Imaginación 303', tipPerTransaction: 0.18, lastPaymentDate: toDateString(new Date()), tipsStatus: TipsStatus.PAID, daysDue: 0, amountDue: 0, accountStatus: AccountStatus.ACTIVE },
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

// --- COHERENT MOCK DATA FOR ORDERS AND RECEIPTS ---
const orders: Order[] = [
    // --- Merchant 1: Café del Sol ---
    { id: 'ORD-101', merchantId: 'MERCH-1', customerName: 'Ana García', customerAddress: 'Calle A #1', location: 'Centro', date: '2023-09-15', status: OrderStatus.DELIVERED, products: [{id: 'PROD-1', name: 'Café Americano', price: 3.50, quantity: 2}], merchantTip: 1.00, platformTip: 10.50, method: 'Tarjeta de Crédito' },
    { id: 'ORD-102', merchantId: 'MERCH-1', customerName: 'Luis Hernández', customerAddress: 'Calle D #4', location: 'Condesa', date: '2023-10-01', status: OrderStatus.DELIVERED, products: [{id: 'PROD-7', name: 'Latte', price: 4.00, quantity: 1}], merchantTip: 1.50, platformTip: 15.25, method: 'Efectivo' },
    { id: 'ORD-103', merchantId: 'MERCH-1', customerName: 'Sofía Martínez', customerAddress: 'Calle C #3', location: 'Condesa', date: toDateString(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)), status: OrderStatus.SHIPPED, products: [{id: 'PROD-7', name: 'Latte', price: 4.00, quantity: 1}], merchantTip: 1.50, platformTip: 8.75, method: 'Efectivo' },
    { id: 'ORD-104', merchantId: 'MERCH-1', customerName: 'Ana García', customerAddress: 'Calle A #1', location: 'Centro', date: toDateString(new Date()), status: OrderStatus.PROCESSING, products: [{id: 'PROD-1', name: 'Café Americano', price: 3.50, quantity: 2}], merchantTip: 1.00, platformTip: 5.25, method: 'Tarjeta de Crédito' },
    
    // --- Merchant 2: Libros y Letras (Paid up) ---
    { id: 'ORD-201', merchantId: 'MERCH-2', customerName: 'Carlos Rodríguez', customerAddress: 'Calle B #2', location: 'Polanco', date: '2023-10-20', status: OrderStatus.DELIVERED, products: [{id: 'PROD-2', name: 'Libro de Ficción', price: 15.00, quantity: 1}], merchantTip: 2.00, platformTip: 12.00, method: 'PayPal' },
    { id: 'ORD-202', merchantId: 'MERCH-2', customerName: 'Elena Pérez', customerAddress: 'Calle E #5', location: 'Polanco', date: '2023-10-28', status: OrderStatus.DELIVERED, products: [{id: 'PROD-2', name: 'Libro de Ficción', price: 15.00, quantity: 1}], merchantTip: 2.00, platformTip: 13.50, method: 'PayPal' },
    
    // --- Merchant 3: Ropa Urbana Co. (Multiple payments) ---
    { id: 'ORD-301', merchantId: 'MERCH-3', customerName: 'Jorge Ramírez', customerAddress: 'Calle F #6', location: 'Roma', date: '2023-08-10', status: OrderStatus.DELIVERED, products: [{id: 'PROD-3', name: 'Camiseta Gráfica', price: 25.00, quantity: 1}], merchantTip: 3.00, platformTip: 40.00, method: 'Tarjeta de Crédito' },
    { id: 'ORD-302', merchantId: 'MERCH-3', customerName: 'Laura Torres', customerAddress: 'Calle G #7', location: 'Roma', date: '2023-09-01', status: OrderStatus.DELIVERED, products: [{id: 'PROD-3', name: 'Camiseta Gráfica', price: 25.00, quantity: 2}], merchantTip: 5.00, platformTip: 60.50, method: 'Tarjeta de Crédito' },
    { id: 'ORD-303', merchantId: 'MERCH-3', customerName: 'Pedro Gómez', customerAddress: 'Calle H #8', location: 'Roma', date: '2023-10-15', status: OrderStatus.DELIVERED, products: [{id: 'PROD-3', name: 'Camiseta Gráfica', price: 25.00, quantity: 1}], merchantTip: 3.00, platformTip: 55.25, method: 'Tarjeta de Crédito' },

    // --- Merchant 4: TecnoGadgets (Suspended, no recent payments) ---
    { id: 'ORD-401', merchantId: 'MERCH-4', customerName: 'Mario Bros', customerAddress: 'Calle D #4', location: 'Santa Fe', date: '2023-07-15', status: OrderStatus.DELIVERED, products: [{id: 'PROD-4', name: 'Audífonos Inalámbricos', price: 79.99, quantity: 1}], merchantTip: 10, platformTip: 150.00, method: 'Tarjeta de Crédito' },
    { id: 'ORD-402', merchantId: 'MERCH-4', customerName: 'Luigi Bros', customerAddress: 'Calle D #4', location: 'Santa Fe', date: '2023-08-01', status: OrderStatus.DELIVERED, products: [{id: 'PROD-4', name: 'Audífonos Inalámbricos', price: 79.99, quantity: 1}], merchantTip: 10, platformTip: 180.50, method: 'Tarjeta de Crédito' },
    // A cancelled order that should not be counted
    { id: 'ORD-403', merchantId: 'MERCH-4', customerName: 'Bowser King', customerAddress: 'Calle D #4', location: 'Santa Fe', date: toDateString(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), status: OrderStatus.CANCELLED, products: [{id: 'PROD-4', name: 'Audífonos Inalámbricos', price: 79.99, quantity: 1}], merchantTip: 0, platformTip: 0, method: 'Tarjeta de Crédito' },
];

let notifications: Notification[] = [];

const initialReceipts: Omit<Receipt, 'id'| 'merchantName' | 'status'>[] = [
    // Corresponds to MERCH-1 payment history
    { merchantId: 'MERCH-1', pendingBalance: 25.75, amountReceived: 20.00, difference: 5.75, createdBy: 'Usuario Administrador', date: new Date('2023-10-10T11:00:00Z').toISOString() },
    // Corresponds to MERCH-2 payment history (paid in full)
    { merchantId: 'MERCH-2', pendingBalance: 25.50, amountReceived: 25.50, difference: 0, createdBy: 'Usuario Administrador', date: new Date('2023-11-01T10:00:00Z').toISOString() },
    // Corresponds to MERCH-3 payment history (two payments)
    { merchantId: 'MERCH-3', pendingBalance: 40.00, amountReceived: 40.00, difference: 0, createdBy: 'Usuario Administrador', date: new Date('2023-08-20T09:00:00Z').toISOString() },
    { merchantId: 'MERCH-3', pendingBalance: 60.50, amountReceived: 50.00, difference: 10.50, createdBy: 'Usuario Administrador', date: new Date('2023-09-25T15:00:00Z').toISOString() },
    // No receipts for MERCH-4
];


let auditLogs: AuditLog[] = [
    { id: 'LOG-1', timestamp: new Date().toISOString(), user: 'Usuario Administrador', action: 'LOGIN', details: 'Inicio de sesión exitoso.' },
    { id: 'LOG-2', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), user: 'Sistema', action: 'UPDATE_STATUS', details: 'Cuenta de "TecnoGadgets" suspendida por falta de pago.' },
    { id: 'LOG-3', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), user: 'Usuario Administrador', action: 'CREATE_RECEIPT', details: 'Recibo #REC-123 generado para "Libros y Letras".' },
];

let conversations: Conversation[] = [
    { id: 'CONV-CUST-1', userId: 'CUST-1', userName: 'Ana García', userAvatarUrl: 'https://i.pravatar.cc/150?u=ana', role: Role.CUSTOMER, lastMessage: '¡Gracias por la ayuda!', lastMessageTimestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), unreadCount: 0 },
    { id: 'CONV-CUST-2', userId: 'CUST-2', userName: 'Carlos Rodríguez', userAvatarUrl: 'https://i.pravatar.cc/150?u=carlos', role: Role.CUSTOMER, lastMessage: 'Tengo una pregunta sobre mi pedido...', lastMessageTimestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), unreadCount: 2 },
    { id: 'CONV-MERCH-1', userId: 'MERCH-1', userName: 'Café del Sol', userAvatarUrl: 'https://i.pravatar.cc/150?u=cafe', role: Role.MERCHANT, lastMessage: '¿Podrían revisar el último pago de propinas?', lastMessageTimestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), unreadCount: 1 },
    { id: 'CONV-MERCH-2', userId: 'MERCH-2', userName: 'Libros y Letras', userAvatarUrl: 'https://i.pravatar.cc/150?u=libros', role: Role.MERCHANT, lastMessage: 'Perfecto, gracias.', lastMessageTimestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), unreadCount: 0 },
];

let archivedConversations: Conversation[] = [];

const messages: { [conversationId: string]: Message[] } = {
    'CONV-CUST-1': [
        { id: 'MSG-C1-1', conversationId: 'CONV-CUST-1', sender: 'user', text: 'Hola, necesito ayuda con mi cuenta.', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), status: MessageStatus.READ },
        { id: 'MSG-C1-2', conversationId: 'CONV-CUST-1', sender: 'admin', text: 'Claro, ¿en qué puedo ayudarte?', timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(), status: MessageStatus.READ },
        { id: 'MSG-C1-3', conversationId: 'CONV-CUST-1', sender: 'user', text: 'Ya lo resolví, ¡Gracias por la ayuda!', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), status: MessageStatus.READ },
    ],
    'CONV-CUST-2': [
        { id: 'MSG-C2-1', conversationId: 'CONV-CUST-2', sender: 'user', text: 'Tengo una pregunta sobre mi pedido...', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), status: MessageStatus.DELIVERED },
    ],
    'CONV-MERCH-1': [
        { id: 'MSG-M1-1', conversationId: 'CONV-MERCH-1', sender: 'user', text: '¿Podrían revisar el último pago de propinas?', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), status: MessageStatus.DELIVERED },
    ],
    'CONV-MERCH-2': [
        { id: 'MSG-M2-1', conversationId: 'CONV-MERCH-2', sender: 'admin', text: 'Hemos procesado su solicitud.', timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), status: MessageStatus.READ },
        { id: 'MSG-M2-2', conversationId: 'CONV-MERCH-2', sender: 'user', text: 'Perfecto, gracias.', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), status: MessageStatus.READ },
    ]
};


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- DATA CONSISTENCY LOGIC ---
let merchants: Merchant[];
let tipBalances: TipBalance[];
let receipts: Receipt[];

function initializeAndSyncData() {
    // --- Step 1: Calculate lifetime Total Tips Received for each merchant (Rule A) ---
    // This is the sum of `platformTip` from all orders that are shipped or delivered.
    const totalTipsPerMerchant = new Map<string, number>();
    orders.forEach(order => {
        if ([OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status)) {
            const currentTips = totalTipsPerMerchant.get(order.merchantId) || 0;
            totalTipsPerMerchant.set(order.merchantId, currentTips + order.platformTip);
        }
    });

    // --- Step 2: Process receipts chronologically to get payment-related fields ---
    const paymentDataPerMerchant = new Map<string, {
        totalPaid: number;          // For Rule B
        lastPaymentAmount: number | null; // For Rule E
        lastPaymentDate: string;      // For Rule F
        previousBalance: number | null;   // For Rule C
    }>();

    // Sort all receipts by date to correctly identify the latest one for each merchant
    const sortedReceipts = [...receipts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const merchant of rawMerchants) {
        // Get all receipts for the current merchant, already sorted by date
        const merchantReceipts = sortedReceipts.filter(r => r.merchantId === merchant.id);

        // Rule B: Calculate the total amount paid from all receipts.
        const totalPaid = merchantReceipts.reduce((sum, r) => sum + r.amountReceived, 0);
        
        // Get the single most recent receipt to extract last payment details.
        const latestReceipt = merchantReceipts.length > 0 ? merchantReceipts[merchantReceipts.length - 1] : null;

        paymentDataPerMerchant.set(merchant.id, {
            totalPaid: totalPaid,
            // Rule E: Get amount from the latest receipt.
            lastPaymentAmount: latestReceipt ? latestReceipt.amountReceived : null,
            // Rule F: Get date from the latest receipt, or fall back to the initial static date.
            lastPaymentDate: latestReceipt ? latestReceipt.date : new Date(merchant.lastPaymentDate).toISOString(),
            // Rule C: Get the pending balance *before* the last payment was made.
            previousBalance: latestReceipt ? latestReceipt.pendingBalance : null
        });
    }

    // --- Step 3: Combine tip data and payment data to create final TipBalance objects ---
    tipBalances = rawMerchants.map(m => {
        const totalTipsReceived = totalTipsPerMerchant.get(m.id) || 0;
        const paymentData = paymentDataPerMerchant.get(m.id)!;

        // Rule D: Saldo Actual is the lifetime total tips received minus the lifetime total paid.
        const currentBalance = totalTipsReceived - paymentData.totalPaid;

        return {
            id: m.id,
            totalTipsReceived: totalTipsReceived,
            totalTipsPaid: paymentData.totalPaid,
            previousBalance: paymentData.previousBalance,
            currentBalance: Math.max(0, currentBalance), // A balance should not be negative.
            lastPaymentAmount: paymentData.lastPaymentAmount,
            lastPaymentDate: paymentData.lastPaymentDate,
            status: AccountStatus.ACTIVE, // This is a temporary status; it will be updated in the next step.
        };
    });
    
    // --- Step 4: Create a fresh, independent copy of the merchant data for modification ---
    merchants = rawMerchants.map(m => ({
        ...JSON.parse(JSON.stringify(m)),
        lat: 19.4326 + (Math.random() - 0.5) * 0.1, // Add mock geo-coordinates
        lng: -99.1332 + (Math.random() - 0.5) * 0.1
    }));
    
    // --- Step 5: Update final merchant records with calculated balances and statuses ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    merchants.forEach(merchant => {
        const balance = tipBalances.find(b => b.id === merchant.id);
        if (!balance) return; // Should not happen, but a good safeguard.

        // Update merchant fields based on the definitive balance calculation.
        merchant.amountDue = balance.currentBalance;
        merchant.lastPaymentDate = toDateString(new Date(balance.lastPaymentDate));
        merchant.tipsStatus = balance.currentBalance > 0 ? TipsStatus.PENDING : TipsStatus.PAID;
        
        // If there's a balance due, calculate days overdue and determine account status.
        if (balance.currentBalance > 0) {
            const lastPaymentDate = new Date(balance.lastPaymentDate);
            lastPaymentDate.setHours(0, 0, 0, 0);

            const diffTime = today.getTime() - lastPaymentDate.getTime();
            const daysSincePayment = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
            
            merchant.daysDue = daysSincePayment;

            // Apply financial rules to set the final account status.
            if (daysSincePayment >= settings.financial.suspensionDays) {
                merchant.accountStatus = AccountStatus.SUSPENDED;
            } else {
                merchant.accountStatus = AccountStatus.ACTIVE;
            }
        } else {
            // If balance is zero, the account is active and up-to-date.
            merchant.daysDue = 0;
            merchant.accountStatus = AccountStatus.ACTIVE;
            merchant.tipsStatus = TipsStatus.PAID;
        }

        // Sync the account status back to the balance object for consistency.
        balance.status = merchant.accountStatus;
    });
}


function generateAndSetNotifications() {
    const dynamicNotifications: Notification[] = [];
    let idCounter = 1;
    const now = Date.now();

    // Rule A: New Merchant Registration
    if (settings.notifications.onNewMerchant) {
        dynamicNotifications.push({
            id: (idCounter++).toString(),
            message: 'El nuevo comercio "La Esquina Creativa" se ha registrado.',
            timestamp: new Date(now - 1 * 60 * 1000).toISOString(),
            read: false,
            linkTo: { view: 'Merchants', targetId: 'MERCH-7' }
        });
    }

    // Rule B: Merchant Status Change
    if (settings.notifications.onStatusChange) {
        merchants.forEach(merchant => {
            const lastPaymentDate = new Date(merchant.lastPaymentDate);
            const today = new Date();
            lastPaymentDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            const diffTime = today.getTime() - lastPaymentDate.getTime();
            const daysSincePayment = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (merchant.accountStatus === AccountStatus.SUSPENDED) {
                dynamicNotifications.push({
                    id: (idCounter++).toString(),
                    message: `La cuenta de "${merchant.name}" ha sido suspendida.`,
                    timestamp: new Date(now - (idCounter * 5) * 60 * 1000).toISOString(),
                    read: true,
                    linkTo: { view: 'Merchants', targetId: merchant.id }
                });
            } else if ([
                settings.financial.dueWarningDays, 
                settings.financial.lateWarningDays, 
                settings.financial.veryLateWarningDays
            ].includes(daysSincePayment)) {
                 dynamicNotifications.push({
                    id: (idCounter++).toString(),
                    message: `El pago de propinas para "${merchant.name}" está pendiente.`,
                    timestamp: new Date(now - (idCounter * 5) * 60 * 1000).toISOString(),
                    read: false,
                    linkTo: { view: 'Merchants', targetId: merchant.id }
                });
            }
        });
    }

    // Rule C: New Messages
    if (settings.notifications.onNewMessage) {
        conversations.forEach(conv => {
            if (conv.unreadCount > 0) {
                dynamicNotifications.push({
                    id: (idCounter++).toString(),
                    message: `Tienes ${conv.unreadCount} mensaje(s) nuevo(s) de "${conv.userName}".`,
                    timestamp: conv.lastMessageTimestamp,
                    read: false,
                    linkTo: { view: 'Messages', targetId: conv.id }
                });
            }
        });
    }
    
    notifications = dynamicNotifications;
}


// Initialize global receipts from the raw definition, ensuring they have full properties
receipts = initialReceipts.map((r, i) => ({
    ...r,
    id: `REC-10${i}`,
    merchantName: rawMerchants.find(m => m.id === r.merchantId)?.name ?? 'N/A',
    status: ReceiptStatus.GENERATED,
}));

// Run initialization and generate notifications
initializeAndSyncData();
generateAndSetNotifications();


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
    async getSettings(): Promise<AppSettings> {
        await sleep(150);
        return JSON.parse(JSON.stringify(settings));
    },

    async updateSettings(newSettings: AppSettings): Promise<AppSettings> {
        await sleep(500);
        settings = JSON.parse(JSON.stringify(newSettings));
        // After updating settings, re-run data sync and notification generation
        // to ensure the application state reflects the new rules.
        initializeAndSyncData();
        generateAndSetNotifications();
        return settings;
    },
    async getNotifications(): Promise<Notification[]> {
        await sleep(300);
        // Ensure notifications are fresh based on current settings
        generateAndSetNotifications();
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
        return orders.filter(o => o.platformTip > 0).map((o, i) => ({
            id: `TIP-${o.id}`,
            orderId: o.id,
            customerName: o.customerName,
            merchantName: merchants.find(m => m.id === o.merchantId)?.name ?? 'N/A',
            date: o.date,
            amount: o.platformTip
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

    async getConversations(role: Role.CUSTOMER | Role.MERCHANT): Promise<Conversation[]> {
        await sleep(400);
        return conversations
            .filter(c => c.role === role)
            .sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
    },
     async getArchivedConversations(role: Role.CUSTOMER | Role.MERCHANT): Promise<Conversation[]> {
        await sleep(400);
        return archivedConversations
            .filter(c => c.role === role)
            .sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
    },
    async getMessages(conversationId: string): Promise<Message[]> {
        await sleep(300);
        return messages[conversationId] || [];
    },
    async sendMessage(conversationId: string, text: string): Promise<Message> {
        await sleep(500);
        const newMessage: Message = {
            id: `MSG-${Date.now()}`,
            conversationId,
            sender: 'admin',
            text,
            timestamp: new Date().toISOString(),
            status: MessageStatus.DELIVERED, // Sent and delivered
        };
        if (messages[conversationId]) {
            messages[conversationId].push(newMessage);
        } else {
            messages[conversationId] = [newMessage];
        }

        // Update conversation's last message
        const convIndex = conversations.findIndex(c => c.id === conversationId);
        if (convIndex > -1) {
            conversations[convIndex].lastMessage = text;
            conversations[convIndex].lastMessageTimestamp = newMessage.timestamp;
            
            // Simulate user reading the message after a delay
            setTimeout(() => {
                const msgIndex = messages[conversationId].findIndex(m => m.id === newMessage.id);
                if (msgIndex > -1) {
                    messages[conversationId][msgIndex].status = MessageStatus.READ;
                }
            }, 3000);
        }
        
        return newMessage;
    },
    async markConversationAsRead(conversationId: string): Promise<void> {
        await sleep(100);
        const convIndex = conversations.findIndex(c => c.id === conversationId);
        if (convIndex > -1) {
            conversations[convIndex].unreadCount = 0;
        }
    },
    async archiveConversations(ids: string[]): Promise<void> {
        await sleep(500);
        const toArchive = conversations.filter(c => ids.includes(c.id));
        archivedConversations.push(...toArchive);
        conversations = conversations.filter(c => !ids.includes(c.id));
    },
    async deleteConversations(ids: string[], fromArchive: boolean): Promise<void> {
        await sleep(500);
        if (fromArchive) {
            archivedConversations = archivedConversations.filter(c => !ids.includes(c.id));
        } else {
            conversations = conversations.filter(c => !ids.includes(c.id));
        }
    },
    async getConversationById(id: string): Promise<{ conversation: Conversation; isArchived: boolean } | undefined> {
        await sleep(100);
        let conversation = conversations.find(c => c.id === id);
        if (conversation) {
            return { conversation, isArchived: false };
        }
        conversation = archivedConversations.find(c => c.id === id);
        if (conversation) {
            return { conversation, isArchived: true };
        }
        return undefined;
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