import { useState, useMemo } from "react";
import Head from "next/head";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { ProductsManager } from "@/components/pos/ProductsManager";
import { SalesHistory } from "@/components/pos/SalesHistory";
import { PrinterSettings } from "@/components/pos/PrinterSettings";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { PrintFormatSettings } from "@/components/pos/PrintFormatSettings";
import { Reports } from "@/components/pos/Reports";
import { Inventory } from "@/components/pos/Inventory";

import { 
  Product, 
  CartItem, 
  Sale, 
  CustomerInfo, 
  OrderType,
  User,
  Payment,
  PrintFormatConfig
} from "@/types/pos";

// Datos de prueba iniciales con tipos corregidos
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

  // Estado del tipo de orden (usando camelCase para coincidir con OrderType)
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

  // Estado para configuración de impresión con todos los campos requeridos
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

    // Calcular montos de pago para reporte
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
      status: "completed",
      user: currentUser.name,
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

  // Handler para cancelar venta (usado en SalesHistory)
  const handleCancelSale = (saleId: number, reason: string) => {
    if (confirm("¿Estás seguro de que deseas anular esta venta?")) {
      setSales(sales.map(s => 
        s.id === saleId 
          ? { ...s, status: "cancelled" as const, cancelReason: reason } 
          : s
      ));
    }
  };

  // Handler para guardar producto
  const handleSaveProduct = (product: Product) => {
    if (product.id) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      const newProduct = { ...product, id: products.length + 1 };
      setProducts([...products, newProduct]);
    }
  };

  // Renderizado de contenido principal
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
        return renderPOS();
    }
  };

  // Navegación
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
    <div className="pos-layout">
      {/* Panel Izquierdo: Cliente + Carrito */}
      <div className="pos-customer-panel">
        <div className="pos-customer-info">
          <button className="customer-toggle">
            <span>👤</span>
            Información del Cliente
          </button>

          <div className="customer-form">
            <div className="form-group">
              <label>Cliente</label>
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={customerInfo.name}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                placeholder="Teléfono"
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, phone: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <input
                type="text"
                placeholder="Dirección de entrega"
                value={customerInfo.address}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, address: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>RUC</label>
              <input
                type="text"
                placeholder="RUC (opcional)"
                value={customerInfo.ruc || ""}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, ruc: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Razón Social</label>
              <input
                type="text"
                placeholder="Razón Social (opcional)"
                value={customerInfo.businessName || ""}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, businessName: e.target.value })
                }
              />
            </div>

            <div className="form-group-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={customerInfo.isExempt || false}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, isExempt: e.target.checked, exempt: e.target.checked })
                  }
                />
                Exento
              </label>
            </div>
          </div>
        </div>

        <div className="pos-cart">
          <div className="cart-header">
            <ShoppingCart size={20} />
            <h3>Orden Actual</h3>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <p>No hay productos en el carrito</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.product.name}</span>
                    <span className="cart-item-price">
                      Gs. {item.product.price.toLocaleString("es-PY")}
                    </span>
                  </div>

                  <div className="cart-item-controls">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="qty-btn"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="cart-item-qty">{item.quantity}</span>

                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="qty-btn"
                    >
                      <Plus size={16} />
                    </button>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="remove-btn"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    Gs. {(item.product.price * item.quantity).toLocaleString("es-PY")}
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-discount">
              <label>Descuento</label>
              <div className="discount-controls">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as "percentage" | "amount")}
                >
                  <option value="percentage">%</option>
                  <option value="amount">Gs.</option>
                </select>
                <input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {cart.length > 0 && (
            <div className="cart-note">
              <label>Nota</label>
              <textarea
                placeholder="Nota del pedido (opcional)"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {cart.length > 0 && (
            <div className="cart-order-type">
              <button
                className={`order-type-btn ${orderType === "delivery" ? "active" : ""}`}
                onClick={() => setOrderType("delivery")}
              >
                🛵 Delivery
              </button>
              <button
                className={`order-type-btn ${orderType === "pickup" ? "active" : ""}`}
                onClick={() => setOrderType("pickup")}
              >
                🚶 Para Retirar
              </button>
              <button
                className={`order-type-btn ${orderType === "dineIn" ? "active" : ""}`}
                onClick={() => setOrderType("dineIn")}
              >
                🍽️ En Local
              </button>
            </div>
          )}

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>Gs. {subtotal.toLocaleString("es-PY")}</span>
            </div>
            {discountAmount > 0 && (
              <div className="summary-row discount">
                <span>Descuento:</span>
                <span>-Gs. {discountAmount.toLocaleString("es-PY")}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total:</span>
              <span>Gs. {cartTotal.toLocaleString("es-PY")}</span>
            </div>
          </div>

          <div className="cart-actions">
            <button
              className="btn-clear"
              onClick={clearCart}
              disabled={cart.length === 0}
            >
              <Trash2 size={18} />
              Vaciar
            </button>
            <button
              className="btn-pay"
              onClick={() => setShowPaymentModal(true)}
              disabled={cart.length === 0}
            >
              Confirmar Pago
            </button>
          </div>
        </div>
      </div>

      <div className="pos-products-panel">
        <div className="products-search">
          <input
            type="text"
            placeholder="🔍 Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="products-categories">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${
                selectedCategory === category.name ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category.name)}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`product-card ${product.stock !== undefined && product.stock <= 0 ? 'out-of-stock' : ''}`}
              onClick={() => addToCart(product)}
            >
              <div className="product-info">
                <h4>{product.name}</h4>
                <p className="product-price">Gs. {product.price.toLocaleString("es-PY")}</p>
                {product.stock !== undefined && (
                  <p className="product-stock">
                    {product.stock <= 0 ? '❌ Agotado' : 
                     product.stock < 10 ? `⚠️ ${product.stock} disponibles` :
                     `✓ ${product.stock} disponibles`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>De la Gran Burger - POS</title>
        <SEO
          title="De la Gran Burger - Sistema POS"
          description="Sistema de punto de venta para hamburguesería"
        />
      </Head>

      <div className="pos-container">
        <div className="pos-sidebar">
          <div className="sidebar-header">
            <div className="logo">DG</div>
            <h1>De la Gran Burger</h1>
          </div>

          <nav className="sidebar-nav">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${currentView === item.id ? "active" : ""}`}
                onClick={() => setCurrentView(item.id as typeof currentView)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="nav-item" onClick={() => alert("Cerrar sesión")}>
              <span className="nav-icon">👤</span>
              <span className="nav-label">Cerrar sesión</span>
            </button>
          </div>
        </div>

        <div className="pos-content">{renderContent()}</div>
      </div>

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