export enum Role {
    ADMIN = 'Administrador',
    MERCHANT = 'Comercio',
    CUSTOMER = 'Cliente',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl: string;
}

export interface Notification {
    id: string;
    message: string;
    timestamp: string;
    read: boolean;
    linkTo?: {
        view: string;
        targetId: string;
    };
}

export enum AccountStatus {
    ACTIVE = 'Activa',
    SUSPENDED = 'Suspendida',
}

export enum TipsStatus {
    PAID = 'Pagado',
    PENDING = 'Pendiente',
}

export interface Merchant {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    tipPerTransaction: number;
    lastPaymentDate: string; // "YYYY-MM-DD"
    tipsStatus: TipsStatus;
    daysDue: number;
    amountDue: number;
    accountStatus: AccountStatus;
}

export enum ActivityStatus {
    ONLINE = 'En línea',
    OFFLINE = 'Desconectado',
}

export interface MerchantProfile {
    id: string;
    accountName: string;
    phone: string;
    address: string;
    tipPerTransaction: number;
    sellerName: string;
    creationDate: string; // ISO date string
    activity: ActivityStatus;
    lastConnection: string; // ISO date string
    accountStatus: AccountStatus;
}

export interface TipBalance {
    id: string;
    totalTipsReceived: number;
    totalTipsPaid: number;
    previousBalance: number | null;
    currentBalance: number;
    lastPaymentAmount: number | null;
    lastPaymentDate: string; // ISO date string
    status: AccountStatus;
    newTipsSinceLastPayment: number;
}

export enum OrderStatus {
    PENDING = 'Pendiente',
    PROCESSING = 'Preparando',
    SHIPPED = 'Enviado',
    DELIVERED = 'Entregado',
    CANCELLED = 'Cancelado',
}

export interface OrderProduct {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface Order {
    id: string;
    merchantId: string;
    customerName: string;
    customerAddress: string;
    location: string;
    date: string; // "YYYY-MM-DD"
    status: OrderStatus;
    products: OrderProduct[];
    merchantTip: number;
    platformTip: number;
    method: string;
}

export interface MerchantOrderSummary {
    merchantId: string;
    merchantName: string;
    ordersToday: number;
    totalRevenue: number;
    expectedRevenue: number;
}

export interface OrderFilterOptions {
    products: string[];
    locations: string[];
}

export interface MerchantSummaryFilters {
    date: string;
    product: string;
    location: string;
    status: OrderStatus | '';
}


export enum ProductCategory {
    COFFEE = 'Café',
    BOOKS = 'Libros',
    CLOTHING = 'Ropa',
    ELECTRONICS = 'Electrónica',
    GROCERIES = 'Abarrotes',
    GOURMET = 'Gourmet',
}

export interface Product {
    id: string;
    name: string;
    brand: string;
    merchantName: string;
    category: ProductCategory;
    price: number;
    stock: number;
}

export interface TipPayment {
    id: string;
    orderId: string;
    customerName: string;
    merchantName: string;
    date: string; // ISO date string
    amount: number;
    location: string;
}

export interface AuditLog {
    id: string;
    timestamp: string; // ISO date string
    user: string;
    action: string;
    details: string;
}

export enum ReceiptStatus {
    GENERATED = 'Generado',
}

export interface Receipt {
    id: string;
    merchantId: string;
    merchantName: string;
    pendingBalance: number;
    amountReceived: number;
    difference: number;
    createdBy: string;
    date: string; // ISO date string
    status: ReceiptStatus;
}

export interface DashboardStat {
    value: string;
    change?: string;
    changeType?: 'increase' | 'decrease';
    absoluteChange?: string;
}

export interface DashboardStats {
    currentRevenue: DashboardStat;
    ordersToday: DashboardStat;
    newCustomers: DashboardStat;
    totalThisMonth: DashboardStat;
    totalDue: DashboardStat;
}

export type DashboardMetricKey = keyof DashboardStats;

export interface HistoricalDataPoint {
    date: string;
    value: number;
}

export interface HistoricalChartData {
    [key: string]: HistoricalDataPoint[];
}

export enum MessageStatus {
    SENT = 'Enviado',
    DELIVERED = 'Recibido',
    READ = 'Visto',
}

export interface Message {
    id: string;
    conversationId: string;
    sender: 'admin' | 'user';
    text: string;
    timestamp: string; // ISO date string
    status: MessageStatus;
}

export interface Conversation {
    id: string;
    userId: string;
    userName: string;
    userAvatarUrl: string;
    role: Role.CUSTOMER | Role.MERCHANT;
    lastMessage: string;
    lastMessageTimestamp: string;
    unreadCount: number;
}

// Settings
export interface ProfileSettings {
    name: string;
    avatarUrl: string;
    theme: 'light' | 'dark';
}

export interface NotificationSettings {
    onNewMerchant: boolean;
    onStatusChange: boolean;
    onNewMessage: boolean;
}

export interface FinancialSettings {
    dueWarningDays: number;
    lateWarningDays: number;
    veryLateWarningDays: number;
    suspensionDays: number;
}

export interface AppSettings {
    profile: ProfileSettings;
    notifications: NotificationSettings;
    financial: FinancialSettings;
}