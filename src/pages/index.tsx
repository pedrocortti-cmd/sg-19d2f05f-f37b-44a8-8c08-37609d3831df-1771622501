import { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import { ShoppingCart, Package, Warehouse, TrendingUp, FileText, Settings, HelpCircle, LogOut, Search, Trash2, X, ChevronDown, ChevronUp, Printer, Edit2, Check, Clock, DollarSign, Bike } from "lucide-react";
import { ProductsManager } from "@/components/pos/ProductsManager";
import { SalesHistory } from "@/components/pos/SalesHistory";
import { PrinterSettings } from "@/components/pos/PrinterSettings";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { PrintFormatSettings } from "@/components/pos/PrintFormatSettings";
import { Reports } from "@/components/pos/Reports";
import { Inventory } from "@/components/pos/Inventory";
import "@/styles/globals.css";
import "@/styles/pos.css";
import "@/styles/reports.css";
import "@/styles/inventory.css";

// Importar tipos y datos mock
import { 
  Product, 
  Category, 
  CartItem, 
  Sale, 
  CustomerInfo, 
  OrderType,
  User,
  Payment,
  PrintFormatConfig
} from "@/types/pos";
import { Plus, Minus } from "lucide-react";

// Datos de prueba iniciales
const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Hamburguesa Clásica", price: 25000, categoryId: 1, category: "Hamburguesas", active: true, stock: 50 },
  { id: 2, name: "Hamburguesa Doble", price: 35000, categoryId: 1, category: "Hamburguesas", active: true, stock: 30 },
  { id: 3, name: "Papas Fritas", price: 15000, categoryId: 2, category: "Acompañamientos", active: true, stock: 100 },
  { id: 4, name: "Coca Cola 500ml", price: 8000, categoryId: 3, category: "Bebidas", active: true, stock: 24 },
  { id: 5, name: "Agua Mineral", price: 5000, categoryId: 3, category: "Bebidas", active: true, stock: 48 },
  { id: 6, name: "Lomito Árabe", price: 28000, categoryId: 4, category: "Lomitos", active: true, stock: 15 },
  { id: 7, name: "Pizza Mozzarella", price: 40000, categoryId: 5, category: "Pizzas", active: true, stock: 10 },
  { id: 8, name: "Nuggets de Pollo", price: 18000, categoryId: 2, category: "Acompañamientos", active: true, stock: 40 },
];

const CATEGORIES: Category[] = [
  { id: 0, name: "Todos", active: true },
  { id: 1, name: "Hamburguesas", active: true },
  { id: 2, name: "Acompañamientos", active: true },
  { id: 3, name: "Bebidas", active: true },
  { id: 4, name: "Lomitos", active: true },
  { id: 5, name: "Pizzas", active: true },
];

export default function POS() {
  // Estados principales
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  
  // Estados de UI
  const [currentCategory, setCurrentCategory] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentView, setCurrentView] = useState<
    | "pos"
    | "sales"
    | "products"
    | "inventory"
    | "informes"
    | "settings"
  >("pos");

  // Estado del pedido actual
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    ruc: "",
    businessName: "",
    exempt: false
  });
  const [orderNote, setOrderNote] = useState("");
  const [cartDiscount, setCartDiscount] = useState(0);

  // Usuario actual (mock)
  const [currentUser, setCurrentUser] = useState<User>({
    id: 1,
    username: "cajero1",
    name: "Juan Pérez",
    role: "cashier",
    active: true
  });

  const [printConfig, setPrintConfig] = useState<PrintFormatConfig>({
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
      additionalInfo: ""
    }
  });

  // Cálculos del carrito
  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - cartDiscount);
  }, [cartSubtotal, cartDiscount]);

  // Filtrado de productos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = currentCategory === 0 || product.categoryId === currentCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch && product.active;
    });
  }, [products, currentCategory, searchTerm]);

  // Manejadores del carrito
  const addToCart = (product: Product) => {
    if ((product.stock || 0) <= 0) {
      alert("¡Producto sin stock!");
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= (product.stock || 0)) {
          alert("No hay suficiente stock disponible");
          return prev;
        }
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          
          // Verificar stock
          if (delta > 0 && newQuantity > (item.product.stock || 0)) {
            alert("No hay suficiente stock disponible");
            return item;
          }
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  // Manejadores de productos
  const handleSaveProduct = (product: Product) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.map(p => p.id === product.id ? product : p);
      }
      return [...prev, { ...product, id: Date.now() }];
    });
  };

  const handleDeleteProduct = (productId: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, active: false } : p
      ));
    }
  };

  // Confirmar pago y generar venta
  const handleConfirmPayment = (payments: Payment[], note: string) => {
    const saleNumber = (sales.length + 1).toString().padStart(6, '0');
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    const newSale: Sale = {
      id: Date.now(),
      saleNumber,
      date: new Date(),
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      subtotal: cartSubtotal,
      discount: cartDiscount,
      total: cartTotal,
      customer: customerInfo,
      type: orderType,
      status: "completed",
      paymentMethod: payments.map(p => p.method).join(", "),
      amountPaid: totalPaid,
      payments: payments,
      deliveryPerson: orderType === 'delivery' ? 'Sin asignar' : undefined
    };

    // Guardar venta
    setSales([...sales, newSale]);

    // Descontar stock automáticamente
    const updatedProducts = products.map((product) => {
      const cartItem = cart.find((item) => item.product.id === product.id);
      if (cartItem) {
        const newStock = Math.max(0, (product.stock || 0) - cartItem.quantity);
        return { ...product, stock: newStock };
      }
      return product;
    });
    setProducts(updatedProducts);

    // Limpiar carrito
    setCart([]);
    setCartDiscount(0);
    setOrderNote("");
    setCustomerInfo({
      name: "",
      phone: "",
      address: "",
      ruc: "",
      businessName: "",
      exempt: false
    });
    setShowPaymentModal(false);

    alert(`✅ Venta #${saleNumber} confirmada exitosamente`);
  };

  // Renderizado de contenido principal
  const renderContent = () => {
    switch (currentView) {
      case "pos":
        return (
          <div className="pos-content">
            {/* Panel Izquierdo: Productos */}
            <div className="pos-products-section">
              {/* Header y Buscador */}
              <div className="pos-header">
                <div className="search-bar">
                  <Search size={20} className="text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar productos..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="clear-search">
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                <div className="user-info">
                  <div className="user-avatar">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span>{currentUser.name}</span>
                </div>
              </div>

              {/* Categorías */}
              <div className="categories-list">
                {CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    className={`category-pill ${currentCategory === category.id ? 'active' : ''}`}
                    onClick={() => setCurrentCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Grid de Productos */}
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className={`product-card ${(product.stock || 0) <= 0 ? 'out-of-stock' : ''}`}
                    onClick={() => addToCart(product)}
                  >
                    <div className="product-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div className="placeholder-image">
                          <Package size={32} />
                        </div>
                      )}
                      {(product.stock || 0) <= 0 && (
                        <div className="stock-overlay">AGOTADO</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <div className="product-meta">
                        <span className="price">Gs. {product.price.toLocaleString()}</span>
                        <span className={`stock-badge ${(product.stock || 0) < 10 ? 'low' : ''}`}>
                          Stop: {product.stock || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel Derecho: Carrito */}
            <div className="pos-cart-section">
              <div className="cart-header">
                <h2>Orden Actual</h2>
                <div className="order-type-selector">
                  <button 
                    className={orderType === 'delivery' ? 'active' : ''}
                    onClick={() => setOrderType('delivery')}
                  >
                    <Bike size={18} /> Delivery
                  </button>
                  <button 
                    className={orderType === 'pickup' ? 'active' : ''}
                    onClick={() => setOrderType('pickup')}
                  >
                    <Package size={18} /> Retiro
                  </button>
                  <button 
                    className={orderType === 'dineIn' ? 'active' : ''}
                    onClick={() => setOrderType('dineIn')}
                  >
                    <Warehouse size={18} /> Local
                  </button>
                </div>
              </div>

              {/* Información del Cliente */}
              <div className="customer-form">
                <input 
                  type="text" 
                  placeholder="Nombre del Cliente"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                />
                {orderType === 'delivery' && (
                  <>
                    <input 
                      type="tel" 
                      placeholder="Teléfono / WhatsApp"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    />
                    <textarea 
                      placeholder="Dirección de entrega"
                      rows={2}
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    />
                  </>
                )}
              </div>

              {/* Items del Carrito */}
              <div className="cart-items">
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <ShoppingCart size={48} />
                    <p>El carrito está vacío</p>
                    <span>Selecciona productos para agregar</span>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="cart-item">
                      <div className="item-info">
                        <h4>{item.product.name}</h4>
                        <span className="item-price">Gs. {item.product.price.toLocaleString()}</span>
                      </div>
                      <div className="item-controls">
                        <button onClick={() => updateQuantity(item.product.id, -1)}>
                          <Minus size={16} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, 1)}>
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="item-total">
                        Gs. {(item.product.price * item.quantity).toLocaleString()}
                        <button 
                          className="delete-item"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totales y Acciones */}
              <div className="cart-footer">
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>Gs. {cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="summary-row discount">
                    <span>Descuento</span>
                    <input 
                      type="number" 
                      value={cartDiscount}
                      onChange={(e) => setCartDiscount(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="summary-row total">
                    <span>Total a Pagar</span>
                    <span>Gs. {cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="cart-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      if(confirm('¿Vaciar carrito?')) {
                        setCart([]);
                        setCustomerInfo({name: '', phone: '', address: ''});
                      }
                    }}
                    disabled={cart.length === 0}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="pay-btn"
                    onClick={() => setShowPaymentModal(true)}
                    disabled={cart.length === 0}
                  >
                    Confirmar Pago <DollarSign size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case "sales":
        return <SalesHistory sales={sales} />;
      case "products":
        return <ProductsManager 
          products={products} 
          categories={CATEGORIES}
          onSaveProduct={handleSaveProduct} 
          onDeleteProduct={handleDeleteProduct} 
        />;
      case "inventory":
        return <Inventory products={products} onUpdateProduct={handleSaveProduct} />;
      case "informes":
        return <Reports sales={sales} products={products} />;
      case "settings":
        return (
          <div className="settings-container">
             <div className="settings-tabs">
              <h2>Configuración</h2>
              <div className="settings-grid">
                <PrinterSettings />
                <PrintFormatSettings config={printConfig} onSave={setPrintConfig} />
              </div>
             </div>
          </div>
        );
      default:
        return <div>Vista no encontrada</div>;
    }
  };

  // Navegación lateral
  const navigationItems = [
    { id: "pos", label: "Punto de Venta", icon: "🛒" },
    { id: "sales", label: "Ventas", icon: "📋" },
    { id: "products", label: "Productos y Servicios", icon: "🎯" },
    { id: "inventory", label: "Inventario", icon: "📦" },
    { id: "informes", label: "Informes", icon: "📊" },
    { id: "settings", label: "Ajustes", icon: "⚙️" },
  ];

  return (
    <>
      <Head>
        <title>De la Gran Burger - POS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="pos-layout">
        {/* Sidebar de Navegación */}
        <div className="pos-sidebar">
          <div className="sidebar-header">
            <div className="logo">DG</div>
            <h1>De la Gran Burger</h1>
          </div>
          
          <nav className="sidebar-nav">
            {navigationItems.map(item => (
              <button
                key={item.id}
                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => setCurrentView(item.id as any)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="nav-item">
              <span className="nav-icon">👤</span>
              <span className="nav-label">Cerrar sesión</span>
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="pos-main">
          {renderContent()}
        </div>
      </div>

      {/* Modales */}
      {showPaymentModal && (
        <PaymentModal
          total={cartTotal}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handleConfirmPayment}
        />
      )}
    </>
  );
}