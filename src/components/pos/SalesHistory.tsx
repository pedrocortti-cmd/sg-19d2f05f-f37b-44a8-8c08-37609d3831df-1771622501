import { useState } from "react";
import { Search } from "lucide-react";
import { Sale } from "@/types/pos";
import { formatCurrency } from "@/lib/utils";

interface SalesHistoryProps {
  sales: Sale[];
  onLoadSale: (sale: Sale) => void;
  filter: "pending" | "all";
}

export function SalesHistory({ sales, onLoadSale, filter }: SalesHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSales = sales.filter((sale) => {
    const matchesSearch = 
      sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customerName || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === "all" || sale.status === "pending";
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month} ${hours}:${minutes}`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳ Pendiente";
      case "completed":
        return "✅ Pagado";
      case "cancelled":
        return "❌ Cancelado";
      default:
        return status;
    }
  };

  const emptyMessage = filter === "pending" 
    ? "No hay pedidos pendientes de pago" 
    : "No hay ventas registradas";

  return (
    <>
      {/* Buscador */}
      <div className="history-search">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Lista de ventas */}
      <div className="history-list">
        {filteredSales.length === 0 ? (
          <div className="history-empty">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="history-item"
              onClick={() => onLoadSale(sale)}
            >
              <div className="history-item-header">
                <span className="history-item-number">#{sale.saleNumber}</span>
                <span className={`history-item-status status-${sale.status}`}>
                  {getStatusText(sale.status)}
                </span>
              </div>
              <div className="history-item-info">
                {sale.customerName || sale.customer?.name || "Cliente General"}
              </div>
              <div className="history-item-info">
                {sale.orderType === "delivery" ? "🛵 Delivery" : "📦 Para Retirar"}
              </div>
              <div className="history-item-footer">
                <span className="history-item-total">{formatCurrency(sale.total)}</span>
                <span className="history-item-date">{formatDate(sale.date)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botón cargar más */}
      {filteredSales.length > 0 && (
        <div className="history-load-more">
          <button className="btn-load-more">
            Cargar Más
          </button>
        </div>
      )}
    </>
  );
}