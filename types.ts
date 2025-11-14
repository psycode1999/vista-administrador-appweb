// --- ENUMS ---

export enum TipsStatus { PENDING = 'Pendiente', PAID = 'Pagado' }
export enum AccountStatus { ACTIVE = 'Activa', PENDING = 'Pendiente', SUSPENDED = 'Suspendida', DELETION_PENDING = 'Eliminación Programada' }
export enum ActivityStatus { ONLINE = 'Online', OFFLINE = 'Offline' }
export enum OrderStatus { PENDING = 'Pendiente', PROCESSING = 'Procesando', SHIPPED = 'Enviado', DELIVERED = 'Entregado', CANCELLED = 'Cancelado' }
export enum ProductCategory {
  FRESH_FOOD = 'Alimentos frescos',
  BAKERY = 'Panadería y repostería',
  PANTRY = 'Despensa / productos no perecederos',
  SNACKS = 'Snacks y dulces',
  BEVERAGES = 'Bebidas',
  ALCOHOLIC_BEVERAGES = 'Bebidas alcohólicas',
  HOME_CLEANING = 'Limpieza del hogar',
  PERSONAL_HYGIENE = 'Higiene personal',
  PETS = 'Mascotas',
  STATIONERY = 'Papelería y oficina',
}
export enum ReceiptStatus { GENERATED = 'Generado' }
export enum Role { ADMIN = 'Admin', CUSTOMER = 'Cliente', MERCHANT = 'Comercio' }
export enum MessageStatus { SENT = 'Enviado', DELIVERED = 'Entregado', READ = 'Leído' }
export enum UnitOfMeasure { GRAMS = 'g', KILOGRAMS = 'kg', MILLILITERS = 'ml', UNITS = 'unidades' }

// --- INTERFACES & TYPES ---

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkTo?: { view: string; targetId: string };
}

export interface Merchant {
  id: string;
  name: string;
  address: string;
  tipPerTransaction: number;
  lastPaymentDate: string;
  tipsStatus: TipsStatus;
  daysDue: number;
  amountDue: number;
  accountStatus: AccountStatus;
  lat: number;
  lng: number;
  deletionScheduledAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
}

export interface MerchantProfile {
  id: string;
  accountName: string;
  phone: string;
  address: string;
  tipPerTransaction: number;
  sellerName: string;
  creationDate: string;
  activity: ActivityStatus;
  lastConnection: string;
  accountStatus: AccountStatus;
}

export interface TipBalance {
  id: string;
  totalTipsReceived: number;
  totalTipsPaid: number;
  previousBalance: number | null;
  currentBalance: number;
  lastPaymentAmount: number | null;
  lastPaymentDate: string;
  status: AccountStatus;
  newTipsSinceLastPayment: number;
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
  date: string; // YYYY-MM-DD
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
  userLocation?: { lat: number; lng: number };
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  merchantName?: string;
  category: ProductCategory;
  price: number;
  stock: number;
  imageUrl?: string;
  sizeValue?: number;
  unitOfMeasure?: UnitOfMeasure;
  flavorAroma?: string;
  createdAt?: string;
}

export interface TipPayment {
  id: string;
  orderId: string;
  customerName: string;
  merchantName: string;
  date: string;
  amount: number;
  location: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface Receipt {
  id: string;
  merchantId: string;
  merchantName: string;
  pendingBalance: number;
  amountReceived: number;
  difference: number;
  createdBy: string;
  date: string;
  status: ReceiptStatus;
}

export type DashboardMetricKey = 'currentRevenue' | 'ordersToday' | 'newCustomers' | 'totalThisMonth' | 'totalDue';

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

export interface HistoricalDataPoint {
  date: string;
  value: number;
}

export interface Conversation {
    id: string;
    userId: string;
    userName: string;
    userAvatarUrl: string;
    role: Role;
    lastMessage: string;
    lastMessageTimestamp: string;
    unreadCount: number;
}

export interface Message {
    id: string;
    conversationId: string;
    sender: 'user' | 'admin';
    text: string;
    timestamp: string;
    status: MessageStatus;
}

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

export interface MarketplaceUser {
    id: string;
    name: string;
    avatarUrl: string;
    role: Role;
}