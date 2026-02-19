// Tipos para el sistema POS

export interface Product {
  id: number;
  name: string;
  price: number;
  stock?: number;
  categoryId: number;
  category?: string;
  image?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id: number;
  name: string;
  active: boolean;
  order?: number;
}

export interface DeliveryDriver {
  id: number;
  name: string;
  phone: string;
  active: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  itemNote?: string;
}

export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  ruc?: string;
  businessName?: string;
  isExempt?: boolean;
  exempt?: boolean; // Added for compatibility
}

export type OrderType = "delivery" | "pickup" | "dineIn" | "local";

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
  saleNumber: string;
  date: string | Date;
  
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  
  customer?: CustomerInfo;

  type: OrderType;
  
  items: SaleItem[];

  subtotal: number;
  discount: number;
  deliveryCost?: number;
  total: number;
  
  paymentMethod: string;
  payments?: Payment[];
  
  status: "pending" | "partial" | "completed" | "cancelled" | "pending_payment";
  
  createdBy?: string;
  cancelledBy?: string;
  cancelReason?: string;
  
  deliveryDriverId?: number;
  deliveryDriverName?: string;
  
  // Propiedades para compatibilidad con reportes y exportación
  deliveryPerson?: string;
  paymentStatus?: string;
  balance?: number;
  amountPaid?: number;
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

export interface PrintFormatConfig {
  comandaTitleSize: number;
  comandaProductSize: number;
  comandaShowPrices: boolean;
  comandaCopies: number;
  comandaCustomFields: string[];
  ticketHeaderSize: number;
  ticketProductSize: number;
  ticketTotalSize: number;
  ticketThankYouMessage: string;
  ticketShowLogo: boolean;
  businessInfo: BusinessInfo;
}

export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  ruc: string;
  additionalInfo: string;
}

export interface PrinterSettings {
  kitchenPrinter: string;
  clientPrinter: string;
  paperSize: "80mm" | "58mm";
  copies: number;
}

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  type: "sale" | "adjustment" | "initial" | "return";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdBy: string;
  createdAt: Date;
}

export interface InventoryAlert {
  productId: number;
  productName: string;
  currentStock: number;
  minStock: number;
  status: "low" | "critical" | "out";
}