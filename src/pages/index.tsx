import { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import { ShoppingCart, Package, Warehouse, TrendingUp, FileText, Settings, HelpCircle, LogOut, Search, Trash2, X, ChevronDown, ChevronUp, Printer, Edit2, Check, Clock, DollarSign, Bike } from "lucide-react";
import { ProductsManager } from "@/components/pos/ProductsManager";
import { SalesHistory } from "@/components/pos/SalesHistory";
import { PrinterSettings } from "@/components/pos/PrinterSettings";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { PrintFormatSettings } from "@/components/pos/PrintFormatSettings";
import { Reports } from "@/components/pos/Reports";
import type {
  Product as ProductType,
  Category,
  Sale,
  CartItem as CartItemType,
  CustomerInfo,
  OrderType,
  Payment,
  DeliveryDriver,
  SaleItem,
  PrintFormatConfig
} from "@/types/pos";

// Helper function for consistent number formatting
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("es-PY");
};

// Helper function to format date without hydration issues
const formatDateTime = (date: Date): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export default function Home() {
  // Estado del sistema
  const [currentView, setCurrentView] = useState<string>("pos");
  const [isCustomerCollapsed, setIsCustomerCollapsed] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [ordersPanelTab, setOrdersPanelTab] = useState<"pending" | "history">("pending");
  const [settingsTab, setSettingsTab] = useState<"printers" | "format">("printers");
  
  // Estado del carrito y pedido actual
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [deliveryCost, setDeliveryCost] = useState<number>(0);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [note, setNote] = useState<string>("");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [tempItemNote, setTempItemNote] = useState<string>("");
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [currentPayments, setCurrentPayments] = useState<Payment[]>([]);
  
  // Estado del cliente
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    ruc: "",
    businessName: "",
    isExempt: false
  });
  
  // Estado de productos
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  
  // Estado de gestión de productos y categorías
  const [products, setProducts] = useState<ProductType[]>([
    { id: 1, name: "Carnívora", price: 22000, categoryId: 1, category: "Hamburguesas", active: true },
    { id: 2, name: "Chesse", price: 12000, categoryId: 1, category: "Hamburguesas", active: true },
    { id: 3, name: "Chilli", price: 17000, categoryId: 1, category: "Hamburguesas", active: true },
    { id: 4, name: "Chilli Doble", price: 22000, categoryId: 1, category: "Hamburguesas", active: true },
    { id: 5, name: "Chilli Triple", price: 27000, categoryId: 1, category: "Hamburguesas", active: true },
    { id: 6, name: "Clasica", price: 15000, categoryId: 1, category: "Hamburguesas", active: true },
    { id: 7, name: "Doble", price: 20000, categoryId: 1, category: "Hamburguesas", active: true },
    { id: 8, name: "Doble Chesse", price: 18000, categoryId: 1, category: "Hamburguesas", active: true },
    { id: 9, name: "Triple", price: 25000, categoryId: 1, category: "Hamburguesas", active: true },
    { id: 10, name: "Papas Fritas", price: 8000, categoryId: 2, category: "Acompañamientos", active: true },
    { id: 11, name: "Nuggets", price: 10000, categoryId: 2, category: "Acompañamientos", active: true },
    { id: 12, name: "Coca Cola", price: 5000, categoryId: 3, category: "Bebidas", active: true },
    { id: 13, name: "Agua", price: 3000, categoryId: 3, category: "Bebidas", active: true },
  ]);
  
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Hamburguesas", active: true, order: 1 },
    { id: 2, name: "Acompañamientos", active: true, order: 2 },
    { id: 3, name: "Bebidas", active: true, order: 3 },
  ]);
  
  const [deliveryDrivers, setDeliveryDrivers] = useState<DeliveryDriver[]>([
    { id: 1, name: "Carlos Rodríguez", phone: "0981123456", active: true },
    { id: 2, name: "María González", phone: "0982234567", active: true },
    { id: 3, name: "Juan Pérez", phone: "0983345678", active: true },
  ]);
  
  const [sales, setSales] = useState<Sale[]>([]);
  
  const categoryNames = ["Todos", ...categories.filter(c => c.active).sort((a, b) => (a.order || 0) - (b.order || 0)).map(c => c.name)];
  
  // Pedidos pendientes (estado "pending")
  const pendingOrders = useMemo(() => {
    return sales.filter(sale => sale.status === "pending" || sale.status === "partial");
  }, [sales]);
  
  // Todos los pedidos para historial
  const allOrders = useMemo(() => {
    return sales;
  }, [sales]);
  
  // Filtrar pedidos según la pestaña activa
  const currentTabOrders = useMemo(() => {
    return ordersPanelTab === "pending" ? pendingOrders : allOrders;
  }, [ordersPanelTab, pendingOrders, allOrders]);
  
  // Filtrar pedidos por búsqueda
  const filteredOrders = useMemo(() => {
    if (!orderSearchTerm) return currentTabOrders;
    
    const searchLower = orderSearchTerm.toLowerCase();
    return currentTabOrders.filter(order => 
      order.saleNumber.toLowerCase().includes(searchLower) ||
      (order.customer?.name || "").toLowerCase().includes(searchLower) ||
      (order.customer?.phone || "").toLowerCase().includes(searchLower)
    );
  }, [currentTabOrders, orderSearchTerm]);
  
  // Productos filtrados
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Todos" || product.categoryId === categories.find(c => c.name === selectedCategory)?.id;
      return matchesSearch && matchesCategory && product.active;
    });
  }, [searchTerm, selectedCategory, products, categories]);
  
  // Funciones del carrito
  const addToCart = (product: ProductType) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id && !item.itemNote);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id && !item.itemNote
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1, itemNote: "" }];
      }
    });
  };
  
  const updateQuantity = (productId: number, itemNote: string | undefined, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId && item.itemNote === itemNote) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };
  
  const removeFromCart = (productId: number, itemNote: string | undefined) => {
    setCart(prevCart => prevCart.filter(item => !(item.product.id === productId && item.itemNote === itemNote)));
  };
  
  const startEditingItemNote = (productId: number, currentNote: string | undefined) => {
    setEditingItemId(productId);
    setTempItemNote(currentNote || "");
  };
  
  const saveItemNote = (productId: number, oldNote: string | undefined) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.product.id === productId && item.itemNote === oldNote) {
        return { ...item, itemNote: tempItemNote };
      }
      return item;
    }));
    setEditingItemId(null);
    setTempItemNote("");
  };
  
  const cancelEditingItemNote = () => {
    setEditingItemId(null);
    setTempItemNote("");
  };
  
  const clearCart = () => {
    setCart([]);
    setNote("");
    setDeliveryCost(0);
    setSelectedDriverId(null);
    setEditingItemId(null);
    setTempItemNote("");
    setCurrentOrderId(null);
    setCurrentPayments([]);
    setCustomer({
      name: "",
      phone: "",
      address: "",
      ruc: "",
      businessName: "",
      isExempt: false
    });
  };

  // Helper to convert CartItems to SaleItems
  const cartToSaleItems = (cartItems: CartItemType[]): SaleItem[] => {
    return cartItems.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price
    }));
  };

  // Helper to convert SaleItems back to CartItems (needs products list)
  const saleItemsToCartItems = (saleItems: SaleItem[]): CartItemType[] => {
    return saleItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        // Fallback if product was deleted
        return {
          product: {
            id: item.productId,
            name: item.productName,
            price: item.price,
            categoryId: 0,
            active: false
          },
          quantity: item.quantity
        };
      }
      return {
        product,
        quantity: item.quantity
      };
    });
  };

  // Función para imprimir pedido (window.print)
  const handlePrintOrder = () => {
    if (cart.length === 0) {
      alert("No hay productos en el carrito para imprimir");
      return;
    }

    const orderNumber = currentOrderId ? 
      sales.find(s => s.id === currentOrderId)?.saleNumber || `${Date.now().toString().slice(-6)}` :
      `${Date.now().toString().slice(-6)}`;
      
    const printWindow = window.open('', '', 'width=300,height=600');
    
    if (!printWindow) {
      alert("Por favor permite las ventanas emergentes para imprimir");
      return;
    }

    const deliveryDriverInfo = orderType === "delivery" && selectedDriverId ? 
      deliveryDrivers.find(d => d.id === selectedDriverId) : null;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pedido #${orderNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            padding: 10mm;
            width: 80mm;
          }
          
          .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px dashed #000;
          }
          
          .title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .subtitle {
            font-size: 11px;
            margin-bottom: 3px;
          }
          
          .section {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #000;
          }
          
          .label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
          }
          
          .value {
            display: inline;
          }
          
          .row {
            margin-bottom: 5px;
            font-size: 11px;
          }
          
          .items-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-bottom: 5px;
            padding-bottom: 5px;
            border-bottom: 1px solid #000;
          }
          
          .items-header .cant {
            width: 40px;
            text-align: center;
          }
          
          .items-header .desc {
            flex: 1;
          }
          
          .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
            padding-top: 5px;
            border-top: 1px dashed #000;
          }
          
          .item .cant {
            width: 40px;
            text-align: center;
            font-weight: bold;
          }
          
          .item .desc {
            flex: 1;
          }
          
          .item .price {
            text-align: right;
            min-width: 80px;
          }
          
          .item-note {
            margin-left: 40px;
            font-size: 11px;
            font-style: italic;
            color: #333;
            margin-top: 2px;
            margin-bottom: 5px;
          }
          
          .delivery-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
            padding-top: 5px;
            border-top: 1px dashed #000;
          }
          
          .delivery-item .desc {
            flex: 1;
            font-weight: bold;
          }
          
          .delivery-item .price {
            text-align: right;
            min-width: 80px;
            font-weight: bold;
          }
          
          .separator {
            border-top: 2px dashed #000;
            margin: 15px 0;
          }
          
          .total-section {
            margin-top: 10px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 14px;
            font-weight: bold;
          }
          
          .note-section {
            margin-top: 10px;
            padding: 10px;
            background: #f0f0f0;
            border: 1px solid #000;
          }
          
          .note-title {
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .footer {
            text-align: center;
            margin-top: 15px;
            font-size: 10px;
          }
          
          @media print {
            body {
              padding: 5mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">== DE LA GRAN BURGER ==</div>
          <div class="subtitle">Pedido de Venta - N° Premier Sistema</div>
        </div>
        
        <div class="section">
          <div class="row">
            <span class="label">Nº Pedido:</span>
            <span class="value">${orderNumber}</span>
          </div>
          <div class="row">
            <span class="label">Cliente:</span>
            <span class="value">${customer.name || 'Cliente General'}</span>
          </div>
          ${customer.phone ? `
          <div class="row">
            <span class="label">Teléfono:</span>
            <span class="value">${customer.phone}</span>
          </div>
          ` : ''}
          <div class="row">
            <span class="label">Tipo:</span>
            <span class="value">${orderType === 'delivery' ? 'DELIVERY' : 'PARA RETIRAR'}</span>
          </div>
          ${orderType === 'delivery' && deliveryDriverInfo ? `
          <div class="row">
            <span class="label">Repartidor:</span>
            <span class="value">${deliveryDriverInfo.name}</span>
          </div>
          ` : ''}
          ${customer.address && orderType === 'delivery' ? `
          <div class="row">
            <span class="label">Dirección:</span>
            <span class="value">${customer.address}</span>
          </div>
          ` : ''}
          ${customer.ruc ? `
          <div class="row">
            <span class="label">RUC:</span>
            <span class="value">${customer.ruc}</span>
          </div>
          ` : ''}
          ${customer.businessName ? `
          <div class="row">
            <span class="label">Razón Social:</span>
            <span class="value">${customer.businessName}</span>
          </div>
          ` : ''}
        </div>
        
        <div class="section">
          <div class="items-header">
            <div class="cant">CANT</div>
            <div class="desc">DESCRIPCION</div>
            <div class="price">PRECIO</div>
          </div>
          ${cart.map(item => `
            <div class="item">
              <div class="cant">${item.quantity}</div>
              <div class="desc">${item.product.name}</div>
              <div class="price">Gs. ${formatCurrency(item.product.price * item.quantity)}</div>
            </div>
            ${item.itemNote ? `<div class="item-note">(${item.itemNote})</div>` : ''}
          `).join('')}
          ${orderType === 'delivery' && deliveryCost > 0 ? `
            <div class="delivery-item">
              <div class="desc">Delivery</div>
              <div class="price">Gs. ${formatCurrency(deliveryCost)}</div>
            </div>
          ` : ''}
        </div>
        
        <div class="total-section">
          <div class="total-row">
            <span>TOTAL:</span>
            <span>Gs. ${formatCurrency(total)}</span>
          </div>
        </div>
        
        <div class="separator"></div>
        
        ${note ? `
        <div class="note-section">
          <div class="note-title">NOTA:</div>
          <div>${note}</div>
        </div>
        ` : ''}
        
        <div class="footer">
          ${formatDateTime(new Date())}
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Función para imprimir comanda (sin precios, para cocina)
  const handlePrintComanda = () => {
    if (cart.length === 0) {
      alert("No hay productos en el carrito para imprimir");
      return;
    }

    const orderNumber = currentOrderId ? 
      sales.find(s => s.id === currentOrderId)?.saleNumber || `${Date.now().toString().slice(-6)}` :
      `${Date.now().toString().slice(-6)}`;
      
    const printWindow = window.open('', '', 'width=300,height=600');
    
    if (!printWindow) {
      alert("Por favor permite las ventanas emergentes para imprimir");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Comanda #${orderNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.5;
            padding: 10mm;
            width: 80mm;
          }
          
          .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 3px double #000;
          }
          
          .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
            text-transform: uppercase;
          }
          
          .subtitle {
            font-size: 12px;
            margin-bottom: 3px;
          }
          
          .section {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #000;
          }
          
          .label {
            font-weight: bold;
            display: inline-block;
            width: 90px;
          }
          
          .value {
            display: inline;
          }
          
          .row {
            margin-bottom: 6px;
          }
          
          .items-header {
            font-weight: bold;
            margin-bottom: 8px;
            padding-bottom: 5px;
            border-bottom: 2px solid #000;
            text-transform: uppercase;
          }
          
          .item {
            display: flex;
            margin-bottom: 8px;
            padding: 5px;
            background: #f5f5f5;
            border-radius: 3px;
          }
          
          .item .cant {
            width: 50px;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            background: #000;
            color: #fff;
            border-radius: 3px;
            padding: 2px;
            margin-right: 10px;
          }
          
          .item .desc {
            flex: 1;
            font-size: 14px;
            font-weight: 600;
          }
          
          .item-note {
            margin-left: 60px;
            font-size: 12px;
            font-style: italic;
            background: #fff;
            padding: 5px;
            border-left: 3px solid #000;
            margin-top: 5px;
            margin-bottom: 8px;
          }
          
          .separator {
            border-top: 3px double #000;
            margin: 15px 0;
          }
          
          .note-section {
            margin-top: 15px;
            padding: 10px;
            background: #fff;
            border: 2px solid #000;
            border-radius: 5px;
          }
          
          .note-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 8px;
            text-transform: uppercase;
            text-decoration: underline;
          }
          
          .note-content {
            font-size: 13px;
            line-height: 1.6;
          }
          
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 11px;
            color: #666;
          }
          
          @media print {
            body {
              padding: 5mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">🍔 COMANDA COCINA 🍔</div>
          <div class="subtitle">De la Gran Burger</div>
        </div>
        
        <div class="section">
          <div class="row">
            <span class="label">Nº Pedido:</span>
            <span class="value" style="font-size: 16px; font-weight: bold;">${orderNumber}</span>
          </div>
          <div class="row">
            <span class="label">Cliente:</span>
            <span class="value">${customer.name || 'Cliente General'}</span>
          </div>
          ${customer.phone ? `
          <div class="row">
            <span class="label">Teléfono:</span>
            <span class="value">${customer.phone}</span>
          </div>
          ` : ''}
          <div class="row">
            <span class="label">Tipo:</span>
            <span class="value" style="font-weight: bold; font-size: 14px;">${orderType === 'delivery' ? '🚴 DELIVERY' : '🏪 PARA RETIRAR'}</span>
          </div>
          ${customer.address && orderType === 'delivery' ? `
          <div class="row">
            <span class="label">Dirección:</span>
            <span class="value">${customer.address}</span>
          </div>
          ` : ''}
        </div>
        
        <div class="section">
          <div class="items-header">
            📋 PRODUCTOS A PREPARAR
          </div>
          ${cart.map(item => `
            <div class="item">
              <div class="cant">${item.quantity}x</div>
              <div class="desc">${item.product.name}</div>
            </div>
            ${item.itemNote ? `<div class="item-note">⚠️ ${item.itemNote}</div>` : ''}
          `).join('')}
        </div>
        
        <div class="separator"></div>
        
        ${note ? `
        <div class="note-section">
          <div class="note-title">⚠️ NOTA IMPORTANTE:</div>
          <div class="note-content">${note}</div>
        </div>
        ` : ''}
        
        <div class="footer">
          📅 ${formatDateTime(new Date())}
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
  
  // Cálculos
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const total = subtotal + (orderType === "delivery" ? deliveryCost : 0);
  
  // Función para confirmar pedido (sin cobrar)
  const handleConfirmOrder = () => {
    if (cart.length === 0) {
      alert("No hay productos en el carrito");
      return;
    }
    
    // Validar que el campo Cliente no esté vacío
    if (!customer.name || customer.name.trim() === "") {
      alert("⚠️ El campo Cliente es obligatorio.\n\nPor favor ingrese el nombre del cliente antes de confirmar el pedido.");
      return;
    }
    
    // Si estamos editando un pedido existente
    if (currentOrderId) {
      const existingOrder = sales.find(s => s.id === currentOrderId);
      
      if (!existingOrder) {
        alert("Error: Pedido no encontrado");
        return;
      }
      
      // Si el pedido ya está completado, crear uno nuevo
      if (existingOrder.status === "completed") {
        const orderNumber = `${Date.now().toString().slice(-6)}`;
        const saleDate = new Date();
        
        const newSale: Sale = {
          id: sales.length + 1,
          saleNumber: orderNumber,
          date: saleDate,
          items: cartToSaleItems(cart),
          subtotal,
          discount: 0,
          deliveryCost: orderType === "delivery" ? deliveryCost : 0,
          deliveryDriverId: orderType === "delivery" ? selectedDriverId || undefined : undefined,
          deliveryDriverName: orderType === "delivery" && selectedDriverId ? deliveryDrivers.find(d => d.id === selectedDriverId)?.name : undefined,
          total,
          type: orderType,
          paymentMethod: "pending",
          payments: [],
          customer: { ...customer },
          status: "pending"
        };
        
        setSales([newSale, ...sales]);
        alert(`¡Nuevo pedido creado!\nNº ${orderNumber}\n(El pedido original #${existingOrder.saleNumber} permanece completado)\n\nTotal: Gs. ${formatCurrency(total)}\nEstado: Pendiente de Pago`);
        clearCart();
        return;
      }
      
      // Si el pedido está pendiente o parcial, actualizar el existente
      const paidAmount = existingOrder.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      
      const updatedSale: Sale = {
        ...existingOrder,
        items: cartToSaleItems(cart),
        subtotal,
        deliveryCost: orderType === "delivery" ? deliveryCost : 0,
        deliveryDriverId: orderType === "delivery" ? selectedDriverId || undefined : undefined,
        deliveryDriverName: orderType === "delivery" && selectedDriverId ? deliveryDrivers.find(d => d.id === selectedDriverId)?.name : undefined,
        total,
        type: orderType,
        customer: { ...customer },
        status: paidAmount > 0 ? "partial" : "pending"
      };
      
      setSales(sales.map(s => s.id === currentOrderId ? updatedSale : s));
      alert(`¡Pedido actualizado!\nNº ${existingOrder.saleNumber}\nTotal: Gs. ${formatCurrency(total)}\n\nEstado: ${updatedSale.status === "partial" ? "Pago Parcial" : "Pendiente de Pago"}`);
      clearCart();
      return;
    }
    
    // Crear nuevo pedido
    const orderNumber = `${Date.now().toString().slice(-6)}`;
    const saleDate = new Date();
    
    const newSale: Sale = {
      id: sales.length + 1,
      saleNumber: orderNumber,
      date: saleDate,
      items: cartToSaleItems(cart),
      subtotal,
      discount: 0,
      deliveryCost: orderType === "delivery" ? deliveryCost : 0,
      deliveryDriverId: orderType === "delivery" ? selectedDriverId || undefined : undefined,
      deliveryDriverName: orderType === "delivery" && selectedDriverId ? deliveryDrivers.find(d => d.id === selectedDriverId)?.name : undefined,
      total,
      type: orderType,
      paymentMethod: "pending",
      payments: [],
      customer: { ...customer },
      status: "pending"
    };
    
    setSales([newSale, ...sales]);
    
    alert(`¡Pedido confirmado!\nNº ${orderNumber}\nTotal: Gs. ${formatCurrency(total)}\n\nEstado: Pendiente de Pago`);
    clearCart();
  };
  
  // Función para seleccionar pedido del panel lateral
  const handleSelectOrder = (sale: Sale) => {
    // Restaurar carrito
    setCart(saleItemsToCartItems(sale.items));
    // Restaurar cliente
    setCustomer(sale.customer || { name: "", phone: "", address: "" });
    // Restaurar tipo de orden
    setOrderType(sale.type);
    // Restaurar costo y repartidor de delivery
    setDeliveryCost(sale.deliveryCost || 0);
    setSelectedDriverId(sale.deliveryDriverId || null);
    // Restaurar nota
    // setNote(sale.note || ""); // Note field removed from interface
    // Restaurar pagos parciales
    setCurrentPayments(sale.payments || []);
    // Guardar ID del pedido actual
    setCurrentOrderId(sale.id);
    
    // Cambiar a vista POS
    setCurrentView("pos");
    // Expandir cliente para ver datos restaurados
    setIsCustomerCollapsed(false);
    // Cerrar panel de pedidos
    setShowOrdersPanel(false);
  };
  
  // Función para iniciar pago
  const handleInitiatePayment = () => {
    if (cart.length === 0 && !currentOrderId) {
      alert("No hay productos en el carrito");
      return;
    }
    
    // Validar que el campo Cliente no esté vacío
    if (!customer.name || customer.name.trim() === "") {
      alert("⚠️ El campo Cliente es obligatorio.\n\nPor favor ingrese el nombre del cliente antes de procesar el pago.");
      return;
    }
    
    setShowPaymentModal(true);
  };
  
  const handleConfirmPayment = async (payments: Payment[], finalNote: string) => {
    setShowPaymentModal(false);
    
    const newPayments = [...currentPayments, ...payments];
    const paidAmount = newPayments.reduce((sum, p) => sum + p.amount, 0);
    
    if (currentOrderId) {
      // Actualizando pedido existente
      const existingOrder = sales.find(s => s.id === currentOrderId);
      if (!existingOrder) return;
      
      // Si ya está completado, crear nuevo pedido
      if (existingOrder.status === "completed") {
        const orderNumber = `${Date.now().toString().slice(-6)}`;
        const saleDate = new Date();
        
        const newSale: Sale = {
          id: sales.length + 1,
          saleNumber: orderNumber,
          date: saleDate,
          items: cartToSaleItems(cart),
          subtotal,
          discount: 0,
          deliveryCost: orderType === "delivery" ? deliveryCost : 0,
          deliveryDriverId: orderType === "delivery" ? selectedDriverId || undefined : undefined,
          deliveryDriverName: orderType === "delivery" && selectedDriverId ? deliveryDrivers.find(d => d.id === selectedDriverId)?.name : undefined,
          total,
          type: orderType,
          paymentMethod: payments[0]?.method || "other",
          payments: newPayments,
          customer: { ...customer },
          status: paidAmount >= total ? "completed" : "partial"
        };
        
        setSales([newSale, ...sales]);
        await printSale(newSale);
        
        alert(`¡Nuevo pedido creado y cobrado!\nNº ${orderNumber}\n(El pedido original #${existingOrder.saleNumber} permanece intacto)\n\nTotal: Gs. ${formatCurrency(total)}\nPagado: Gs. ${formatCurrency(paidAmount)}`);
        clearCart();
        return;
      }
      
      // Actualizar pedido pendiente/parcial
      const updatedSale: Sale = {
        ...existingOrder,
        items: cartToSaleItems(cart),
        subtotal,
        deliveryCost: orderType === "delivery" ? deliveryCost : 0,
        deliveryDriverId: orderType === "delivery" ? selectedDriverId || undefined : undefined,
        deliveryDriverName: orderType === "delivery" && selectedDriverId ? deliveryDrivers.find(d => d.id === selectedDriverId)?.name : undefined,
        total,
        payments: newPayments,
        paymentMethod: payments[0]?.method || existingOrder.paymentMethod,
        status: paidAmount >= total ? "completed" : "partial"
      };
      
      setSales(sales.map(s => s.id === currentOrderId ? updatedSale : s));
      await printSale(updatedSale);
      
      alert(`¡Pago registrado!\nPedido #${existingOrder.saleNumber}\nTotal: Gs. ${formatCurrency(total)}\nPagado: Gs. ${formatCurrency(paidAmount)}\n\n${updatedSale.status === "completed" ? "¡Pedido completado!" : `Restante: Gs. ${formatCurrency(total - paidAmount)}`}`);
    } else {
      // Nuevo pedido con pago inmediato
      const orderNumber = `${Date.now().toString().slice(-6)}`;
      const saleDate = new Date();
      
      const newSale: Sale = {
        id: sales.length + 1,
        saleNumber: orderNumber,
        date: saleDate,
        items: cartToSaleItems(cart),
        subtotal,
        discount: 0,
        deliveryCost: orderType === "delivery" ? deliveryCost : 0,
        deliveryDriverId: orderType === "delivery" ? selectedDriverId || undefined : undefined,
        deliveryDriverName: orderType === "delivery" && selectedDriverId ? deliveryDrivers.find(d => d.id === selectedDriverId)?.name : undefined,
        total,
        type: orderType,
        paymentMethod: payments[0]?.method || "other",
        payments: newPayments,
        customer: { ...customer },
        status: paidAmount >= total ? "completed" : "partial"
      };
      
      setSales([newSale, ...sales]);
      await printSale(newSale);
      
      alert(`¡Venta confirmada y cobrada!\nPedido #${orderNumber}\nTotal: Gs. ${formatCurrency(total)}`);
    }
    
    clearCart();
  };
  
  const printSale = async (sale: Sale) => {
    try {
      const printerConfig = localStorage.getItem("printerConfig");
      if (!printerConfig) {
        console.warn("No hay configuración de impresoras");
        return;
      }
      
      const config = JSON.parse(printerConfig);
      
      const printData = {
        orderNumber: sale.saleNumber,
        date: sale.date,
        orderType: sale.type,
        items: sale.items,
        subtotal: sale.subtotal,
        discountAmount: sale.discount,
        deliveryCost: sale.deliveryCost,
        deliveryDriverName: sale.deliveryDriverName,
        total: sale.total,
        payments: sale.payments,
        customer: sale.customer,
        // note: sale.note // Note removed from Sale interface
      };
      
      await fetch("http://localhost:3001/api/print/both", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: printData,
          kitchenPrinter: config.kitchenPrinter || 0,
          clientPrinter: config.clientPrinter || 0,
          copies: config.copies || 1
        })
      });
    } catch (error) {
      console.error("Error al imprimir:", error);
    }
  };
  
  const handleCancelSale = (saleId: number, reason: string) => {
    setSales(sales.map(sale => 
      sale.id === saleId 
        ? { ...sale, status: "cancelled" as const, cancelReason: reason }
        : sale
    ));
  };
  
  const handleReopenSale = (sale: Sale) => {
    handleSelectOrder(sale);
  };
  
  // Configuración de formato de impresión
  const [printFormatConfig, setPrintFormatConfig] = useState<PrintFormatConfig>({
    comandaTitleSize: 2,
    comandaProductSize: 1,
    comandaShowPrices: false,
    comandaCopies: 2,
    comandaCustomFields: [],
    ticketHeaderSize: 2,
    ticketProductSize: 1,
    ticketTotalSize: 2,
    ticketThankYouMessage: "¡Gracias por su compra!",
    ticketShowLogo: true,
    businessInfo: {
      name: "De la Gran Burger",
      address: "Av. Principal 123",
      phone: "(021) 123-4567",
      ruc: "80012345-6",
      additionalInfo: "Delivery: (0981) 234-567"
    }
  });

  // Efectos
  useEffect(() => {
    // Cargar configuración guardada
    const savedConfig = localStorage.getItem("printFormatConfig");
    if (savedConfig) {
      try {
        setPrintFormatConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Error loading print config", e);
      }
    }
  }, []);

  // Efectos
  useEffect(() => {
    // En producción, esto se cargaría desde localStorage o BD
    localStorage.setItem("printFormatConfig", JSON.stringify(printFormatConfig));
  }, [printFormatConfig]);

  const handleSavePrintFormat = (config: PrintFormatConfig) => {
    setPrintFormatConfig(config);
    localStorage.setItem("printFormatConfig", JSON.stringify(config));
    alert("Configuración de impresión guardada correctamente");
  };

  // Función para renderizar el contenido según la vista actual
  const renderContent = () => {
    switch (currentView) {
      case "products":
        return (
          <ProductsManager
            products={products}
            categories={categories}
            onProductsChange={setProducts}
            onCategoriesChange={setCategories}
          />
        );
      case "sales":
        return (
          <SalesHistory
            sales={sales}
            onCancelSale={handleCancelSale}
            onReopenSale={handleReopenSale}
          />
        );
      case "settings":
        return (
          <div className="settings-container">
            <div className="settings-tabs">
              <button
                className={`settings-tab ${settingsTab === "printers" ? "active" : ""}`}
                onClick={() => setSettingsTab("printers")}
              >
                Impresoras
              </button>
              <button
                className={`settings-tab ${settingsTab === "format" ? "active" : ""}`}
                onClick={() => setSettingsTab("format")}
              >
                Formato de Impresión
              </button>
            </div>
            
            {settingsTab === "printers" ? (
              <PrinterSettings />
            ) : (
              <PrintFormatSettings 
                config={printFormatConfig}
                onSave={handleSavePrintFormat}
              />
            )}
          </div>
        );
      case "drivers":
        return (
          <div style={{ padding: "2rem" }}>
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Gestión de Repartidores</h2>
              <button
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
                onClick={() => {
                  const name = prompt("Nombre del repartidor:");
                  if (!name) return;
                  const phone = prompt("Teléfono:");
                  if (!phone) return;
                  const newDriver: DeliveryDriver = {
                    id: deliveryDrivers.length + 1,
                    name,
                    phone,
                    active: true
                  };
                  setDeliveryDrivers([...deliveryDrivers, newDriver]);
                }}
              >
                <Bike size={20} />
                Agregar Repartidor
              </button>
            </div>
            
            <div style={{ display: "grid", gap: "1rem" }}>
              {deliveryDrivers.map(driver => (
                <div
                  key={driver.id}
                  style={{
                    background: "white",
                    border: "2px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    opacity: driver.active ? 1 : 0.5
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Bike size={32} color={driver.active ? "#3b82f6" : "#94a3b8"} />
                    <div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                        {driver.name}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
                        📱 {driver.phone}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      style={{
                        padding: "0.5rem 1rem",
                        background: driver.active ? "#fef3c7" : "#dcfce7",
                        color: driver.active ? "#92400e" : "#166534",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                      onClick={() => {
                        setDeliveryDrivers(deliveryDrivers.map(d =>
                          d.id === driver.id ? { ...d, active: !d.active } : d
                        ));
                      }}
                    >
                      {driver.active ? "Desactivar" : "Activar"}
                    </button>
                    
                    <button
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#dbeafe",
                        color: "#1e40af",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                      onClick={() => {
                        const name = prompt("Nuevo nombre:", driver.name);
                        if (!name) return;
                        const phone = prompt("Nuevo teléfono:", driver.phone);
                        if (!phone) return;
                        setDeliveryDrivers(deliveryDrivers.map(d =>
                          d.id === driver.id ? { ...d, name, phone } : d
                        ));
                      }}
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
              
              {deliveryDrivers.length === 0 && (
                <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                  <Bike size={64} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                  <p>No hay repartidores registrados</p>
                  <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                    Haz click en "Agregar Repartidor" para comenzar
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      case "inventory":
        return (
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
            <Warehouse size={64} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
            <h2>Módulo de Inventario</h2>
            <p>Próximamente disponible</p>
          </div>
        );
      case "expenses":
        return (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <TrendingUp size={48} style={{ color: "#94a3b8", margin: "2rem auto" }} />
            <h2 style={{ color: "#64748b", marginBottom: "0.5rem" }}>Módulo de Gastos</h2>
            <p>Próximamente disponible</p>
          </div>
        );
      case "reports":
        return (
          <Reports 
            sales={sales}
            products={products}
          />
        );
      case "informes":
        return (
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
            <TrendingUp size={64} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
            <h2>Informes</h2>
            <p>Próximamente disponible</p>
          </div>
        );
      case "settings":
        return (
          <div className="settings-container">
            <div className="settings-tabs">
              <button
                className={`settings-tab ${settingsTab === "printers" ? "active" : ""}`}
                onClick={() => setSettingsTab("printers")}
              >
                Impresoras
              </button>
              <button
                className={`settings-tab ${settingsTab === "format" ? "active" : ""}`}
                onClick={() => setSettingsTab("format")}
              >
                Formato de Impresión
              </button>
            </div>
            
            {settingsTab === "printers" ? (
              <PrinterSettings />
            ) : (
              <PrintFormatSettings 
                config={printFormatConfig}
                onSave={handleSavePrintFormat}
              />
            )}
          </div>
        );
      default:
        return renderPOS();
    }
  };
  
  const renderPOS = () => (
    <>
      {/* Panel de cliente y carrito */}
      <div className="pos-customer-panel">
        {/* Información del cliente */}
        <div className={`pos-customer-section ${isCustomerCollapsed ? "collapsed" : "expanded"}`}>
          <div className="pos-section-title" onClick={() => setIsCustomerCollapsed(!isCustomerCollapsed)}>
            <span>Información del Cliente</span>
            {isCustomerCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </div>
          <div className="pos-customer-form">
            <div className="pos-input-group">
              <label className="pos-input-label">Cliente</label>
              <input
                type="text"
                className="pos-input"
                placeholder="Nombre del cliente"
                value={customer.name}
                onChange={(e) => setCustomer({...customer, name: e.target.value})}
              />
            </div>
            <div className="pos-input-group">
              <label className="pos-input-label">Teléfono</label>
              <input
                type="text"
                className="pos-input"
                placeholder="Número de teléfono"
                value={customer.phone}
                onChange={(e) => setCustomer({...customer, phone: e.target.value})}
              />
            </div>
            <div className="pos-input-group">
              <label className="pos-input-label">Dirección</label>
              <input
                type="text"
                className="pos-input"
                placeholder="Dirección de entrega"
                value={customer.address}
                onChange={(e) => setCustomer({...customer, address: e.target.value})}
              />
            </div>
            <div className="pos-input-group">
              <label className="pos-input-label">RUC</label>
              <input
                type="text"
                className="pos-input"
                placeholder="RUC"
                value={customer.ruc || ""}
                onChange={(e) => setCustomer({...customer, ruc: e.target.value})}
              />
            </div>
            <div className="pos-input-group">
              <label className="pos-input-label">Razón Social</label>
              <input
                type="text"
                className="pos-input"
                placeholder="Razón social"
                value={customer.businessName || ""}
                onChange={(e) => setCustomer({...customer, businessName: e.target.value})}
              />
            </div>
            <div className="pos-checkbox-group">
              <input
                type="checkbox"
                id="exempt"
                checked={customer.isExempt || false}
                onChange={(e) => setCustomer({...customer, isExempt: e.target.checked})}
              />
              <label htmlFor="exempt" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Exento</label>
            </div>
          </div>
        </div>
        
        {/* Carrito */}
        <div className="pos-cart-section">
          <div className="pos-cart-header">
            Detalle del Pedido ({cart.length} {cart.length === 1 ? "item" : "items"})
            {currentOrderId && (
              <span style={{ marginLeft: "0.5rem", color: "#f59e0b", fontSize: "0.8rem" }}>
                (Editando Pedido #{sales.find(s => s.id === currentOrderId)?.saleNumber})
              </span>
            )}
          </div>
          
          <div className="pos-cart-items">
            {cart.length === 0 ? (
              <div className="pos-cart-empty">
                <ShoppingCart className="pos-cart-empty-icon" />
                <div>No hay productos en el carrito</div>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={`${item.product.id}-${index}`} className="pos-cart-item">
                  <div className="pos-cart-item-header">
                    <div className="pos-cart-item-name">{item.product.name}</div>
                    <button className="pos-cart-item-remove" onClick={() => removeFromCart(item.product.id, item.itemNote)}>
                      <X size={18} />
                    </button>
                  </div>
                  
                  {editingItemId === item.product.id ? (
                    <div className="pos-item-note-edit">
                      <input
                        type="text"
                        className="pos-input pos-item-note-input"
                        placeholder="Ej: sin cebolla, sin huevo..."
                        value={tempItemNote}
                        onChange={(e) => setTempItemNote(e.target.value)}
                        autoFocus
                      />
                      <div className="pos-item-note-actions">
                        <button className="pos-btn-icon pos-btn-success" onClick={() => saveItemNote(item.product.id, item.itemNote)}>
                          <Check size={16} />
                        </button>
                        <button className="pos-btn-icon pos-btn-cancel" onClick={cancelEditingItemNote}>
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {item.itemNote && (
                        <div className="pos-item-note-display">
                          ({item.itemNote})
                        </div>
                      )}
                      <div className="pos-cart-item-controls">
                        <div className="pos-quantity-control">
                          <button className="pos-quantity-btn" onClick={() => updateQuantity(item.product.id, item.itemNote, -1)}>−</button>
                          <div className="pos-quantity-display">{item.quantity}</div>
                          <button className="pos-quantity-btn" onClick={() => updateQuantity(item.product.id, item.itemNote, 1)}>+</button>
                        </div>
                        <button 
                          className="pos-btn-add-note" 
                          onClick={() => startEditingItemNote(item.product.id, item.itemNote)}
                          title="Agregar nota"
                        >
                          <Edit2 size={16} />
                          {item.itemNote ? "Editar" : "Nota"}
                        </button>
                        <div className="pos-cart-item-price">Gs. {formatCurrency(item.product.price * item.quantity)}</div>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Footer del carrito */}
          <div className="pos-cart-footer">
            <div className="pos-note-section">
              <div className="pos-input-group">
                <label className="pos-input-label">Nota General</label>
                <textarea
                  className="pos-input"
                  placeholder="Nota del pedido..."
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
            
            <div className="pos-order-type">
              <button
                className={`pos-order-type-btn ${orderType === "delivery" ? "active" : ""}`}
                onClick={() => setOrderType("delivery")}
              >
                Delivery
              </button>
              <button
                className={`pos-order-type-btn ${orderType === "pickup" ? "active" : ""}`}
                onClick={() => setOrderType("pickup")}
              >
                Para Retirar
              </button>
            </div>
            
            {/* Campos de Delivery */}
            {orderType === "delivery" && (
              <div className="pos-delivery-section">
                <div className="pos-input-group">
                  <label className="pos-input-label">Costo Delivery</label>
                  <input
                    type="number"
                    className="pos-input"
                    placeholder="0"
                    value={deliveryCost || ""}
                    onChange={(e) => setDeliveryCost(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="pos-input-group">
                  <label className="pos-input-label">Repartidor</label>
                  <select
                    className="pos-input"
                    value={selectedDriverId || ""}
                    onChange={(e) => setSelectedDriverId(Number(e.target.value) || null)}
                  >
                    <option value="">Seleccionar repartidor...</option>
                    {deliveryDrivers.filter(d => d.active).map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            <div className="pos-total-section">
              <div className="pos-total-row">
                <span className="pos-total-label">Subtotal:</span>
                <span className="pos-total-value">Gs. {formatCurrency(subtotal)}</span>
              </div>
              {orderType === "delivery" && deliveryCost > 0 && (
                <div className="pos-total-row">
                  <span className="pos-total-label">Delivery:</span>
                  <span className="pos-total-value">Gs. {formatCurrency(deliveryCost)}</span>
                </div>
              )}
              <div className="pos-total-row pos-total-final">
                <span className="pos-total-label">Total:</span>
                <span className="pos-total-value">Gs. {formatCurrency(total)}</span>
              </div>
            </div>
            
            <div className="pos-action-buttons">
              <div className="pos-action-buttons-row">
                <button className="pos-btn pos-btn-clear" onClick={clearCart} disabled={cart.length === 0}>
                  <Trash2 size={18} />
                  Vaciar
                </button>
                <button className="pos-btn pos-btn-print-comanda" onClick={handlePrintComanda} disabled={cart.length === 0}>
                  <Printer size={18} />
                  Impr. Comanda
                </button>
                <button className="pos-btn pos-btn-print" onClick={handlePrintOrder} disabled={cart.length === 0}>
                  <Printer size={18} />
                  Impr. Pedido
                </button>
                <button className="pos-btn pos-btn-confirm" onClick={handleConfirmOrder} disabled={cart.length === 0}>
                  <Clock size={18} />
                  Confirmar
                </button>
              </div>
              <div className="pos-action-buttons-row">
                <button className="pos-btn pos-btn-pay" onClick={handleInitiatePayment} disabled={cart.length === 0 && !currentOrderId}>
                  <DollarSign size={18} />
                  Cobrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Panel de productos */}
      <div className="pos-products-panel">
        <div className="pos-products-header">
          <div className="pos-search-bar">
            <Search className="pos-search-icon" />
            <input
              type="text"
              className="pos-search-input"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="pos-categories">
            {categoryNames.map(category => (
              <button
                key={category}
                className={`pos-category-btn ${selectedCategory === category ? "active" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div className="pos-products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="pos-product-card" onClick={() => addToCart(product)}>
              <div className="pos-product-name">{product.name}</div>
              <div className="pos-product-price">Gs. {formatCurrency(product.price)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón toggle para panel de pedidos */}
      <button 
        className={`pos-orders-toggle ${showOrdersPanel ? "open" : ""}`}
        onClick={() => setShowOrdersPanel(!showOrdersPanel)}
      >
        {ordersPanelTab === "pending" 
          ? `Pedidos Pendientes (${pendingOrders.length})`
          : `Historial (${allOrders.length})`
        }
      </button>

      {/* Panel lateral de pedidos */}
      <div className={`pos-orders-panel ${showOrdersPanel ? "open" : ""}`}>
        <div className="pos-orders-header">
          <div className="pos-orders-header-top">
            <div className="pos-orders-title">
              <Clock size={24} />
              {ordersPanelTab === "pending" ? "Pedidos Pendientes" : "Historial de Pedidos"}
            </div>
            <button className="pos-orders-close" onClick={() => setShowOrdersPanel(false)}>
              <X size={24} />
            </button>
          </div>
          
          {/* Pestañas */}
          <div className="pos-orders-tabs">
            <button 
              className={`pos-orders-tab ${ordersPanelTab === "pending" ? "active" : ""}`}
              onClick={() => setOrdersPanelTab("pending")}
            >
              Pendientes ({pendingOrders.length})
            </button>
            <button 
              className={`pos-orders-tab ${ordersPanelTab === "history" ? "active" : ""}`}
              onClick={() => setOrdersPanelTab("history")}
            >
              Historial ({allOrders.length})
            </button>
          </div>
          
          <div className="pos-orders-search">
            <Search className="pos-orders-search-icon" />
            <input
              type="text"
              className="pos-orders-search-input"
              placeholder="Buscar..."
              value={orderSearchTerm}
              onChange={(e) => setOrderSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="pos-orders-list">
          {filteredOrders.length === 0 ? (
            <div className="pos-orders-empty">
              <Clock className="pos-orders-empty-icon" />
              <div>
                {ordersPanelTab === "pending" 
                  ? "No hay pedidos pendientes" 
                  : "No hay pedidos en el historial"
                }
              </div>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div 
                key={order.id} 
                className={`pos-order-item ${currentOrderId === order.id ? "selected" : ""} ${order.status === "cancelled" ? "cancelled" : ""}`}
                onClick={() => handleSelectOrder(order)}
              >
                <div className="pos-order-item-header">
                  <div className="pos-order-item-number">
                    Pedido #{order.saleNumber}
                    {order.status === "completed" && <span className="pos-order-status completed">✓ Pagado</span>}
                    {order.status === "partial" && <span className="pos-order-status partial">⚠ Parcial</span>}
                    {order.status === "pending" && <span className="pos-order-status pending">⏱ Pendiente</span>}
                    {order.status === "cancelled" && <span className="pos-order-status cancelled">✗ Anulado</span>}
                  </div>
                  <div className="pos-order-item-total">Gs. {formatCurrency(order.total)}</div>
                </div>
                <div className="pos-order-item-customer">
                  {order.customer?.name || "CLIENTE GENERAL"}
                </div>
                {order.type === "delivery" && order.deliveryDriverName && (
                  <div className="pos-order-item-delivery">
                    🚴 {order.deliveryDriverName}
                  </div>
                )}
                {order.status === "completed" && order.payments && order.payments.length > 0 && (
                  <div className="pos-order-item-payment">
                    💳 {order.payments.map(p => p.method).join(", ")}
                  </div>
                )}
                {order.status === "cancelled" && order.cancelReason && (
                  <div className="pos-order-item-cancel-reason">
                    Motivo: {order.cancelReason}
                  </div>
                )}
                <div className="pos-order-item-date">
                  {formatDateTime(new Date(order.date))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Pagos */}
      {showPaymentModal && (
        <PaymentModal
          total={total}
          initialNote={note}
          existingPayments={currentPayments}
          onConfirm={handleConfirmPayment}
          onCancel={() => setShowPaymentModal(false)}
        />
      )}
    </>
  );

  return (
    <>
      <Head>
        <title>De la Gran Burger - POS</title>
      </Head>

      <div className={currentView === "pos" ? "pos-layout" : "pos-layout-two-column"}>
        {/* Sidebar */}
        <div className="pos-sidebar">
          <div className="pos-sidebar-header">
            <div className="pos-sidebar-logo">DG</div>
            <h1 className="pos-sidebar-title">De la Gran Burger</h1>
          </div>

          <nav className="pos-sidebar-nav">
            <button
              className={`pos-nav-item ${currentView === "pos" ? "active" : ""}`}
              onClick={() => setCurrentView("pos")}
            >
              <ShoppingCart className="pos-nav-icon" />
              <span>Punto de Venta</span>
            </button>

            <button
              className={`pos-nav-item ${currentView === "sales" ? "active" : ""}`}
              onClick={() => setCurrentView("sales")}
            >
              <FileText className="pos-nav-icon" />
              <span>Ventas</span>
            </button>

            <button
              className={`pos-nav-item ${currentView === "products" ? "active" : ""}`}
              onClick={() => setCurrentView("products")}
            >
              <Package className="pos-nav-icon" />
              <span>Productos y Servicios</span>
            </button>

            <button
              className={`pos-nav-item ${currentView === "inventory" ? "active" : ""}`}
              onClick={() => setCurrentView("inventory")}
            >
              <Warehouse className="pos-nav-icon" />
              <span>Inventario</span>
            </button>

            <button
              className={`pos-nav-item ${currentView === "drivers" ? "active" : ""}`}
              onClick={() => setCurrentView("drivers")}
            >
              <Bike className="pos-nav-icon" />
              <span>Repartidores</span>
            </button>

            <button
              className={`pos-nav-item ${currentView === "expenses" ? "active" : ""}`}
              onClick={() => setCurrentView("expenses")}
            >
              <TrendingUp className="pos-nav-icon" />
              <span>Gastos</span>
            </button>

            <button 
              className={`pos-nav-item ${currentView === "reports" ? "active" : ""}`}
              onClick={() => setCurrentView("reports")}
            >
              <TrendingUp className="pos-nav-icon" />
              <span>Reportes</span>
            </button>

            <button 
              className={`pos-nav-item ${currentView === "informes" ? "active" : ""}`}
              onClick={() => setCurrentView("informes")}
            >
              <TrendingUp className="pos-nav-icon" />
              <span>Informes</span>
            </button>

            <button 
              className={`pos-nav-item ${currentView === "settings" ? "active" : ""}`}
              onClick={() => setCurrentView("settings")}
            >
              <Settings size={20} />
              <span>Ajustes</span>
            </button>
          </nav>

          <div className="pos-sidebar-footer">
            <button className="pos-nav-item">
              <HelpCircle className="pos-nav-icon" />
              <span>Soporte</span>
            </button>
            <button className="pos-nav-item">
              <LogOut className="pos-nav-icon" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>

        {/* Main Content - cuando es POS, renderizar paneles directamente */}
        {currentView === "pos" ? renderPOS() : (
          <div className="pos-main">
            {renderContent()}
          </div>
        )}
      </div>
    </>
  );
}