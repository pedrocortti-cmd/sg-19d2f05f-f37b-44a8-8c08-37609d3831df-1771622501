import { X, Printer } from "lucide-react";
import { Sale } from "@/types/pos";
import { useEffect } from "react";

interface SalePreviewModalProps {
  sale: Sale | null;
  onClose: () => void;
  onPrint: () => void;
  businessLogo?: string | null;
}

export function SalePreviewModal({ sale, onClose, onPrint, businessLogo }: SalePreviewModalProps) {
  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (sale) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sale]);

  if (!sale) return null;

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="preview-modal-header">
          <button className="preview-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Logo */}
        <div className="preview-modal-logo">
          {businessLogo ? (
            <img 
              src={businessLogo} 
              alt="Logo" 
              className="preview-logo-img"
            />
          ) : (
            <div className="preview-logo-circle">
              🍔
            </div>
          )}
        </div>

        {/* Título */}
        <h2 className="preview-modal-title">Venta {sale.saleNumber}</h2>
        <p className="preview-modal-date">
          Creada El: {new Date(sale.date).toLocaleDateString("es-PY")}
        </p>

        {/* Cliente */}
        <div className="preview-customer-section">
          <div className="preview-customer-label">CLIENTE</div>
          <div className="preview-customer-value">
            {sale.customerName || sale.customer?.name || "Cliente Final"}
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="preview-table-container">
          <table className="preview-table">
            <thead>
              <tr>
                <th>PRODUCTO</th>
                <th>CANT.</th>
                <th>PRECIO</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.productName}</td>
                  <td>{item.quantity}</td>
                  <td>Gs. {item.price.toLocaleString()}</td>
                  <td>Gs. {(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="preview-total-section">
          <div className="preview-total-label">Total</div>
          <div className="preview-total-amount">Gs. {sale.total.toLocaleString()}</div>
        </div>

        {/* Botón Imprimir */}
        <button className="preview-print-button" onClick={onPrint}>
          <Printer size={18} />
          Imprimir
        </button>
      </div>
    </div>
  );
}