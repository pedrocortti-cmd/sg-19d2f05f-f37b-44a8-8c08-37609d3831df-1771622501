import { useState, useMemo } from "react";
import { Calendar, Search, Eye, XCircle, FileText, Printer, RefreshCw } from "lucide-react";
import type { Sale, Payment } from "@/types/pos";

// Helper function
const formatCurrency = (amount: number) => amount.toLocaleString("es-PY");

interface Props {
  sales: Sale[];
  onCancelSale: (id: number, reason: string) => void;
  onReopenSale?: (sale: Sale) => void;
}

export function SalesHistory({ sales, onCancelSale, onReopenSale }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date).toISOString().split("T")[0];
      const matchesDate = !selectedDate || saleDate === selectedDate;
      const matchesSearch = 
        sale.orderNumber.includes(searchTerm) || 
        sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [sales, searchTerm, selectedDate]);

  const getStatusBadge = (status: Sale["status"]) => {
    switch (status) {
      case "completed": return <span style={{ padding: "4px 8px", borderRadius: "4px", background: "#dcfce7", color: "#166534", fontSize: "0.8rem", fontWeight: 700 }}>Completado</span>;
      case "cancelled": return <span style={{ padding: "4px 8px", borderRadius: "4px", background: "#fee2e2", color: "#991b1b", fontSize: "0.8rem", fontWeight: 700 }}>Anulado</span>;
      case "pending": return <span style={{ padding: "4px 8px", borderRadius: "4px", background: "#fef9c3", color: "#854d0e", fontSize: "0.8rem", fontWeight: 700 }}>Pendiente</span>;
      case "partial": return <span style={{ padding: "4px 8px", borderRadius: "4px", background: "#e0f2fe", color: "#075985", fontSize: "0.8rem", fontWeight: 700 }}>Parcial</span>;
      default: return status;
    }
  };

  const getPaymentMethodsString = (payments: Payment[]) => {
    if (!payments || payments.length === 0) return "-";
    const methods = Array.from(new Set(payments.map(p => p.method)));
    return methods.map(m => {
       switch(m) {
         case "cash": return "Efectivo";
         case "card": return "Tarjeta";
         case "qr": return "QR";
         case "transfer": return "Transferencia";
         case "other": return "Otro";
         default: return m;
       }
    }).join(", ");
  };

  const handleReopen = (sale: Sale) => {
    if (onReopenSale) {
        if (confirm("¿Desea reabrir esta venta? Los productos se cargarán al carrito actual.")) {
            onReopenSale(sale);
        }
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileText /> Historial de Ventas
        </h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar por Nro o Cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
             <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
             <input
              type="date"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-gray-600">Nro</th>
              <th className="py-3 px-4 font-semibold text-gray-600">Hora</th>
              <th className="py-3 px-4 font-semibold text-gray-600">Cliente</th>
              <th className="py-3 px-4 font-semibold text-gray-600">Tipo</th>
              <th className="py-3 px-4 font-semibold text-gray-600">Pago</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-right">Total</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-center">Estado</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map(sale => (
              <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-800 font-medium">#{sale.orderNumber}</td>
                <td className="py-3 px-4 text-gray-600">
                  {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-3 px-4 text-gray-800">
                  {sale.customer.name || "Cliente Ocasional"}
                </td>
                <td className="py-3 px-4 text-gray-600 capitalize">
                  {sale.orderType === "delivery" ? "Delivery" : sale.orderType === "pickup" ? "Retiro" : "Local"}
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                  {getPaymentMethodsString(sale.payments)}
                </td>
                <td className="py-3 px-4 text-gray-800 font-bold text-right">
                  Gs. {formatCurrency(sale.total)}
                </td>
                <td className="py-3 px-4 text-center">
                  {getStatusBadge(sale.status)}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      title="Ver Detalle"
                      onClick={() => setSelectedSale(sale)}
                    >
                      <Eye size={18} />
                    </button>
                    {sale.status !== "cancelled" && (
                       <>
                         <button 
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                            title="Modificar / Reabrir"
                            onClick={() => handleReopen(sale)}
                          >
                            <RefreshCw size={18} />
                          </button>
                          <button 
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Anular Venta"
                            onClick={() => {
                              setSelectedSale(sale);
                              // Simple trigger to show modal in details
                            }}
                          >
                            <XCircle size={18} />
                          </button>
                       </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredSales.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  No se encontraron ventas para esta fecha
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Detalle de Venta #{selectedSale.orderNumber}</h3>
              <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Cliente</h4>
                  <p className="font-medium text-gray-800">{selectedSale.customer.name || "Cliente Ocasional"}</p>
                  <p className="text-gray-600">{selectedSale.customer.phone}</p>
                  <p className="text-gray-600">{selectedSale.customer.address}</p>
                  {selectedSale.customer.ruc && <p className="text-gray-600">RUC: {selectedSale.customer.ruc}</p>}
                </div>
                <div className="text-right">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Detalles</h4>
                  <p className="text-gray-600">{new Date(selectedSale.date).toLocaleString()}</p>
                  <p className="text-gray-600 capitalize">Tipo: {selectedSale.orderType}</p>
                  <div className="mt-2">
                     {getStatusBadge(selectedSale.status)}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                      <th className="pb-2">Producto</th>
                      <th className="pb-2 text-center">Cant</th>
                      <th className="pb-2 text-right">Precio</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 text-gray-800">{item.product.name}</td>
                        <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                        <td className="py-2 text-right text-gray-600">{formatCurrency(item.product.price)}</td>
                        <td className="py-2 text-right text-gray-800 font-medium">
                          {formatCurrency(item.product.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-gray-200">
                    <tr>
                      <td colSpan={3} className="pt-3 text-right font-semibold text-gray-600">Subtotal:</td>
                      <td className="pt-3 text-right font-bold text-gray-800">Gs. {formatCurrency(selectedSale.subtotal)}</td>
                    </tr>
                    {selectedSale.discount > 0 && (
                      <tr>
                        <td colSpan={3} className="pt-1 text-right text-gray-600">Descuento:</td>
                        <td className="pt-1 text-right text-red-600">- Gs. {formatCurrency(selectedSale.discount)}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="pt-1 text-right font-bold text-gray-800 text-lg">Total:</td>
                      <td className="pt-1 text-right font-bold text-green-600 text-lg">Gs. {formatCurrency(selectedSale.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

               <div className="mb-6">
                 <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Pagos</h4>
                 <div className="bg-gray-50 rounded-lg p-3">
                   {selectedSale.payments && selectedSale.payments.length > 0 ? (
                     selectedSale.payments.map((p, i) => (
                       <div key={i} className="flex justify-between text-sm mb-1 last:mb-0">
                         <span>
                           {p.method === 'cash' ? 'Efectivo' : p.method === 'card' ? 'Tarjeta' : p.method === 'qr' ? 'QR' : 'Transferencia'}
                           {p.reference && <span className="text-gray-400 ml-2">({p.reference})</span>}
                         </span>
                         <span className="font-medium">Gs. {formatCurrency(p.amount)}</span>
                       </div>
                     ))
                   ) : (
                     <div className="text-gray-400 text-sm">Sin registro de pagos</div>
                   )}
                   <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold">
                     <span>Pagado:</span>
                     <span className="text-green-600">Gs. {formatCurrency(selectedSale.paidAmount || 0)}</span>
                   </div>
                 </div>
               </div>

              {selectedSale.status !== "cancelled" && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Anular Venta</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="Motivo de anulación..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                    <button 
                      className="bg-red-50 text-red-600 px-4 py-2 rounded font-medium hover:bg-red-100 disabled:opacity-50"
                      onClick={() => {
                        onCancelSale(selectedSale.id, cancelReason || "Sin motivo especificado");
                        setSelectedSale(null);
                        setCancelReason("");
                      }}
                      disabled={!cancelReason}
                    >
                      Confirmar Anulación
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white flex items-center gap-2"
                onClick={() => {
                   // Lógica para reimprimir (simulada o llamando a prop)
                   alert("Enviando a imprimir copia...");
                }}
              >
                <Printer size={18} /> Reimprimir Ticket
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                onClick={() => setSelectedSale(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}