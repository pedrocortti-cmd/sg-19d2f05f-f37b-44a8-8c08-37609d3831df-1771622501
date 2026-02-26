import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/pos";
import { Search, Package, AlertTriangle, Plus, Minus, X } from "lucide-react";

interface InventoryProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
}

export function Inventory({ products, onUpdateProduct }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [activeTab, setActiveTab] = useState<"stock" | "movements" | "alerts">("stock");

  // Filtrar productos por búsqueda
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  // Productos con stock bajo (menos de 10 unidades)
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => (p.stock || 0) < 10 && (p.stock || 0) > 0);
  }, [products]);

  // Productos sin stock
  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => (p.stock || 0) === 0);
  }, [products]);

  // Valor total del inventario
  const totalInventoryValue = useMemo(() => {
    return products.reduce((total, p) => total + (p.price * (p.stock || 0)), 0);
  }, [products]);

  // Total de productos en stock
  const totalUnits = useMemo(() => {
    return products.reduce((total, p) => total + (p.stock || 0), 0);
  }, [products]);

  // Helper para estado de stock visual
  const getStockStatus = (product: Product) => {
    const stock = product.stock || 0;
    if (stock === 0) return { label: "Agotado", className: "out", icon: "🔴" };
    if (stock < 10) return { label: "Stock Bajo", className: "low", icon: "⚠️" };
    return { label: "Disponible", className: "good", icon: "✓" };
  };

  // Función para cerrar modal y limpiar estado
  const handleCloseModal = () => {
    setShowAdjustment(false);
    setSelectedProduct(null);
    setAdjustmentType("add");
    setAdjustmentQuantity("");
    setAdjustmentReason("");
  };

  // Función para ajustar stock
  const handleAdjustStock = () => {
    if (!selectedProduct || !adjustmentQuantity) {
      return;
    }

    const quantity = parseInt(adjustmentQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Cantidad inválida");
      return;
    }

    const currentStock = selectedProduct.stock || 0;
    let newStock = currentStock;

    if (adjustmentType === "add") {
      newStock = currentStock + quantity;
    } else {
      newStock = Math.max(0, currentStock - quantity);
    }

    const updatedProduct = {
      ...selectedProduct,
      stock: newStock,
    };

    onUpdateProduct(updatedProduct);

    // Registrar movimiento (en el futuro se guardará en BD)
    console.log("Movimiento de stock:", {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: "adjustment",
      quantity: adjustmentType === "add" ? quantity : -quantity,
      previousStock: currentStock,
      newStock,
      reason: adjustmentReason,
      createdAt: new Date(),
    });

    handleCloseModal();
  };

  // Renderizar vista de stock
  const renderStockView = () => (
    <div className="inventory-stock-view">
      {/* Búsqueda */}
      <div className="inventory-search-bar">
        <Search className="inventory-search-icon" size={20} />
        <Input
          type="text"
          placeholder="Buscar producto por nombre o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="inventory-search-input"
        />
      </div>

      {/* Tabla de productos */}
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th className="text-center">Stock Actual</th>
              <th className="text-center">Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const stock = product.stock || 0;
              const stockStatus =
                stock === 0 ? "out" : stock < 10 ? "low" : "good";

              return (
                <tr key={product.id}>
                  <td>
                    <div className="inventory-product-name">
                      <Package size={16} />
                      {product.name}
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`inventory-stock ${getStockStatus(product).className}`}>
                      {product.stock || 0}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`inventory-status ${getStockStatus(product).className}`}>
                      {getStockStatus(product).icon} {getStockStatus(product).label}
                    </span>
                  </td>
                  <td className="text-right">Gs. {product.price.toLocaleString("es-PY")}</td>
                  <td className="text-center">
                    {stockStatus === "out" && (
                      <span className="inventory-status-badge out">
                        <AlertTriangle size={14} />
                        Sin Stock
                      </span>
                    )}
                    {stockStatus === "low" && (
                      <span className="inventory-status-badge low">
                        <AlertTriangle size={14} />
                        Stock Bajo
                      </span>
                    )}
                    {stockStatus === "good" && (
                      <span className="inventory-status-badge good">
                        ✓ Disponible
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProduct(product);
                        setAdjustmentType("add");
                        setShowAdjustment(true);
                      }}
                      className="inventory-adjust-btn"
                    >
                      Ajustar Stock
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="inventory-empty-state">
            <Package size={48} />
            <p>No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar vista de alertas
  const renderAlertsView = () => (
    <div className="inventory-alerts-view">
      <div className="inventory-alerts-grid">
        {/* Productos sin stock */}
        {outOfStockProducts.length > 0 && (
          <div className="inventory-alert-card critical">
            <div className="inventory-alert-header">
              <AlertTriangle size={24} />
              <h3>Productos Sin Stock ({outOfStockProducts.length})</h3>
            </div>
            <div className="inventory-alert-list">
              {outOfStockProducts.map((product) => (
                <div key={product.id} className="inventory-alert-item">
                  <span>{product.name}</span>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setAdjustmentType("add");
                      setShowAdjustment(true);
                    }}
                  >
                    Reponer
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Productos con stock bajo */}
        {lowStockProducts.length > 0 && (
          <div className="inventory-alert-card warning">
            <div className="inventory-alert-header">
              <AlertTriangle size={24} />
              <h3>Stock Bajo ({lowStockProducts.length})</h3>
            </div>
            <div className="inventory-alert-list">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="inventory-alert-item">
                  <span>
                    {product.name} - {product.stock} unidades
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedProduct(product);
                      setAdjustmentType("add");
                      setShowAdjustment(true);
                    }}
                  >
                    Reponer
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {outOfStockProducts.length === 0 && lowStockProducts.length === 0 && (
          <div className="inventory-empty-state">
            <AlertTriangle size={48} />
            <p>No hay alertas de inventario</p>
            <span>Todos los productos tienen stock suficiente</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="inventory-container">
      {/* Header */}
      <div className="inventory-header">
        <div>
          <h1>Gestión de Inventario</h1>
          <p className="inventory-subtitle">
            Administra el stock de todos tus productos
          </p>
        </div>
      </div>

      {/* Métricas */}
      <div className="inventory-metrics">
        <div className="inventory-metric">
          <div className="inventory-metric-icon blue">📦</div>
          <div className="inventory-metric-content">
            <span className="inventory-metric-value">{totalUnits.toLocaleString("es-PY")}</span>
            <span className="inventory-metric-label">Unidades Totales</span>
          </div>
        </div>
        
        <div className="inventory-metric">
          <div className="inventory-metric-icon green">💰</div>
          <div className="inventory-metric-content">
            <span className="inventory-metric-value">
              Gs. {totalInventoryValue.toLocaleString("es-PY")}
            </span>
            <span className="inventory-metric-label">Valor en Stock</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="inventory-tabs">
        <button
          className={`inventory-tab ${activeTab === "stock" ? "active" : ""}`}
          onClick={() => setActiveTab("stock")}
        >
          <Package size={18} />
          Stock de Productos
        </button>
        <button
          className={`inventory-tab ${activeTab === "alerts" ? "active" : ""}`}
          onClick={() => setActiveTab("alerts")}
        >
          <AlertTriangle size={18} />
          Alertas ({outOfStockProducts.length + lowStockProducts.length})
        </button>
      </div>

      {/* Contenido según tab activa */}
      <div className="inventory-content">
        {activeTab === "stock" && renderStockView()}
        {activeTab === "alerts" && renderAlertsView()}
      </div>

      {/* Modal de Ajuste de Stock */}
      {showAdjustment && selectedProduct && (
        <div className="inventory-modal-overlay" onClick={handleCloseModal}>
          <div className="inventory-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="inventory-modal-header">
              <h3 className="inventory-modal-title">
                Ajustar Stock - {selectedProduct.name}
              </h3>
              <button
                className="inventory-modal-close"
                onClick={handleCloseModal}
              >
                <X size={20} />
              </button>
            </div>

            <div className="inventory-modal-body">
              {/* Stock actual */}
              <div className="inventory-stock-current">
                <Package size={20} className="text-blue-600" />
                <span className="inventory-stock-label">Stock Actual:</span>
                <span className="inventory-stock-value">{selectedProduct.stock || 0} unidades</span>
              </div>

              {/* Tabs de tipo de ajuste */}
              <div className="inventory-adjustment-tabs">
                <button
                  className={`inventory-tab ${adjustmentType === "add" ? "inventory-tab-active" : ""}`}
                  onClick={() => setAdjustmentType("add")}
                >
                  <Plus size={18} />
                  Agregar Stock
                </button>
                <button
                  className={`inventory-tab ${adjustmentType === "remove" ? "inventory-tab-active" : ""}`}
                  onClick={() => setAdjustmentType("remove")}
                >
                  <Minus size={18} />
                  Quitar Stock
                </button>
              </div>

              {/* Campo de cantidad */}
              <div className="inventory-form-group">
                <label className="inventory-form-label">Cantidad</label>
                <input
                  type="number"
                  className="inventory-form-input"
                  placeholder="Ingresa la cantidad"
                  min="0"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                />
              </div>

              {/* Campo de motivo */}
              <div className="inventory-form-group">
                <label className="inventory-form-label">Motivo del Ajuste</label>
                <textarea
                  className="inventory-form-textarea"
                  placeholder="Ej: Compra de mercadería, Corrección de inventario, Producto dañado..."
                  rows={3}
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                />
              </div>
            </div>

            <div className="inventory-modal-footer">
              <button
                className="inventory-btn-cancel"
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
              <button
                className="inventory-btn-confirm"
                onClick={handleAdjustStock}
                disabled={!adjustmentQuantity || parseInt(adjustmentQuantity) <= 0}
              >
                Confirmar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}