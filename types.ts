// Fix: Populated types.ts with all necessary type definitions for the application.
export enum Role {
  ADMIN = 'Administrador',
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
}

export interface DashboardStats {
  totalRevenue: number;
  ordersToday: number;
  newCustomers: number;
  totalAmountDue: number;
}

export enum OrderStatus {
  PENDING = 'Pendiente',
  PROCESSING = 'Procesando',
  SHIPPED = 'Enviado',
  DELIVERED = 'Entregado',
  CANCELLED = 'Cancelado',
}

export interface Order {
  id: string;
  customerName: string;
  merchantName: string;
  date: string;
  total: number;
  status: OrderStatus;
}

export interface Product {
  id: string;
  name: string;
  merchantName: string;
  category: string;
  price: number;
  stock: number;
}

export interface TipPayment {
  id: string;
  orderId: string;
  customerName: string;
  merchantName: string;
  date: string;
  amount: number;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details: string;
}

// -- Merchant Specific Types --

export enum TipsStatus {
    PAID = 'Pagado',
    PENDING = 'Pendiente',
    OVERDUE = 'Vencido',
}

export enum AccountStatus {
    ACTIVE = 'Activa',
    SUSPENDED = 'Suspendida',
}

export enum ActivityStatus {
    ONLINE = 'Online',
    OFFLINE = 'Offline'
}

// For the main merchant list view
export interface Merchant {
    id: string;
    name: string;
    tipPerTransaction: number;
    lastPaymentDate: string;
    tipsStatus: TipsStatus;
    amountDue: number;
    daysDue: number;
    accountStatus: AccountStatus;
}

// For the detailed merchant profile panel
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
    merchantId: string;
    income: number;
    outcome: number;
    difference: number;
    newBalance: number;
    status: 'Al día' | 'Pendiente';
    lastPaymentDate: string;
}