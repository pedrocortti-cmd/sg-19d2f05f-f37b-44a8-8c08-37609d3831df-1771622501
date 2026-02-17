import { useState, useMemo } from "react";
import Head from "next/head";
import { ShoppingCart, Package, Warehouse, TrendingUp, FileText, Settings, HelpCircle, LogOut, Search, Trash2, X } from "lucide-react";
import { ProductsManager } from "@/components/pos/ProductsManager";
import { SalesHistory } from "@/components/pos/SalesHistory";
import { PrinterSettings } from "@/components/pos/PrinterSettings";
import type { Product as ProductType, Category, Sale, CartItem as CartItemType, CustomerInfo, OrderType } from "@/types/pos";

// Helper function for consistent number formatting
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("es-PY");
};

export default function Home() {
  // Estado del sistema
  const [currentView, setCurrentView] = useState<"pos" | "sales" | "products" | "inventory" | "expenses" | "reports" | "settings">("pos");
  
  // Estado del carrito
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [discount, setDiscount] = useState<number>(0);
  const [note, setNote] = useState<string>("");
  
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
  const [selectedCategory, setSelectedCategory] = useState<string>("Productos");
  
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
  
  const categoryNames = ["Productos", ...categories.filter(c => c.active).map(c => c.name)];
  
  // Productos filtrados
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Productos" || product.category === selectedCategory;
      return matchesSearch && matchesCategory && product.active;
    });
  }, [searchTerm, selectedCategory, products]);
  
  // Funciones del carrito
  const addToCart = (product: ProductType) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };
  
  const updateQuantity = (productId: number, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };
  
  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };
  
  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setNote("");
    setCustomer({
      name: "",
      phone: "",
      address: "",
      ruc: "",
      businessName: "",
      isExempt: false
    });
  };
  
  // Cálculos
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;
  
  const handleConfirmSale = async () => {
    if (cart.length === 0) return;
    
    const orderNumber = `${Date.now().toString().slice(-6)}`;
    const saleDate = new Date();
    
    const newSale: Sale = {
      id: sales.length + 1,
      orderNumber,
      date: saleDate,
      items: [...cart],
      subtotal,
      discount: discountAmount,
      total,
      orderType,
      paymentMethod: "cash",
      customer: { ...customer },
      note,
      status: "completed"
    };
    
    setSales([newSale, ...sales]);
    
    // Enviar a imprimir
    await printSale(newSale);
    
    alert(`¡Venta confirmada!\nPedido #${orderNumber}\nTotal: Gs. ${formatCurrency(total)}`);
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
        paymentMethod: sale.paymentMethod,
        customer: sale.customer,
        note: sale.note
      };
      
      // Imprimir ambos tickets
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
        <div className="pos-customer-section">
          <div className="pos-section-title">
            <span>Información del Cliente</span>
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
          </div>
          
          <div className="pos-cart-items">
            {cart.length === 0 ? (
              <div className="pos-cart-empty">
                <ShoppingCart className="pos-cart-empty-icon" />
                <div>No hay productos en el carrito</div>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="pos-cart-item">
                  <div className="pos-cart-item-header">
                    <div className="pos-cart-item-name">{item.product.name}</div>
                    <button className="pos-cart-item-remove" onClick={() => removeFromCart(item.product.id)}>
                      <X size={18} />
                    </button>
                  </div>
                  <div className="pos-cart-item-controls">
                    <div className="pos-quantity-control">
                      <button className="pos-quantity-btn" onClick={() => updateQuantity(item.product.id, -1)}>−</button>
                      <div className="pos-quantity-display">{item.quantity}</div>
                      <button className="pos-quantity-btn" onClick={() => updateQuantity(item.product.id, 1)}>+</button>
                    </div>
                    <div className="pos-cart-item-price">Gs. {formatCurrency(item.product.price * item.quantity)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer del carrito */}
          <div className="pos-cart-footer">
            <div className="pos-discount-section">
              <div className="pos-input-group">
                <label className="pos-input-label">Descuento (%)</label>
                <input
                  type="number"
                  className="pos-input"
                  placeholder="0"
                  min="0"
                  max="100"
                  value={discount || ""}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
            </div>
            
            <div className="pos-note-section">
              <div className="pos-input-group">
                <label className="pos-input-label">Nota</label>
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
              <div className="pos-total-row">
                <span className="pos-total-label">Subtotal:</span>
                <span className="pos-total-value">Gs. {formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="pos-total-row">
                  <span className="pos-total-label">Descuento ({discount}%):</span>
                  <span className="pos-total-value">- Gs. {formatCurrency(discountAmount)}</span>
                </div>
              )}
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
              <button className="pos-btn pos-btn-confirm" onClick={handleConfirmSale} disabled={cart.length === 0}>
                Confirmar Venta
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