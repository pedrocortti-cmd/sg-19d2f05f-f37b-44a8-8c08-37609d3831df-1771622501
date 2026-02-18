// Tipos para el sistema POS

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id: number;
  name: string;
  active: boolean;
  order: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  ruc: string;
  businessName: string;
  isExempt: boolean;
}

export type OrderType = "delivery" | "pickup" | "local";

export type PaymentMethod = "cash" | "qr" | "card" | "transfer" | "other";

export interface Payment {
  id: number;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  timestamp: Date;
}

export interface Sale {
  id: number;
  orderNumber: string;
  date: Date;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  orderType: OrderType;
  payments: Payment[];
  paidAmount: number;
  remainingAmount: number;
  customer: CustomerInfo;
  note: string;
  status: "pending" | "partial" | "completed" | "cancelled";
  createdBy?: string;
  cancelledBy?: string;
  cancelReason?: string;
  modificationHistory?: {
    timestamp: Date;
    itemsAdded: CartItem[];
    previousTotal: number;
    newTotal: number;
  }[];
}

export type UserRole = "admin" | "cashier" | "kitchen";

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  active: boolean;
}

export interface PrinterConfig {
  kitchenPrinter: string;
  clientPrinter: string;
  paperSize: "80mm" | "58mm";
  copies: number;
}