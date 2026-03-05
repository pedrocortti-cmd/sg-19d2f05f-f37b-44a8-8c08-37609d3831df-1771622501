import { useState, useMemo } from "react";
import { Search, Eye, Edit, Trash2, X } from "lucide-react";
import type { Sale } from "@/types/pos";
import { formatCurrency } from "@/lib/utils";

interface SalesHistoryProps {
  sales: Sale[];
  onLoadSale: (sale: Sale) => void;
  onDeleteSale: (id: number) => void;
}

export function SalesHistory({ sales, onLoadSale, onDeleteSale }: SalesHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [displayCount, setDisplayCount] = useState(10);

  const filteredSales = useMemo(() => {
    return sales
      .filter((sale) => {
        const matchesSearch = 
          sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          "";
        const matchesFilter = filter === "all" || sale.status === filter;
        return matchesSearch && matchesFilter;
      })
      .slice(0, displayCount);
  }, [sales, searchTerm, filter, displayCount]);

  const getStatusBadge = (status: Sale["status"]) => {
    const badges = {
      pending: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    const labels = {
      pending: "PENDIENTE",
      completed: "COMPLETADO",
      cancelled: "CANCELADO"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getOrderTypeBadge = (orderType: Sale["orderType"]) => {
    const badges = {
      delivery: "bg-blue-100 text-blue-800",
      pickup: "bg-purple-100 text-purple-800",
      local: "bg-gray-100 text-gray-800"
    };
    const labels = {
      delivery: "DELIVERY",
      pickup: "RETIRO",
      local: "LOCAL"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[orderType]}`}>
        {labels[orderType]}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4">📋 Historial de Ventas</h2>
        
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por #Venta o Cliente..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setFilter("all")}
            >
              Todos
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                filter === "pending"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setFilter("pending")}
            >
              Pendientes
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                filter === "completed"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setFilter("completed")}
            >
              Completados
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredSales.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No hay ventas que mostrar</p>
            <p className="text-sm mt-2">
              {searchTerm ? "Intenta con otro término de búsqueda" : "Las ventas aparecerán aquí"}
            </p>
          </div>
        ) : (
          filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-blue-600">{sale.saleNumber}</span>
                    {getOrderTypeBadge(sale.orderType)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(sale.date).toLocaleString("es-PY", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(sale.status)}
                </div>
              </div>

              <div className="space-y-2 mb-3">
                {sale.customer?.name && (
                  <div className="text-sm">
                    <span className="text-gray-600">Cliente:</span>{" "}
                    <span className="font-medium">{sale.customer.name}</span>
                  </div>
                )}
                
                {sale.orderType === "delivery" && sale.deliveryDriverName && (
                  <div className="text-sm">
                    <span className="text-gray-600">Repartidor:</span>{" "}
                    <span className="font-medium">🛵 {sale.deliveryDriverName}</span>
                  </div>
                )}

                <div className="text-sm">
                  <span className="text-gray-600">Items:</span>{" "}
                  <span className="font-medium">{sale.items.length} producto(s)</span>
                </div>

                {sale.note && (
                  <div className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2">
                    <span className="text-gray-600">📝 Nota:</span>{" "}
                    <span className="text-gray-800">{sale.note}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(sale.total)}
                </div>
                <div className="flex gap-2">
                  {sale.status === "pending" && (
                    <button
                      onClick={() => onLoadSale(sale)}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-1"
                      title="Cargar para editar"
                    >
                      <Edit className="w-4 h-4" />
                      Cargar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar venta ${sale.saleNumber}?`)) {
                        onDeleteSale(sale.id);
                      }
                    }}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-1"
                    title="Eliminar venta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredSales.length > 0 && filteredSales.length < sales.length && (
        <div className="p-4 border-t">
          <button
            onClick={() => setDisplayCount(displayCount + 10)}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cargar más ventas ({filteredSales.length} de {sales.length})
          </button>
        </div>
      )}
    </div>
  );
}