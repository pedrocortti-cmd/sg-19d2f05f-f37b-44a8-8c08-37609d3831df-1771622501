// Tipos para el sistema POS

export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number; // Changed to number ID
  category?: string; // Optional name
  image?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id: number;
  name: string;
  active: boolean;
  order?: number; // Optional
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

// Item saved in a sale (snapshot)
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
  
  // Flattened info for easier history display
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  
  // Structured info
  customer?: CustomerInfo;

  type: OrderType;
  
  // Items snapshot
  items: SaleItem[];

  subtotal: number;
  discount: number;
  deliveryCost?: number;
  total: number;
  
  paymentMethod: string; // Simplified for history
  payments?: Payment[]; // Detailed for processing
  
  status: "pending" | "partial" | "completed" | "cancelled" | "pending_payment";
  
  createdBy?: string;
  cancelledBy?: string;
  cancelReason?: string;
  
  deliveryDriverId?: number;
  deliveryDriverName?: string;
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