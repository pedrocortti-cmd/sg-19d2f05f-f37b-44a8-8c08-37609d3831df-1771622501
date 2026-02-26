import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search, Filter, Eye, Trash2, RotateCcw, Edit } from "lucide-react";
import { Sale } from "@/types/pos";
import { cn, formatCurrency } from "@/lib/utils";

interface SalesHistoryProps {
  sales: Sale[];
  onLoadSale: (sale: Sale) => void;
  onDeleteSale: (id: number) => void;
}

export function SalesHistory({ sales, onLoadSale, onDeleteSale }: SalesHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed" | "cancelled">("all");

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || sale.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Ordenar por fecha descendente (más reciente primero)
  const sortedSales = [...filteredSales].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex flex-col gap-4 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-blue-600" />
            Historial de Ventas
          </h2>
          <span className="text-sm text-gray-500 font-medium">
            {sortedSales.length} registros
          </span>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por #ticket o cliente..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative min-w-[140px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completados</option>
              <option value="cancelled">Anulados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Ventas */}
      <div className="flex-1 overflow-y-auto">
        {sortedSales.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-500">No se encontraron ventas</p>
            <p className="text-sm">Intenta con otros filtros de búsqueda</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedSales.map((sale) => (
              <div 
                key={sale.id} 
                className="group p-4 hover:bg-blue-50/50 transition-colors duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded text-sm">
                      {sale.saleNumber}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-semibold border",
                      sale.orderType === "delivery" && "bg-orange-50 text-orange-600 border-orange-100",
                      sale.orderType === "pickup" && "bg-purple-50 text-purple-600 border-purple-100",
                      sale.orderType === "local" && "bg-green-50 text-green-600 border-green-100",
                      sale.orderType === "dineIn" && "bg-teal-50 text-teal-600 border-teal-100"
                    )}>
                      {sale.orderType.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {format(new Date(sale.date), "dd/MM/yyyy HH:mm", { locale: es })}
                  </span>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">
                        {sale.customer?.name || "Cliente Final"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {sale.items.length} productos • {sale.paymentMethod}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">
                      {formatCurrency(sale.total)}
                    </div>
                    <div className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      sale.status === "completed" && "text-green-600",
                      sale.status === "pending" && "text-amber-600",
                      sale.status === "cancelled" && "text-red-600"
                    )}>
                      {sale.status === "completed" ? "PAGADO" : 
                       sale.status === "pending" ? "PENDIENTE" : "ANULADO"}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {sale.status === "pending" && (
                    <button
                      onClick={() => onLoadSale(sale)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors shadow-sm"
                      title="Cobrar / Editar"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Cobrar
                    </button>
                  )}
                  
                  <button
                    onClick={() => onLoadSale(sale)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver
                  </button>

                  <button
                    onClick={() => sale.id && onDeleteSale(sale.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-100 text-red-600 text-xs font-medium rounded hover:bg-red-50 transition-colors"
                    title="Eliminar venta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}