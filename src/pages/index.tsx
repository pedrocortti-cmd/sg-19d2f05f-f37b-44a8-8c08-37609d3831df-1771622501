import { useState, useMemo } from "react";
import Head from "next/head";
import { ShoppingCart, Package, Warehouse, Search, X, Plus, Minus, Bike } from "lucide-react";
import { ProductsManager } from "@/components/pos/ProductsManager";
import { SalesHistory } from "@/components/pos/SalesHistory";
import { PrinterSettings } from "@/components/pos/PrinterSettings";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { PrintFormatSettings } from "@/components/pos/PrintFormatSettings";
import { Reports } from "@/components/pos/Reports";
import { Inventory } from "@/components/pos/Inventory";

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
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentView, setCurrentView] = useState<"pos" | "sales" | "products" | "inventory" | "informes" | "settings">("pos");
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
  const [currentUser] = useState<User>({
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

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - cartDiscount);
  }, [cartSubtotal, cartDiscount]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = currentCategory === 0 || product.categoryId === currentCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch && product.active;
    });
  }, [products, currentCategory, searchTerm]);

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

    setSales([...sales, newSale]);

    const updatedProducts = products.map((product) => {
      const cartItem = cart.find((item) => item.product.id === product.id);
      if (cartItem) {
        const newStock = Math.max(0, (product.stock || 0) - cartItem.quantity);
        return { ...product, stock: newStock };
      }
      return product;
    });
    setProducts(updatedProducts);

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

    alert(`✅ Venta #${saleNumber} confirmada exitosamente\n💾 Stock actualizado automáticamente`);
  };

  const renderContent = () => {
    switch (currentView) {
      case "pos":
        return (
          <>
            {/* Panel de Cliente y Carrito */}
            <div className="pos-customer-panel">
              {/* Información del Cliente */}
              <div className="pos-customer-section expanded">
                <div className="pos-section-title">
                  INFORMACIÓN DEL CLIENTE
                </div>
                <div className="pos-customer-form">
                  <div className="pos-input-group">
                    <label className="pos-input-label">Cliente</label>
                    <input 
                      type="text" 
                      className="pos-input"
                      placeholder="Nombre del cliente"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    />
                  </div>
                  {orderType === 'delivery' && (
                    <>
                      <div className="pos-input-group">
                        <label className="pos-input-label">Teléfono</label>
                        <input 
                          type="tel" 
                          className="pos-input"
                          placeholder="Teléfono / WhatsApp"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        />
                      </div>
                      <div className="pos-input-group">
                        <label className="pos-input-label">Dirección</label>
                        <textarea 
                          className="pos-input"
                          placeholder="Dirección de entrega"
                          rows={2}
                          value={customerInfo.address}
                          onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Carrito */}
              <div className="pos-cart-section">
                <div className="pos-cart-header">
                  ORDEN ACTUAL
                </div>

                <div className="pos-cart-items">
                  {cart.length === 0 ? (
                    <div className="pos-cart-empty">
                      <ShoppingCart className="pos-cart-empty-icon" />
                      <p>El carrito está vacío</p>
                      <span>Selecciona productos para agregar</span>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.product.id} className="pos-cart-item">
                        <div className="pos-cart-item-header">
                          <div className="pos-cart-item-name">{item.product.name}</div>
                          <button
                            className="pos-cart-item-remove"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="pos-cart-item-controls">
                          <div className="pos-quantity-control">
                            <button
                              className="pos-quantity-btn"
                              onClick={() => updateQuantity(item.product.id, -1)}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="pos-quantity-display">{item.quantity}</span>
                            <button
                              className="pos-quantity-btn"
                              onClick={() => updateQuantity(item.product.id, 1)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="pos-cart-item-price">
                            Gs. {(item.product.price * item.quantity).toLocaleString("es-PY")}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer del Carrito */}
                <div className="pos-cart-footer">
                  <div className="pos-order-type">
                    <button 
                      className={`pos-order-type-btn ${orderType === 'delivery' ? 'active' : ''}`}
                      onClick={() => setOrderType('delivery')}
                    >
                      <Bike size={16} /> Delivery
                    </button>
                    <button 
                      className={`pos-order-type-btn ${orderType === 'pickup' ? 'active' : ''}`}
                      onClick={() => setOrderType('pickup')}
                    >
                      <Package size={16} /> Retiro
                    </button>
                    <button 
                      className={`pos-order-type-btn ${orderType === 'dineIn' ? 'active' : ''}`}
                      onClick={() => setOrderType('dineIn')}
                    >
                      <Warehouse size={16} /> Local
                    </button>
                  </div>

                  <div className="pos-total-section">
                    <div className="pos-total-row">
                      <span className="pos-total-label">Subtotal:</span>
                      <span className="pos-total-value">Gs. {cartSubtotal.toLocaleString("es-PY")}</span>
                    </div>
                    {cartDiscount > 0 && (
                      <div className="pos-total-row">
                        <span className="pos-total-label">Descuento:</span>
                        <span className="pos-total-value">-Gs. {cartDiscount.toLocaleString("es-PY")}</span>
                      </div>
                    )}
                    <div className="pos-total-row pos-total-final">
                      <span className="pos-total-label">Total:</span>
                      <span className="pos-total-value">Gs. {cartTotal.toLocaleString("es-PY")}</span>
                    </div>
                  </div>

                  <div className="pos-action-buttons">
                    <div className="pos-action-buttons-row">
                      <button 
                        className="pos-btn pos-btn-clear"
                        onClick={() => {
                          if(confirm('¿Vaciar carrito?')) {
                            setCart([]);
                            setCustomerInfo({name: '', phone: '', address: '', ruc: '', businessName: '', exempt: false});
                          }
                        }}
                        disabled={cart.length === 0}
                      >
                        Vaciar
                      </button>
                    </div>
                    <div className="pos-action-buttons-row">
                      <button 
                        className="pos-btn pos-btn-pay"
                        onClick={() => setShowPaymentModal(true)}
                        disabled={cart.length === 0}
                      >
                        Confirmar Pago
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel de Productos */}
            <div className="pos-products-panel">
              <div className="pos-products-header">
                <div className="pos-search-bar">
                  <Search className="pos-search-icon" />
                  <input 
                    type="text" 
                    className="pos-search-input"
                    placeholder="Buscar productos..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm("")}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8'
                      }}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <div className="pos-categories">
                  {CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      className={`pos-category-btn ${currentCategory === category.id ? 'active' : ''}`}
                      onClick={() => setCurrentCategory(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pos-products-grid">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id}
                    className="pos-product-card"
                    onClick={() => addToCart(product)}
                  >
                    <div className="pos-product-name">{product.name}</div>
                    <div className="pos-product-price">Gs. {product.price.toLocaleString("es-PY")}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
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

      <div className={currentView === "pos" ? "pos-layout" : "pos-layout-two-column"}>
        {/* Sidebar de Navegación */}
        <div className="pos-sidebar">
          <div className="pos-sidebar-header">
            <div className="pos-sidebar-logo">DG</div>
            <h1 className="pos-sidebar-title">De la Gran Burger</h1>
          </div>
          
          <nav className="pos-sidebar-nav">
            {navigationItems.map(item => (
              <a
                key={item.id}
                className={`pos-nav-item ${currentView === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView(item.id as any);
                }}
                href="#"
              >
                <span className="pos-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="pos-sidebar-footer">
            <a className="pos-nav-item" href="#">
              <span className="pos-nav-icon">👤</span>
              <span>Cerrar sesión</span>
            </a>
          </div>
        </div>

        {/* Contenido Principal */}
        {renderContent()}
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