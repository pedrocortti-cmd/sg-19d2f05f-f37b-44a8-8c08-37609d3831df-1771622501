import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Clock,
  ChevronDown,
  Package,
  Users
} from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses'>('sales');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [customDateFrom, setCustomDateFrom] = useState<string>("");
  const [customDateTo, setCustomDateTo] = useState<string>("");

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
          // Ajustar fin del día para 'to'
          const toEndOfDay = new Date(to);
          toEndOfDay.setHours(23, 59, 59, 999);
          return saleDate >= from && saleDate <= toEndOfDay;
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
    <div style={{ 
      padding: '1rem 1rem 2rem 1rem',
      backgroundColor: '#F9FAFB',
      minHeight: '100vh',
      maxWidth: '1600px',
      margin: '0 auto'
    }}>
      {/* Identificador de versión para confirmar que el código nuevo se está cargando */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#10B981',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: '600',
        zIndex: 9999,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        ✅ VERSIÓN ACTUALIZADA - {new Date().toLocaleTimeString()}
      </div>

      {/* Encabezado con selector de fecha */}
      <div className="reports-header">
        <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>Informes</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            className="reports-date-selector"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
          >
            <option value="today">Hoy</option>
            <option value="yesterday">Ayer</option>
            <option value="last7days">Últimos 7 días</option>
            <option value="last30days">Últimos 30 días</option>
            <option value="thisMonth">Este mes</option>
            <option value="lastMonth">Mes anterior</option>
            <option value="all">Todo el período</option>
            <option value="custom">Personalizado</option>
          </select>
          
          {dateFilter === 'custom' && (
            <div className="custom-date-inputs">
              <input 
                type="date" 
                className="date-input"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
              />
              <span>a</span>
              <input 
                type="date" 
                className="date-input"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
              />
            </div>
          )}
        </div>
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

      {/* Tarjetas de métricas principales - TABLE LAYOUT */}
      <table style={{
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '2rem',
        marginBottom: '2rem',
        tableLayout: 'fixed'  // CRÍTICO: Fuerza ancho fijo de columnas
      }}>
        <tbody>
          {/* Fila 1: 3 tarjetas */}
          <tr>
            <td style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              width: '33.33%',
              verticalAlign: 'top',
              display: 'table-cell'  // CRÍTICO: Fuerza comportamiento de celda
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#6B7280',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                VENTAS TOTALES
              </div>
              <div style={{
                fontSize: '2.25rem',
                fontWeight: '700',
                color: '#111827'
              }}>
                Gs. {metrics.totalSales.toLocaleString('es-PY')}
              </div>
            </td>

            <td style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              width: '33.33%',
              verticalAlign: 'top',
              display: 'table-cell'  // CRÍTICO: Fuerza comportamiento de celda
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#6B7280',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                CANTIDAD DE VENTAS
              </div>
              <div style={{
                fontSize: '2.25rem',
                fontWeight: '700',
                color: '#111827'
              }}>
                {metrics.salesCount}
              </div>
            </td>

            <td style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              width: '33.33%',
              verticalAlign: 'top',
              display: 'table-cell'  // CRÍTICO: Fuerza comportamiento de celda
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#6B7280',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                VALOR PROMEDIO DE PEDIDO
              </div>
              <div style={{
                fontSize: '2.25rem',
                fontWeight: '700',
                color: '#111827'
              }}>
                Gs. {metrics.averageOrderValue.toLocaleString('es-PY')}
              </div>
            </td>
          </tr>

          {/* Fila 2: 2 tarjetas */}
          <tr>
            <td style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              verticalAlign: 'top',
              display: 'table-cell'  // CRÍTICO: Fuerza comportamiento de celda
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#6B7280',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                FACTURAS PENDIENTES DE COBRO
              </div>
              <div style={{
                fontSize: '2.25rem',
                fontWeight: '700',
                color: '#111827'
              }}>
                {metrics.pendingInvoices}
              </div>
            </td>

            <td style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              verticalAlign: 'top',
              display: 'table-cell'  // CRÍTICO: Fuerza comportamiento de celda
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#6B7280',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                MONTO TOTAL A COBRAR
              </div>
              <div style={{
                fontSize: '2.25rem',
                fontWeight: '700',
                color: '#111827'
              }}>
                Gs. {metrics.totalPending.toLocaleString('es-PY')}
              </div>
            </td>

            <td style={{
              backgroundColor: 'transparent',
              border: 'none',
              display: 'table-cell'  // CRÍTICO: Fuerza comportamiento de celda
            }}>
              {/* Celda vacía para mantener el layout */}
            </td>
          </tr>
        </tbody>
      </table>

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
    </div>
  );
}