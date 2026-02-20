import { useState } from "react";
import { Clock, Search } from "lucide-react";
import { Sale } from "@/types/pos";
import { formatCurrency } from "@/lib/utils";

interface SalesHistoryProps {
  sales: Sale[];
  onLoadSale: (sale: Sale) => void;
  onCancelSale?: (saleId: number, reason: string) => void;
}

export function SalesHistory({ sales, onLoadSale }: SalesHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSales = sales.filter((sale) =>
    sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.customerName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        return "Pendiente";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <div className="history-container">
      {/* Header */}
      <div className="history-header">
        <div className="history-title">
          <Clock className="w-5 h-5" />
          <h2>Todos los Registros</h2>
        </div>
      </div>

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
            <p>No hay ventas registradas</p>
          </div>
        ) : (
          filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="history-item"
              onClick={() => onLoadSale(sale)}
            >
              <div className="history-item-header">
                <span className="history-item-order">Pedido {sale.saleNumber}</span>
                <span className={`history-item-status status-${sale.status}`}>
                  {getStatusText(sale.status)}
                </span>
              </div>
              <div className="history-item-customer">
                {sale.customerName || sale.customer?.name || "Cliente General"}
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
        <div className="history-footer">
          <button className="history-load-more">
            Cargar Más
          </button>
        </div>
      )}
    </div>
  );
}