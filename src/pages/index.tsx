import { useState, useMemo } from "react";
import Head from "next/head";
import { ShoppingCart, Package, Warehouse, TrendingUp, FileText, Settings, HelpCircle, LogOut, Search, Trash2, X, ChevronDown, ChevronUp, Printer, Edit2, Check, Clock, DollarSign } from "lucide-react";
import { ProductsManager } from "@/components/pos/ProductsManager";
import { SalesHistory } from "@/components/pos/SalesHistory";
import { PrinterSettings } from "@/components/pos/PrinterSettings";
import { PaymentModal } from "@/components/pos/PaymentModal";
import type { Product as ProductType, Category, Sale, CartItem as CartItemType, CustomerInfo, OrderType, Payment } from "@/types/pos";

// Helper function for consistent number formatting
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("es-PY");
};

export default function Home() {
  // Estado del sistema
  const [currentView, setCurrentView] = useState<"pos" | "sales" | "products" | "inventory" | "expenses" | "reports" | "settings">("pos");
  const [isCustomerCollapsed, setIsCustomerCollapsed] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [ordersPanelTab, setOrdersPanelTab] = useState<"pending" | "history">("pending");
  
  // Estado del carrito y pedido actual
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [note, setNote] = useState<string>("");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [tempItemNote, setTempItemNote] = useState<string>("");
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [orderSearchTerm, setOrderSearchTerm] = useState<string>("");
  
  // Estado de gestión de productos y categorías
  const [products, setProducts] = useState<ProductType[]>([
    { id: 1, name: "Carnívora", price: 22000, category: "Hamburguesas", active: true },
    { id: 2, name: "Chesse", price: 12000, category: "Hamburguesas", active: true },
    { id: 3, name: "Chilli", price: 17000, category: "Hamburguesas", active: true },
    { id: 4, name: "Chilli Doble", price: 22000, category: "Hamburguesas", active: true },
    { id: 5, name: "Chilli Triple", price: 27000, category: "Hamburguesas", active: true },
    { id: 6, name: "Clasica", price: 15000, category: "Hamburguesas", active: true },
    { id: 7, name: "Doble", price: 20000, category: "Hamburguesas", active: true },
    { id: 8, name: "Doble Chesse", price: 18000, category: "Hamburguesas", active: true },
    { id: 9, name: "Triple", price: 25000, category: "Hamburguesas", active: true },
    { id: 10, name: "Papas Fritas", price: 8000, category: "Acompañamientos", active: true },
    { id: 11, name: "Nuggets", price: 10000, category: "Acompañamientos", active: true },
    { id: 12, name: "Coca Cola", price: 5000, category: "Bebidas", active: true },
    { id: 13, name: "Agua", price: 3000, category: "Bebidas", active: true },
  ]);
  
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Hamburguesas", active: true, order: 1 },
    { id: 2, name: "Acompañamientos", active: true, order: 2 },
    { id: 3, name: "Bebidas", active: true, order: 3 },
  ]);
  
  const [sales, setSales] = useState<Sale[]>([]);
  
  const categoryNames = ["Todos", ...categories.filter(c => c.active).sort((a, b) => a.order - b.order).map(c => c.name)];
  
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
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.customer.name.toLowerCase().includes(searchLower) ||
      order.customer.phone.toLowerCase().includes(searchLower)
    );
  }, [currentTabOrders, orderSearchTerm]);
  
  // Productos filtrados
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
      return matchesSearch && matchesCategory && product.active;
    });
  }, [searchTerm, selectedCategory, products]);
  
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
    setEditingItemId(null);
    setTempItemNote("");
    setCurrentOrderId(null);
    setCustomer({
      name: "",
      phone: "",
      address: "",
      ruc: "",
      businessName: "",
      isExempt: false
    });
  };

  // Función para imprimir pedido (window.print)
  const handlePrintOrder = () => {
    if (cart.length === 0) {
      alert("No hay productos en el carrito para imprimir");
      return;
    }

    const orderNumber = currentOrderId ? 
      sales.find(s => s.id === currentOrderId)?.orderNumber || `${Date.now().toString().slice(-6)}` :
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
          }
          
          .item .cant {
            width: 40px;
            text-align: center;
            font-weight: bold;
          }
          
          .item .desc {
            flex: 1;
          }
          
          .item-note {
            margin-left: 40px;
            font-size: 11px;
            font-style: italic;
            color: #333;
            margin-top: 2px;
            margin-bottom: 5px;
          }
          
          .separator {
            border-top: 2px dashed #000;
            margin: 15px 0;
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
            <span class="label">Nombre:</span>
            <span class="value">${customer.name || 'Cliente General'}</span>
          </div>
          ${customer.phone ? `
          <div class="row">
            <span class="label">Teléfono:</span>
            <span class="value">${customer.phone}</span>
          </div>
          ` : ''}
          ${customer.address ? `
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
          <div class="row">
            <span class="label">Tipo:</span>
            <span class="value">${orderType === 'delivery' ? 'Delivery' : 'Para Retirar'}</span>
          </div>
          <div class="row">
            <span class="label">Nº Pedido:</span>
            <span class="value">${orderNumber}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="items-header">
            <div class="cant">CANT</div>
            <div class="desc">DESCRIPCION</div>
          </div>
          ${cart.map(item => `
            <div class="item">
              <div class="cant">${item.quantity}</div>
              <div class="desc">${item.product.name}</div>
            </div>
            ${item.itemNote ? `<div class="item-note">(${item.itemNote})</div>` : ''}
          `).join('')}
        </div>
        
        <div class="separator"></div>
        
        ${note ? `
        <div class="note-section">
          <div class="note-title">NOTA:</div>
          <div>${note}</div>
        </div>
        ` : ''}
        
        <div class="footer">
          ${new Date().toLocaleString('es-PY')}
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
  const total = subtotal;
  
  // Función para confirmar pedido (sin cobrar)
  const handleConfirmOrder = () => {
    if (cart.length === 0) {
      alert("No hay productos en el carrito");
      return;
    }
    
    const orderNumber = `${Date.now().toString().slice(-6)}`;
    const saleDate = new Date();
    
    const newSale: Sale = {
      id: sales.length + 1,
      orderNumber,
      date: saleDate,
      items: [...cart],
      subtotal,
      discount: 0,
      total,
      orderType,
      payments: [],
      paidAmount: 0,
      remainingAmount: total,
      customer: { ...customer },
      note: note,
      status: "pending"
    };
    
    setSales([newSale, ...sales]);
    
    alert(`¡Pedido confirmado!\nNº ${orderNumber}\nTotal: Gs. ${formatCurrency(total)}\n\nEstado: Pendiente de Pago`);
    clearCart();
  };
  
  // Función para seleccionar pedido del panel lateral
  const handleSelectOrder = (sale: Sale) => {
    // Restaurar carrito
    setCart(sale.items);
    // Restaurar cliente
    setCustomer(sale.customer);
    // Restaurar tipo de orden
    setOrderType(sale.orderType);
    // Restaurar nota
    setNote(sale.note);
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
    setShowPaymentModal(true);
  };
  
  const handleConfirmPayment = async (payments: Payment[], finalNote: string) => {
    setShowPaymentModal(false);
    
    const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    
    if (currentOrderId) {
      // Actualizando pedido existente
      const existingOrder = sales.find(s => s.id === currentOrderId);
      if (!existingOrder) return;
      
      const updatedSale: Sale = {
        ...existingOrder,
        items: [...cart],
        subtotal,
        total,
        payments: payments,
        paidAmount: paidAmount,
        remainingAmount: total - paidAmount,
        note: finalNote || note,
        status: paidAmount >= total ? "completed" : "partial"
      };
      
      setSales(sales.map(s => s.id === currentOrderId ? updatedSale : s));
      await printSale(updatedSale);
      
      alert(`¡Pago registrado!\nPedido #${existingOrder.orderNumber}\nTotal: Gs. ${formatCurrency(total)}\nPagado: Gs. ${formatCurrency(paidAmount)}`);
    } else {
      // Nuevo pedido con pago inmediato
      const orderNumber = `${Date.now().toString().slice(-6)}`;
      const saleDate = new Date();
      
      const newSale: Sale = {
        id: sales.length + 1,
        orderNumber,
        date: saleDate,
        items: [...cart],
        subtotal,
        discount: 0,
        total,
        orderType,
        payments: payments,
        paidAmount: paidAmount,
        remainingAmount: total - paidAmount,
        customer: { ...customer },
        note: finalNote || note,
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
        orderNumber: sale.orderNumber,
        date: sale.date,
        orderType: sale.orderType,
        items: sale.items,
        subtotal: sale.subtotal,
        discountAmount: sale.discount,
        total: sale.total,
        payments: sale.payments,
        customer: sale.customer,
        note: sale.note
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
  
  // Render del contenido según la vista actual
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
        return <PrinterSettings />;
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
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
            <FileText size={64} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
            <h2>Módulo de Gastos</h2>
            <p>Próximamente disponible</p>
          </div>
        );
      case "reports":
        return (
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
            <TrendingUp size={64} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
            <h2>Módulo de Informes</h2>
            <p>Próximamente disponible</p>
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
                value={customer.ruc}
                onChange={(e) => setCustomer({...customer, ruc: e.target.value})}
              />
            </div>
            <div className="pos-input-group">
              <label className="pos-input-label">Razón Social</label>
              <input
                type="text"
                className="pos-input"
                placeholder="Razón social"
                value={customer.businessName}
                onChange={(e) => setCustomer({...customer, businessName: e.target.value})}
              />
            </div>
            <div className="pos-checkbox-group">
              <input
                type="checkbox"
                id="exempt"
                checked={customer.isExempt}
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
                (Editando Pedido #{sales.find(s => s.id === currentOrderId)?.orderNumber})
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
            
            <div className="pos-total-section">
              <div className="pos-total-row pos-total-final">
                <span className="pos-total-label">Total:</span>
                <span className="pos-total-value">Gs. {formatCurrency(total)}</span>
              </div>
            </div>
            
            <div className="pos-action-buttons">
              <button className="pos-btn pos-btn-clear" onClick={clearCart} disabled={cart.length === 0}>
                <Trash2 size={18} />
                Vaciar
              </button>
              <button className="pos-btn pos-btn-print" onClick={handlePrintOrder} disabled={cart.length === 0}>
                <Printer size={18} />
                Imprimir
              </button>
              <button className="pos-btn pos-btn-confirm" onClick={handleConfirmOrder} disabled={cart.length === 0}>
                <Clock size={18} />
                Confirmar Pedido
              </button>
              <button className="pos-btn pos-btn-pay" onClick={handleInitiatePayment} disabled={cart.length === 0 && !currentOrderId}>
                <DollarSign size={18} />
                Cobrar
              </button>
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
                    Pedido #{order.orderNumber}
                    {order.status === "completed" && <span className="pos-order-status completed">✓ Pagado</span>}
                    {order.status === "partial" && <span className="pos-order-status partial">⚠ Parcial</span>}
                    {order.status === "pending" && <span className="pos-order-status pending">⏱ Pendiente</span>}
                    {order.status === "cancelled" && <span className="pos-order-status cancelled">✗ Anulado</span>}
                  </div>
                  <div className="pos-order-item-total">Gs. {formatCurrency(order.total)}</div>
                </div>
                <div className="pos-order-item-customer">
                  {order.customer.name || "CLIENTE GENERAL"}
                </div>
                {order.status === "completed" && order.payments.length > 0 && (
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
                  {new Date(order.date).toLocaleString("es-PY", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
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
          onConfirm={handleConfirmPayment}
          onCancel={() => setShowPaymentModal(false)}
        />
      )}
    </>
  );
  
  return (
    <>
      <Head>
        <title>De la Gran Burger - Sistema POS</title>
        <meta name="description" content="Sistema de punto de venta para De la Gran Burger" />
      </Head>
      
      <div className="pos-layout">
        {/* Sidebar navegación */}
        <div className="pos-sidebar">
          <div className="pos-sidebar-header">
            <div className="pos-sidebar-logo">DB</div>
            <div className="pos-sidebar-title">De la Gran Burger</div>
          </div>
          
          <nav className="pos-sidebar-nav">
            <a href="#" className={`pos-nav-item ${currentView === "pos" ? "active" : ""}`} onClick={() => setCurrentView("pos")}>
              <ShoppingCart className="pos-nav-icon" />
              <span>Punto de Venta</span>
            </a>
            <a href="#" className={`pos-nav-item ${currentView === "sales" ? "active" : ""}`} onClick={() => setCurrentView("sales")}>
              <TrendingUp className="pos-nav-icon" />
              <span>Ventas</span>
            </a>
            <a href="#" className={`pos-nav-item ${currentView === "products" ? "active" : ""}`} onClick={() => setCurrentView("products")}>
              <Package className="pos-nav-icon" />
              <span>Productos y Servicios</span>
            </a>
            <a href="#" className={`pos-nav-item ${currentView === "inventory" ? "active" : ""}`} onClick={() => setCurrentView("inventory")}>
              <Warehouse className="pos-nav-icon" />
              <span>Inventario</span>
            </a>
            <a href="#" className={`pos-nav-item ${currentView === "expenses" ? "active" : ""}`} onClick={() => setCurrentView("expenses")}>
              <FileText className="pos-nav-icon" />
              <span>Gastos</span>
            </a>
            <a href="#" className={`pos-nav-item ${currentView === "reports" ? "active" : ""}`} onClick={() => setCurrentView("reports")}>
              <FileText className="pos-nav-icon" />
              <span>Informes</span>
            </a>
            <a href="#" className={`pos-nav-item ${currentView === "settings" ? "active" : ""}`} onClick={() => setCurrentView("settings")}>
              <Settings className="pos-nav-icon" />
              <span>Ajustes</span>
            </a>
            <a href="#" className="pos-nav-item">
              <HelpCircle className="pos-nav-icon" />
              <span>Soporte</span>
            </a>
          </nav>
          
          <div className="pos-sidebar-footer">
            <a href="#" className="pos-nav-item">
              <LogOut className="pos-nav-icon" />
              <span>Cerrar Sesión</span>
            </a>
          </div>
        </div>
        
        {/* Contenido principal */}
        {currentView === "pos" ? renderPOS() : (
          <div style={{ gridColumn: "2 / -1", overflow: "auto" }}>
            {renderContent()}
          </div>
        )}
      </div>
    </>
  );
}