import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, TrendingUp } from "lucide-react";
import type { Sale, Product as ProductType } from "@/types/pos";

interface ReportsProps {
  sales: Sale[];
  products: ProductType[];
}

type DateFilter = "today" | "yesterday" | "last7days" | "last30days" | "thisMonth" | "lastMonth" | "custom" | "all";

interface ReportMetrics {
  totalSales: number;
  salesCount: number;
  averageOrderValue: number;
  pendingInvoices: number;
  totalPending: number;
}

interface SalesByClient {
  client: string;
  totalSpent: number;
  ordersCount: number;
}

interface ProductSales {
  productName: string;
  quantitySold: number;
  totalRevenue: number;
}

interface PendingByClient {
  client: string;
  pendingAmount: number;
}

export function Reports({ sales, products }: ReportsProps) {
  const [activeTab, setActiveTab] = useState<"sales" | "expenses">("sales");
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");

  // Filtrar ventas según el rango de fechas seleccionado
  const filteredSales = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      
      switch (dateFilter) {
        case "today":
          return saleDate >= today;
        case "yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return saleDate >= yesterday && saleDate < today;
        case "last7days":
          const last7 = new Date(today);
          last7.setDate(last7.getDate() - 7);
          return saleDate >= last7;
        case "last30days":
          const last30 = new Date(today);
          last30.setDate(last30.getDate() - 30);
          return saleDate >= last30;
        case "thisMonth":
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return saleDate >= monthStart;
        case "lastMonth":
          const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          return saleDate >= lastMonthStart && saleDate <= lastMonthEnd;
        case "custom":
          if (!customDateFrom || !customDateTo) return true;
          const from = new Date(customDateFrom);
          const to = new Date(customDateTo);
          return saleDate >= from && saleDate <= to;
        case "all":
          return true;
        default:
          return true;
      }
    });
  }, [sales, dateFilter, customDateFrom, customDateTo]);

  // Calcular métricas del reporte
  const metrics: ReportMetrics = useMemo(() => {
    const completedSales = filteredSales.filter(s => s.status === "completed");
    const totalSales = completedSales.reduce((sum, sale) => sum + sale.total, 0);
    const salesCount = completedSales.length;
    const averageOrderValue = salesCount > 0 ? totalSales / salesCount : 0;
    
    const pendingSales = filteredSales.filter(s => s.status === "pending");
    const pendingInvoices = pendingSales.length;
    const totalPending = pendingSales.reduce((sum, sale) => sum + sale.total, 0);

    return {
      totalSales,
      salesCount,
      averageOrderValue,
      pendingInvoices,
      totalPending
    };
  }, [filteredSales]);

  // Calcular ventas por cliente
  const salesByClient: SalesByClient[] = useMemo(() => {
    const clientMap = new Map<string, { totalSpent: number; ordersCount: number }>();
    
    filteredSales
      .filter(s => s.status === "completed")
      .forEach(sale => {
        const clientName = sale.customerName || "Cliente Anónimo";
        const existing = clientMap.get(clientName) || { totalSpent: 0, ordersCount: 0 };
        clientMap.set(clientName, {
          totalSpent: existing.totalSpent + sale.total,
          ordersCount: existing.ordersCount + 1
        });
      });

    return Array.from(clientMap.entries())
      .map(([client, data]) => ({ client, ...data }))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [filteredSales]);

  // Calcular productos vendidos
  const productSales: ProductSales[] = useMemo(() => {
    const productMap = new Map<string, { quantitySold: number; totalRevenue: number }>();
    
    filteredSales
      .filter(s => s.status === "completed")
      .forEach(sale => {
        sale.items.forEach(item => {
          const existing = productMap.get(item.productName) || { quantitySold: 0, totalRevenue: 0 };
          productMap.set(item.productName, {
            quantitySold: existing.quantitySold + item.quantity,
            totalRevenue: existing.totalRevenue + (item.price * item.quantity)
          });
        });
      });

    return Array.from(productMap.entries())
      .map(([productName, data]) => ({ productName, ...data }))
      .sort((a, b) => b.quantitySold - a.quantitySold);
  }, [filteredSales]);

  // Calcular monto pendiente por cliente
  const pendingByClient: PendingByClient[] = useMemo(() => {
    const clientMap = new Map<string, number>();
    
    filteredSales
      .filter(s => s.status === "pending")
      .forEach(sale => {
        const clientName = sale.customerName || "Cliente Anónimo";
        const existing = clientMap.get(clientName) || 0;
        clientMap.set(clientName, existing + sale.total);
      });

    return Array.from(clientMap.entries())
      .map(([client, pendingAmount]) => ({ client, pendingAmount }))
      .sort((a, b) => b.pendingAmount - a.pendingAmount);
  }, [filteredSales]);

  // Función para exportar a Excel (CSV)
  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Encabezados
    csvContent += "REPORTE DE VENTAS - DE LA GRAN BURGER\n";
    csvContent += `Período: ${getDateFilterLabel()}\n`;
    csvContent += `Fecha de generación: ${new Date().toLocaleString()}\n\n`;
    
    // Métricas principales
    csvContent += "RESUMEN GENERAL\n";
    csvContent += "Métrica,Valor\n";
    csvContent += `Ventas Totales,Gs. ${metrics.totalSales.toLocaleString()}\n`;
    csvContent += `Cantidad de Ventas,${metrics.salesCount}\n`;
    csvContent += `Valor Promedio de Pedido,Gs. ${metrics.averageOrderValue.toLocaleString()}\n`;
    csvContent += `Facturas Pendientes,${metrics.pendingInvoices}\n`;
    csvContent += `Monto Total a Cobrar,Gs. ${metrics.totalPending.toLocaleString()}\n\n`;
    
    // Detalle de ventas
    csvContent += "DETALLE DE VENTAS\n";
    csvContent += "N° Venta,Fecha,Hora,Cliente,Teléfono,Tipo,Total,Estado,Método Pago\n";
    filteredSales.forEach(sale => {
      const date = new Date(sale.date);
      csvContent += `${sale.id},`;
      csvContent += `${date.toLocaleDateString()},`;
      csvContent += `${date.toLocaleTimeString()},`;
      csvContent += `"${sale.customerName || "N/A"}",`;
      csvContent += `${sale.customerPhone || "N/A"},`;
      csvContent += `${sale.type},`;
      csvContent += `${sale.total},`;
      csvContent += `${sale.status},`;
      csvContent += `${sale.payments.map(p => p.method).join(" + ")}\n`;
    });
    
    csvContent += "\n";
    
    // Productos vendidos
    csvContent += "PRODUCTOS VENDIDOS\n";
    csvContent += "Producto,Cantidad Vendida,Ingresos Totales\n";
    productSales.forEach(product => {
      csvContent += `"${product.productName}",${product.quantitySold},Gs. ${product.totalRevenue.toLocaleString()}\n`;
    });
    
    csvContent += "\n";
    
    // Ventas por cliente
    csvContent += "VENTAS POR CLIENTE\n";
    csvContent += "Cliente,Total Gastado,Cantidad de Pedidos\n";
    salesByClient.forEach(client => {
      csvContent += `"${client.client}",Gs. ${client.totalSpent.toLocaleString()},${client.ordersCount}\n`;
    });

    // Crear y descargar el archivo
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case "today": return "Hoy";
      case "yesterday": return "Ayer";
      case "last7days": return "Últimos 7 días";
      case "last30days": return "Últimos 30 días";
      case "thisMonth": return "Este mes";
      case "lastMonth": return "Mes anterior";
      case "custom": return `${customDateFrom} a ${customDateTo}`;
      case "all": return "Todo el período";
      default: return "";
    }
  };

  return (
    <div className="reports-container">
      {/* Encabezado con selector de fecha */}
      <div className="reports-header">
        <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>Informes</h2>
        <select
          className="reports-date-selector"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as DateFilter)}
        >
          <option value="today">Hoy</option>
          <option value="last7days">Últimos 7 días</option>
          <option value="thisMonth">Este mes</option>
          <option value="all">Todo el período</option>
        </select>
      </div>

      {/* Tabs de reportes */}
      <div className="reports-tabs">
        <button 
          className={`reports-tab ${activeTab === "sales" ? "active" : ""}`}
          onClick={() => setActiveTab("sales")}
        >
          📊 REPORTE DE VENTAS
        </button>
        <button 
          className={`reports-tab ${activeTab === "expenses" ? "active" : ""}`}
          onClick={() => setActiveTab("expenses")}
        >
          📉 REPORTE DE GASTOS
        </button>
      </div>

      {/* Tarjetas de métricas principales */}
      <div 
        className="reports-metrics-grid-v2"
        data-layout="horizontal-metrics"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem',
          width: '100%',
          gridAutoFlow: 'row'
        }}
      >
        <div className="reports-metric-card">
          <div className="reports-metric-content">
            <h3 className="reports-metric-label">Ventas Totales</h3>
            <p className="reports-metric-value">
              Gs. {metrics.totalSales.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="reports-metric-card">
          <div className="reports-metric-content">
            <h3 className="reports-metric-label">Cantidad de Ventas</h3>
            <p className="reports-metric-value">{metrics.salesCount}</p>
          </div>
        </div>

        <div className="reports-metric-card">
          <div className="reports-metric-content">
            <h3 className="reports-metric-label">Valor Promedio de Pedido</h3>
            <p className="reports-metric-value">
              Gs. {metrics.averageOrderValue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="reports-metric-card">
          <div className="reports-metric-content">
            <h3 className="reports-metric-label">Facturas Pendientes de Cobro</h3>
            <p className="reports-metric-value">{metrics.pendingInvoices}</p>
          </div>
        </div>

        <div className="reports-metric-card">
          <div className="reports-metric-content">
            <h3 className="reports-metric-label">Monto Total a Cobrar</h3>
            <p className="reports-metric-value">
              Gs. {metrics.totalPending.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tablas detalladas */}
      
      {/* Tabla 1: Ventas por Cliente */}
      <div className="reports-table-container">
        <h3 className="reports-table-title">Ventas por Cliente</h3>
        <table className="reports-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Total Compras</th>
              <th>Cantidad Pedidos</th>
            </tr>
          </thead>
          <tbody>
            {salesByClient.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              salesByClient.map((client, idx) => (
                <tr key={idx}>
                  <td>{client.client}</td>
                  <td>Gs. {client.totalSpent.toLocaleString()}</td>
                  <td>{client.ordersCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tabla 2: Detalle de Productos Vendidos */}
      <div className="reports-table-container">
        <h3 className="reports-table-title">Detalle Productos Vendidos</h3>
        <table className="reports-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Total Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {productSales.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                  No hay productos vendidos
                </td>
              </tr>
            ) : (
              productSales.map((product, idx) => (
                <tr key={idx}>
                  <td>{product.productName}</td>
                  <td>{product.quantitySold}</td>
                  <td>Gs. {product.totalRevenue.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tabla 3: Monto a Cobrar por Cliente */}
      <div className="reports-table-container">
        <h3 className="reports-table-title">Monto a Cobrar por Cliente</h3>
        <table className="reports-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Monto Pendiente</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {pendingByClient.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                  No hay pagos pendientes
                </td>
              </tr>
            ) : (
              pendingByClient.map((payment, idx) => (
                <tr key={idx}>
                  <td>{payment.client}</td>
                  <td>Gs. {payment.pendingAmount.toLocaleString()}</td>
                  <td>Pendiente</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Botón de descarga */}
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <button className="reports-download-btn" onClick={exportToExcel}>
          📥 Descargar Ventas en Excel
        </button>
      </div>

      {activeTab === "expenses" && (
        <div className="report-content">
          <div className="empty-state">
            <TrendingUp size={64} />
            <h3>Reporte de Gastos</h3>
            <p>Esta funcionalidad estará disponible próximamente.</p>
            <p>Aquí podrás ver un análisis detallado de todos los gastos del negocio.</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .reports-container {
          width: 100%;
          height: 100%;
          padding: 2rem;
          overflow-y: auto;
          background: #f8f9fa;
        }

        .reports-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .reports-header h2 {
          font-size: 1.75rem;
          font-weight: 600;
          color: #1a202c;
        }

        .date-filters {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .date-filter-select {
          padding: 0.5rem 1rem;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          font-size: 0.95rem;
          background: white;
          cursor: pointer;
        }

        .custom-date-inputs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .date-input {
          padding: 0.5rem;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .report-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .report-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          font-size: 0.95rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .report-tab.active {
          color: #10b981;
          border-bottom-color: #10b981;
        }

        .report-tab:hover {
          color: #10b981;
        }

        .report-content {
          background: white;
          border-radius: 8px;
          padding: 2rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .metrics-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .metric-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a202c;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .detail-table-container {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .detail-table-container h3 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .detail-table thead {
          background: white;
        }

        .detail-table th {
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #64748b;
          font-size: 0.85rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .detail-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
          color: #1a202c;
        }

        .detail-table tbody tr:hover {
          background: #f1f5f9;
        }

        .table-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .table-pagination button {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #cbd5e0;
          border-radius: 4px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .table-pagination button:hover {
          background: #f1f5f9;
        }

        .table-pagination span {
          padding: 0.5rem 1rem;
          background: #10b981;
          color: white;
          border-radius: 4px;
          font-weight: 600;
        }

        .download-section {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }

        .download-button {
          background: #10b981;
          color: white;
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: background 0.2s;
        }

        .download-button:hover {
          background: #059669;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          color: #64748b;
        }

        .empty-state svg {
          margin-bottom: 1rem;
          color: #cbd5e0;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          font-size: 1rem;
          max-width: 500px;
          line-height: 1.6;
        }

        @media (max-width: 1200px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .details-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .reports-header {
            flex-direction: column;
            gap: 1rem;
          }

          .metrics-grid,
          .metrics-grid-2 {
            grid-template-columns: 1fr;
          }

          .report-tabs {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}