import { useState, useMemo } from "react";
import Head from "next/head";
import { ShoppingCart, Package, BarChart3, Settings, LogOut, X, User as UserIcon, Trash2, Plus, Minus, ShoppingBag, TrendingUp, DollarSign, Users, Clock, Search, Printer, Check, Edit, Send, Eye, FileText } from "lucide-react";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { SalesHistory } from "@/components/pos/SalesHistory";
import { ProductsManager } from "@/components/pos/ProductsManager";
import { Inventory } from "@/components/pos/Inventory";
import { Reports } from "@/components/pos/Reports";
import { PrinterSettings } from "@/components/pos/PrinterSettings";
import { PrintFormatSettings } from "@/components/pos/PrintFormatSettings";
import { SEO } from "@/components/SEO";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product, CartItem, Sale, Category, PaymentMethod, DiscountType, OrderType, CustomerInfo, User, PrintFormatConfig, Payment } from "@/types/pos";

// Datos de prueba iniciales
const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Hamburguesa Clásica", price: 25000, categoryId: 2, category: "Hamburguesas", active: true, stock: 50 },
  { id: 2, name: "Hamburguesa Doble", price: 35000, categoryId: 2, category: "Hamburguesas", active: true, stock: 30 },
  { id: 3, name: "Papas Fritas", price: 15000, categoryId: 3, category: "Acompañamientos", active: true, stock: 100 },
  { id: 4, name: "Coca Cola 500ml", price: 8000, categoryId: 4, category: "Bebidas", active: true, stock: 200 },
  { id: 5, name: "Agua Mineral", price: 5000, categoryId: 4, category: "Bebidas", active: true, stock: 150 },
  { id: 6, name: "Lomito Árabe", price: 28000, categoryId: 5, category: "Lomitos", active: true, stock: 25 },
  { id: 7, name: "Pizza Mozzarella", price: 40000, categoryId: 6, category: "Pizzas", active: true, stock: 15 },
  { id: 8, name: "Nuggets de Pollo", price: 18000, categoryId: 3, category: "Acompañamientos", active: true, stock: 60 },
];

const CATEGORIES = [
  { id: 1, name: "Todos", icon: "🍔", active: true },
  { id: 2, name: "Hamburguesas", icon: "🍔", active: true },
  { id: 3, name: "Acompañamientos", icon: "🍟", active: true },
  { id: 4, name: "Bebidas", icon: "🥤", active: true },
  { id: 5, name: "Lomitos", icon: "🌯", active: true },
  { id: 6, name: "Pizzas", icon: "🍕", active: true },
];

export default function POS() {
  // Estado para la vista actual
  const [currentView, setCurrentView] = useState<
    | "pos"
    | "sales"
    | "products"
    | "inventory"
    | "informes"
    | "settings"
  >("pos");

  // Estados del POS
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [displayedSalesCount, setDisplayedSalesCount] = useState(10);

  // Estado del cliente
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    ruc: "",
    businessName: "",
    isExempt: false,
    exempt: false
  });

  // Estado del tipo de orden
  const [orderType, setOrderType] = useState<OrderType>("delivery");

  // Estado de descuento
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  const [discountValue, setDiscountValue] = useState(0);

  // Estado de nota
  const [orderNote, setOrderNote] = useState("");

  // Usuario actual
  const [currentUser, setCurrentUser] = useState<User>({
    id: 1,
    username: "cajero1",
    role: "cashier",
    name: "Juan Pérez",
    active: true
  });

  // Estado para configuración de impresión
  const [printFormatConfig, setPrintFormatConfig] = useState<PrintFormatConfig>({
    comandaTitleSize: 16,
    comandaProductSize: 12,
    comandaShowPrices: false,
    comandaCopies: 1,
    comandaCustomFields: [],
    ticketHeaderSize: 14,
    ticketProductSize: 12,
    ticketTotalSize: 14,
    ticketThankYouMessage: "¡Gracias por su compra!",
    ticketShowLogo: true,
    businessInfo: {
      name: "De la Gran Burger",
      address: "Av. Principal 123, Asunción",
      phone: "021-1234567",
      ruc: "80012345-6",
      additionalInfo: ""
    }
  });

  // Cálculos del carrito
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountType === "percentage") {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  }, [subtotal, discountType, discountValue]);

  const cartTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
      const isActive = product.active;
      return matchesSearch && matchesCategory && isActive;
    });
  }, [products, searchTerm, selectedCategory]);

  // Filtrar historial de ventas
  const filteredSales = useMemo(() => {
    return sales
      .filter((sale) => {
        const matchesSearch = 
          sale.saleNumber.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
          sale.customer?.name?.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
          "";
        return matchesSearch;
      })
      .slice(0, displayedSalesCount);
  }, [sales, historySearchTerm, displayedSalesCount]);

  // Agregar al carrito
  const addToCart = (product: Product) => {
    if (product.stock !== undefined && product.stock <= 0) {
      alert(`❌ "${product.name}" está agotado. Stock: 0 unidades`);
      return;
    }

    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      if (product.stock !== undefined && existingItem.quantity >= product.stock) {
        alert(`❌ Stock insuficiente. Solo quedan ${product.stock} unidades de "${product.name}"`);
        return;
      }
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  // Actualizar cantidad
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.product.id !== productId));
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product?.stock !== undefined && newQuantity > product.stock) {
      alert(`❌ Stock insuficiente. Solo quedan ${product.stock} unidades`);
      return;
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Eliminar del carrito
  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  // Vaciar carrito
  const clearCart = () => {
    if (cart.length === 0) return;
    
    if (confirm("¿Estás seguro de que deseas vaciar el carrito?")) {
      setCart([]);
      setCustomerInfo({
        name: "",
        phone: "",
        address: "",
        ruc: "",
        businessName: "",
        isExempt: false,
        exempt: false
      });
      setOrderNote("");
      setDiscountValue(0);
    }
  };

  // Confirmar pago y generar venta
  const handleConfirmPayment = (payments: Payment[], note: string) => {
    if (cart.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    const saleNumber = sales.length + 1;

    // Descontar stock
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.product.id === product.id);
      if (cartItem && product.stock !== undefined) {
        return {
          ...product,
          stock: Math.max(0, product.stock - cartItem.quantity)
        };
      }
      return product;
    });

    const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    const newSale: Sale = {
      id: saleNumber,
      saleNumber: `#${saleNumber.toString().padStart(4, "0")}`,
      date: new Date(),
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      subtotal,
      discount: discountAmount,
      total: cartTotal,
      customer: customerInfo,
      type: orderType,
      payments,
      paymentMethod: payments.length > 0 ? payments[0].method : 'mixed',
      note: note || orderNote,
      user: currentUser.name,
      status: "completed",
      amountPaid: amountPaid,
      balance: Math.max(0, cartTotal - amountPaid)
    };

    setProducts(updatedProducts);
    setSales([newSale, ...sales]);
    setCart([]);
    setCustomerInfo({
      name: "",
      phone: "",
      address: "",
      ruc: "",
      businessName: "",
      isExempt: false,
      exempt: false
    });
    setOrderNote("");
    setDiscountValue(0);
    setShowPaymentModal(false);

    alert(`✅ Venta ${newSale.saleNumber} confirmada exitosamente\n\n🔄 Stock actualizado automáticamente`);
  };

  const handleCancelSale = (saleId: number, reason: string) => {
    if (confirm("¿Estás seguro de que deseas anular esta venta?")) {
      setSales(sales.map(s => 
        s.id === saleId 
          ? { ...s, status: "cancelled" as const, cancelReason: reason } 
          : s
      ));
    }
  };

  const handleSaveProduct = (product: Product) => {
    if (product.id) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      const newProduct = { ...product, id: products.length + 1 };
      setProducts([...products, newProduct]);
    }
  };

  const handleLoadSale = (sale: Sale) => {
    // Cargar venta en el carrito
    const cartItems: CartItem[] = sale.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null;
      return {
        product,
        quantity: item.quantity
      };
    }).filter(Boolean) as CartItem[];

    setCart(cartItems);
    setCustomerInfo(sale.customer || {
      name: "",
      phone: "",
      address: "",
      ruc: "",
      businessName: "",
      isExempt: false,
      exempt: false
    });
    setOrderType(sale.type);
    setOrderNote(sale.note || "");
    
    // Scroll al top para ver el carrito
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (currentView) {
      case "products":
        return <ProductsManager 
          products={products} 
          categories={CATEGORIES}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={(id) => {
            if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
              setProducts(products.filter(p => p.id !== id));
            }
          }}
        />;
      case "inventory":
        return <Inventory products={products} onUpdateProduct={handleSaveProduct} />;
      case "sales":
        return <SalesHistory 
          sales={sales} 
          onCancelSale={handleCancelSale} 
        />;
      case "informes":
        return <Reports sales={sales} products={products} />;
      case "settings":
        return (
          <div className="settings-container">
            <h2>⚙️ Ajustes</h2>
            <div className="settings-sections">
              <PrinterSettings />
              <PrintFormatSettings 
                config={printFormatConfig}
                onSave={setPrintFormatConfig}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const navigationItems = [
    { id: "pos", label: "Punto de Venta", icon: "🛒" },
    { id: "sales", label: "Ventas", icon: "📋" },
    { id: "products", label: "Productos y Servicios", icon: "🎯" },
    { id: "inventory", label: "Inventario", icon: "📦" },
    { id: "informes", label: "Informes", icon: "📊" },
    { id: "settings", label: "Ajustes", icon: "⚙️" },
  ];

  // Render POS principal
  const renderPOS = () => (
    <>
      {/* Panel Izquierdo: Carrito */}
      <div className="pos-cart-panel">
        {/* Header del carrito */}
        <div className="cart-panel-header">
          <ShoppingCart className="w-5 h-5" />
          <span>CARRITO</span>
        </div>

        {/* Información del cliente compacta */}
        <div className="customer-compact">
          <div className="customer-compact-field">
            <label className="customer-compact-label">CLIENTE</label>
            <input
              type="text"
              className="customer-compact-input"
              placeholder="Nombre del cliente"
              value={customerInfo.name}
              onChange={(e) =>
                setCustomerInfo({ ...customerInfo, name: e.target.value })
              }
            />
          </div>

          <div className="customer-compact-field">
            <label className="customer-compact-label">TELÉFONO</label>
            <input
              type="tel"
              className="customer-compact-input"
              placeholder="Teléfono"
              value={customerInfo.phone}
              onChange={(e) =>
                setCustomerInfo({ ...customerInfo, phone: e.target.value })
              }
            />
          </div>
        </div>

        {/* Items del carrito */}
        <div className="cart-items-section">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingCart className="cart-empty-icon" />
              <p>No hay productos en el carrito</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="cart-item-card">
                <div className="cart-item-header">
                  <span className="cart-item-name">{item.product.name}</span>
                  <span className="cart-item-price">{formatCurrency(item.product.price * item.quantity)}</span>
                </div>
                <div className="cart-item-controls">
                  <button 
                    className="cart-item-qty-btn" 
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="cart-item-quantity">{item.quantity}</span>
                  <button 
                    className="cart-item-qty-btn" 
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button 
                    className="cart-item-remove" 
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer del carrito */}
        <div className="cart-footer">
          {/* Botones tipo pedido */}
          <div className="order-type-buttons">
            <button
              className={`order-type-btn ${orderType === "delivery" ? "active" : ""}`}
              onClick={() => setOrderType("delivery")}
            >
              Delivery
            </button>
            <button
              className={`order-type-btn ${orderType === "pickup" ? "active" : ""}`}
              onClick={() => setOrderType("pickup")}
            >
              Para Retirar
            </button>
          </div>

          {/* Total */}
          <div className="cart-total-display">
            <div className="cart-total-label">TOTAL</div>
            <div className="cart-total-amount">{formatCurrency(cartTotal)}</div>
          </div>

          {/* Botones de acción */}
          <div className="cart-action-buttons">
            <button
              className="cart-action-btn btn-edit-sale"
              disabled={cart.length === 0}
              onClick={() => {
                // TODO: Implementar edición de venta
                alert("Función de edición en desarrollo");
              }}
            >
              <Edit className="w-4 h-4" />
              Editar Venta
            </button>

            <button
              className="cart-action-btn btn-receive-payment"
              disabled={cart.length === 0}
              onClick={() => setShowPaymentModal(true)}
            >
              <DollarSign className="w-4 h-4" />
              Recibir Pago
            </button>

            <button
              className="cart-action-btn btn-print-order"
              disabled={cart.length === 0}
              onClick={() => {
                // TODO: Implementar impresión de comanda
                alert("Función de impresión de comanda en desarrollo");
              }}
            >
              <Printer className="w-4 h-4" />
              Imprimir Pedido
            </button>

            <button
              className="cart-action-btn btn-print-invoice"
              disabled={cart.length === 0}
              onClick={() => {
                // TODO: Implementar impresión de factura
                alert("Función de impresión de factura en desarrollo");
              }}
            >
              <FileText className="w-4 h-4" />
              Imprimir Factura
            </button>

            <button
              className="cart-action-btn btn-send-whatsapp"
              disabled={cart.length === 0}
              onClick={() => {
                // TODO: Implementar envío por WhatsApp
                alert("Función de WhatsApp en desarrollo");
              }}
            >
              <Send className="w-4 h-4" />
              Enviar por WhatsApp
            </button>

            <button
              className="cart-action-btn btn-preview"
              disabled={cart.length === 0}
              onClick={() => {
                // TODO: Implementar vista previa
                alert("Función de vista previa en desarrollo");
              }}
            >
              <Eye className="w-4 h-4" />
              Vista Previa
            </button>

            <button
              className="cart-action-btn btn-delete-sale"
              disabled={cart.length === 0}
              onClick={clearCart}
            >
              <Trash2 className="w-4 h-4" />
              Eliminar Venta
            </button>
          </div>
        </div>
      </div>

      {/* Panel Central: Productos */}
      <div className="pos-products-panel">
        {/* Header de productos */}
        <div className="products-panel-header">
          {/* Buscador */}
          <div className="products-search-bar">
            <Search className="products-search-icon" />
            <input
              type="text"
              className="products-search-input"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tabs de categorías */}
          <div className="products-tabs">
            <button
              className={`products-tab ${selectedCategory === "Todos" ? "active" : ""}`}
              onClick={() => setSelectedCategory("Todos")}
            >
              Productos
            </button>
            {CATEGORIES.slice(1).map((cat) => (
              <button
                key={cat.id}
                className={`products-tab ${selectedCategory === cat.name ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grilla de productos */}
        <div className="products-grid-container">
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => addToCart(product)}
              >
                <div className="product-card-name">{product.name}</div>
                <div className="product-card-price">{formatCurrency(product.price)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel Derecho: Historial */}
      <div className="pos-history-panel">
        {/* Header del historial */}
        <div className="history-panel-header">
          <h3 className="history-title">
            <Clock className="w-4 h-4" />
            Todos los Registros
          </h3>
          <div className="history-search">
            <Search className="history-search-icon" />
            <input
              type="text"
              className="history-search-input"
              placeholder="Buscar..."
              value={historySearchTerm}
              onChange={(e) => setHistorySearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de ventas */}
        <div className="history-list">
          {filteredSales.length === 0 ? (
            <div className="history-empty">
              <p>No hay ventas registradas</p>
            </div>
          ) : (
            filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="history-item"
                onClick={() => handleLoadSale(sale)}
              >
                <div className="history-item-header">
                  <span className="history-item-number">Pedido {sale.saleNumber}</span>
                  <span className="history-item-total">{formatCurrency(sale.total)}</span>
                </div>
                <div className="history-item-info">
                  {sale.customer?.name || "Cliente no especificado"}
                </div>
                <div className="history-item-date">
                  {new Date(sale.date).toLocaleString('es-PY', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botón cargar más */}
        {sales.length > displayedSalesCount && (
          <div className="history-load-more">
            <button
              className="btn-load-more"
              onClick={() => setDisplayedSalesCount(prev => prev + 10)}
            >
              Cargar Más
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="pos-layout">
      <Head>
        <title>De la Gran Burger - POS</title>
        <SEO
          title="De la Gran Burger - Sistema POS"
          description="Sistema de punto de venta para hamburguesería"
        />
      </Head>

      {/* Sidebar de navegación principal */}
      <div className="pos-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">DG</div>
          <h1 className="sidebar-title">De la Gran Burger</h1>
        </div>
        
        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${currentView === item.id ? "active" : ""}`}
              onClick={() => setCurrentView(item.id as any)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={() => alert("Cerrar sesión")}>
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {currentView === "pos" ? (
        renderPOS()
      ) : (
        <div className="pos-content-area">
          {renderContent()}
        </div>
      )}

      {showPaymentModal && (
        <PaymentModal
          total={cartTotal}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handleConfirmPayment}
        />
      )}
    </div>
  );
}