import { Search, User as UserIcon, Clock, Eye, Trash2, Edit } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Sale } from "@/types/pos";
import { useState, useMemo } from "react";

interface SalesHistoryProps {
  sales: Sale[];
  onLoadSale: (sale: Sale) => void;
  onDeleteSale: (saleId: number) => void;
}

export function SalesHistory({ sales, onLoadSale, onDeleteSale }: SalesHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [displayedCount, setDisplayedCount] = useState(10);

  const filteredSales = useMemo(() => {
    return sales
      .filter((sale) => {
        const matchesSearch = 
          sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          "";
        const matchesStatus = filter === "all" || sale.status === "pending";
        return matchesSearch && matchesStatus;
      })
      .slice(0, displayedCount);
  }, [sales, searchTerm, filter, displayedCount]);

  return (
    <div className="history-panel">
      <div className="history-content">
        <div className="history-header">
          <div className="history-tabs">
            <button
              className={`history-tab ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              🔴 Pendientes
            </button>
            <button
              className={`history-tab ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              📋 Todos
            </button>
          </div>

          <div className="history-search">
            <Search className="history-search-icon" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="history-list">
          {filteredSales.length === 0 ? (
            <div className="history-empty">
              <Clock className="history-empty-icon" />
              <p className="history-empty-text">
                {filter === "pending" ? "No hay pedidos pendientes" : "No hay ventas"}
              </p>
            </div>
          ) : (
            filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="history-card"
                onClick={() => onLoadSale(sale)}
              >
                <div className="history-card-header">
                  <span className="history-order-number">{sale.saleNumber}</span>
                  <span className={`history-status-badge ${sale.type}`}>
                    {sale.type === "delivery" ? "Delivery" : sale.type === "pickup" ? "Para Retirar" : "Local"}
                  </span>
                </div>

                <div className="history-card-client">
                  <UserIcon className="history-client-icon" />
                  <span className="history-client-name">
                    {sale.customer?.name || "Sin cliente"}
                  </span>
                </div>

                <div className="history-card-footer">
                  <span className="history-total">{formatCurrency(sale.total)}</span>
                  <span className="history-datetime">
                    {new Date(sale.date).toLocaleDateString("es-PY", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>
            ))
          )}

          {filteredSales.length > 0 && filteredSales.length >= displayedCount && (
            <button
              className="btn-load-more"
              onClick={() => setDisplayedCount(prev => prev + 10)}
            >
              Cargar Más
            </button>
          )}
        </div>
      </div>
    </div>
  );
}