import { useState, useMemo } from "react";
import { Calendar, Search, Eye, XCircle, FileText } from "lucide-react";
import type { Sale } from "@/types/pos";

interface SalesHistoryProps {
  sales: Sale[];
  onCancelSale?: (saleId: number, reason: string) => void;
}

export function SalesHistory({ sales, onCancelSale }: SalesHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSearch = sale.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !dateFilter || new Date(sale.date).toISOString().split("T")[0] === dateFilter;
      return matchesSearch && matchesDate;
    });
  }, [sales, searchTerm, dateFilter]);

  const handleCancelSale = (saleId: number) => {
    const reason = prompt("Motivo de anulación:");
    if (reason && onCancelSale) {
      onCancelSale(saleId, reason);
      setSelectedSale(null);
    }
  };

  const totalSales = useMemo(() => {
    return filteredSales
      .filter(s => s.status === "completed")
      .reduce((sum, sale) => sum + sale.total, 0);
  }, [filteredSales]);

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
          Historial de Ventas
        </h1>
        <p style={{ color: "#64748b" }}>Consulta y gestiona las ventas realizadas</p>
      </div>

      {/* Filtros */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr auto",
        gap: "1rem",
        marginBottom: "2rem",
        background: "white",
        padding: "1.5rem",
        borderRadius: "12px",
        border: "2px solid #e2e8f0"
      }}>
        <div style={{ position: "relative" }}>
          <Search style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} size={20} />
          <input
            type="text"
            placeholder="Buscar por N° pedido o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem 1rem 0.75rem 3rem",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "0.95rem"
            }}
          />
        </div>
        <div style={{ position: "relative" }}>
          <Calendar style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} size={20} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem 1rem 0.75rem 3rem",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "0.95rem"
            }}
          />
        </div>
        <div style={{
          padding: "0.75rem 1.5rem",
          background: "#f1f5f9",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
            Total Ventas
          </div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#10b981" }}>
            Gs. {totalSales.toLocaleString("es-PY")}
          </div>
        </div>
      </div>

      {/* Lista de ventas */}
      <div style={{
        background: "white",
        border: "2px solid #e2e8f0",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, color: "#475569" }}>N° Pedido</th>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, color: "#475569" }}>Fecha</th>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, color: "#475569" }}>Cliente</th>
              <th style={{ padding: "1rem", textAlign: "center", fontWeight: 700, color: "#475569" }}>Tipo</th>
              <th style={{ padding: "1rem", textAlign: "right", fontWeight: 700, color: "#475569" }}>Total</th>
              <th style={{ padding: "1rem", textAlign: "center", fontWeight: 700, color: "#475569" }}>Estado</th>
              <th style={{ padding: "1rem", textAlign: "center", fontWeight: 700, color: "#475569" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
                  No se encontraron ventas
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "1rem", fontWeight: 600 }}>{sale.orderNumber}</td>
                  <td style={{ padding: "1rem", color: "#64748b" }}>
                    {new Date(sale.date).toLocaleString("es-PY")}
                  </td>
                  <td style={{ padding: "1rem" }}>{sale.customer.name || "Sin cliente"}</td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <span style={{
                      padding: "0.375rem 0.75rem",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      background: sale.orderType === "delivery" ? "#dbeafe" : "#fef3c7",
                      color: sale.orderType === "delivery" ? "#1e40af" : "#92400e"
                    }}>
                      {sale.orderType === "delivery" ? "Delivery" : "Retiro"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right", fontWeight: 700, color: "#10b981" }}>
                    Gs. {sale.total.toLocaleString("es-PY")}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <span style={{
                      padding: "0.375rem 0.75rem",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      background: sale.status === "completed" ? "#d1fae5" : "#fee2e2",
                      color: sale.status === "completed" ? "#065f46" : "#991b1b"
                    }}>
                      {sale.status === "completed" ? "Completado" : "Anulado"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <button
                      onClick={() => setSelectedSale(sale)}
                      style={{
                        padding: "0.5rem",
                        background: "none",
                        border: "none",
                        color: "#3b82f6",
                        cursor: "pointer",
                        marginRight: "0.5rem"
                      }}
                      title="Ver detalle"
                    >
                      <Eye size={18} />
                    </button>
                    {sale.status === "completed" && onCancelSale && (
                      <button
                        onClick={() => handleCancelSale(sale.id)}
                        style={{
                          padding: "0.5rem",
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer"
                        }}
                        title="Anular venta"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal detalle de venta */}
      {selectedSale && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }} onClick={() => setSelectedSale(null)}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "2rem",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Pedido #{selectedSale.orderNumber}
                </h2>
                <p style={{ color: "#64748b" }}>
                  {new Date(selectedSale.date).toLocaleString("es-PY")}
                </p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "0.5rem"
                }}
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Cliente */}
            {selectedSale.customer.name && (
              <div style={{
                background: "#f8fafc",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1.5rem"
              }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#475569", marginBottom: "0.75rem" }}>
                  INFORMACIÓN DEL CLIENTE
                </h3>
                <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.95rem" }}>
                  <div><strong>Nombre:</strong> {selectedSale.customer.name}</div>
                  {selectedSale.customer.phone && <div><strong>Teléfono:</strong> {selectedSale.customer.phone}</div>}
                  {selectedSale.customer.address && <div><strong>Dirección:</strong> {selectedSale.customer.address}</div>}
                  {selectedSale.customer.ruc && <div><strong>RUC:</strong> {selectedSale.customer.ruc}</div>}
                </div>
              </div>
            )}

            {/* Items */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#475569", marginBottom: "0.75rem" }}>
                PRODUCTOS
              </h3>
              {selectedSale.items.map((item, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.75rem 0",
                  borderBottom: "1px solid #e2e8f0"
                }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                      Cantidad: {item.quantity} × Gs. {item.product.price.toLocaleString("es-PY")}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    Gs. {(item.product.price * item.quantity).toLocaleString("es-PY")}
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div style={{
              background: "#f8fafc",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>Gs. {selectedSale.subtotal.toLocaleString("es-PY")}</span>
              </div>
              {selectedSale.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span>Descuento:</span>
                  <span style={{ fontWeight: 600, color: "#ef4444" }}>- Gs. {selectedSale.discount.toLocaleString("es-PY")}</span>
                </div>
              )}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "0.75rem",
                borderTop: "2px solid #e2e8f0",
                fontSize: "1.25rem",
                fontWeight: 800
              }}>
                <span>Total:</span>
                <span style={{ color: "#10b981" }}>Gs. {selectedSale.total.toLocaleString("es-PY")}</span>
              </div>
            </div>

            {/* Nota */}
            {selectedSale.note && (
              <div style={{
                background: "#fef3c7",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1rem"
              }}>
                <strong>Nota:</strong> {selectedSale.note}
              </div>
            )}

            {/* Info adicional */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.875rem" }}>
              <div>
                <strong>Tipo:</strong> {selectedSale.orderType === "delivery" ? "Delivery" : "Para Retirar"}
              </div>
              <div>
                <strong>Pago:</strong> {selectedSale.paymentMethod}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}