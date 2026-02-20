import { X, Printer } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Sale, Product } from "@/types/pos";

interface SalePreviewModalProps {
  sale: Sale;
  products: Product[];
  onClose: () => void;
  onPrint: () => void;
  businessLogo?: string | null;
}

export function SalePreviewModal({ sale, products, onClose, onPrint, businessLogo }: SalePreviewModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("es-PY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calculateSubtotal = () => {
    return sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateIVA = () => {
    const subtotal = calculateSubtotal();
    return Math.round(subtotal * 0.1); // IVA 10%
  };

  const subtotal = calculateSubtotal();
  const iva = calculateIVA();
  const total = sale.total;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content sale-preview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <div className="sale-preview-content">
          {/* Logo */}
          <div className="sale-preview-logo">
            <div className="logo-placeholder">
              <span className="logo-text">DE LA GRAN</span>
              <span className="logo-text-bold">BURGER</span>
            </div>
          </div>

          {/* Encabezado */}
          <div className="sale-preview-header">
            <h2 className="sale-preview-title">Venta #{sale.saleNumber}</h2>
            <p className="sale-preview-date">Creada El: {formatDate(sale.date)}</p>
          </div>

          {/* Cliente */}
          <div className="sale-preview-client">
            <div className="client-label">CLIENTE</div>
            <div className="client-name">{sale.customerName || "Cliente General"}</div>
          </div>

          {/* Tabla de productos */}
          <div className="sale-preview-table">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Precio</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, index) => (
                  <tr key={index}>
                    <td className="product-name">{item.productName}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{formatCurrency(item.price)}</td>
                    <td className="text-right font-semibold">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
                {/* Delivery como item adicional */}
                {sale.type === "delivery" && sale.deliveryCost && sale.deliveryCost > 0 && (
                  <tr className="delivery-item-row">
                    <td className="product-name">
                      🛵 Delivery
                      {sale.deliveryDriverName && (
                        <span className="delivery-driver-name"> ({sale.deliveryDriverName})</span>
                      )}
                    </td>
                    <td className="text-center">1</td>
                    <td className="text-right">{formatCurrency(sale.deliveryCost)}</td>
                    <td className="text-right font-semibold">{formatCurrency(sale.deliveryCost)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Resumen de totales */}
          <div className="sale-preview-summary">
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Botón de imprimir */}
          <div className="sale-preview-actions">
            <button className="btn-print-preview" onClick={onPrint}>
              <Printer className="w-5 h-5" />
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}