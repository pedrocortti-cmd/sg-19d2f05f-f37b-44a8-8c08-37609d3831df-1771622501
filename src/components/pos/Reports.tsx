import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function Reports({ sales, products }: ReportsProps) {
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses'>('sales');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [customDateFrom, setCustomDateFrom] = useState<string>("");
  const [customDateTo, setCustomDateTo] = useState<string>("");

  // Estados para paginación
  const [customerPage, setCustomerPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para ordenamiento
  const [customerSort, setCustomerSort] = useState<"asc" | "desc">("desc");
  const [productSort, setProductSort] = useState<"asc" | "desc">("desc");
  const [pendingSort, setPendingSort] = useState<"asc" | "desc">("desc");

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
        const clientName = sale.customer?.name || "Cliente Anónimo";
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
        const clientName = sale.customer?.name || "Cliente Anónimo";
        const existing = clientMap.get(clientName) || 0;
        clientMap.set(clientName, existing + sale.total);
      });

    return Array.from(clientMap.entries())
      .map(([client, pendingAmount]) => ({ client, pendingAmount }))
      .sort((a, b) => b.pendingAmount - a.pendingAmount);
  }, [filteredSales]);

  // Funciones de ordenamiento
  const sortedCustomers = useMemo(() => {
    const sorted = [...salesByClient].sort((a, b) => 
      customerSort === "desc" ? b.totalSpent - a.totalSpent : a.totalSpent - b.totalSpent
    );
    return sorted;
  }, [customerSort, salesByClient]);

  const sortedProducts = useMemo(() => {
    const sorted = [...productSales].sort((a, b) => 
      productSort === "desc" ? b.quantitySold - a.quantitySold : a.quantitySold - b.quantitySold
    );
    return sorted;
  }, [productSort, productSales]);

  const sortedPending = useMemo(() => {
    const sorted = [...pendingByClient].sort((a, b) => 
      pendingSort === "desc" ? b.pendingAmount - a.pendingAmount : a.pendingAmount - b.pendingAmount
    );
    return sorted;
  }, [pendingSort, pendingByClient]);

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case "today": return `Hoy (${format(new Date(), "dd/MM/yyyy")})`;
      case "yesterday": {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return `Ayer (${format(d, "dd/MM/yyyy")})`;
      }
      case "last7days": return "Últimos 7 días";
      case "last30days": return "Últimos 30 días";
      case "thisMonth": return `Este mes (${format(new Date(), "MMMM", { locale: es })})`;
      case "lastMonth": return "Mes anterior";
      case "custom": return `${customDateFrom} a ${customDateTo}`;
      case "all": return "Todo el período";
      default: return "";
    }
  };

  // Exportar todas las ventas a Excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Preparar datos detallados por producto
    const detailedData: any[] = [];
    
    // Encabezados
    detailedData.push([
      "ID",
      "Fecha",
      "Nombre del Cliente",
      "Total",
      "Repartidor",
      "Monto Delivery",
      "Pago",
      "Saldo",
      "Método de Pago",
      "Monto Pagado",
      "Nombre del Producto",
      "Cantidad",
      "Precio Unitario",
      "Total del Producto"
    ]);
    
    // Recorrer ventas filtradas
    filteredSales.forEach((sale) => {
      const customerName = sale.customer?.name || "";
      const deliveryDriver = sale.deliveryDriverName || "";
      const deliveryCost = sale.deliveryCost || 0;
      const status = sale.status === "completed" ? "Pagado" : "Pendiente";
      const balance = sale.status === "completed" ? 0 : sale.total;
      const paymentMethod = sale.payments && sale.payments.length > 0 
        ? sale.payments.map(p => p.method).join(", ") 
        : "";
      const amountPaid = sale.status === "completed" ? sale.total : 0;
      
      // Agregar una fila por cada producto
      sale.items.forEach((item, index) => {
        detailedData.push([
          index === 0 ? sale.saleNumber : "", // ID solo en la primera fila
          index === 0 ? format(new Date(sale.date), "dd/MM/yyyy HH:mm") : "", // Fecha solo en la primera fila
          index === 0 ? customerName : "",
          index === 0 ? sale.total : "",
          index === 0 ? deliveryDriver : "",
          index === 0 ? deliveryCost : "",
          index === 0 ? status : "",
          index === 0 ? balance : "",
          index === 0 ? paymentMethod : "",
          index === 0 ? amountPaid : "",
          item.productName,
          item.quantity,
          item.price,
          item.price * item.quantity
        ]);
      });
      
      // Si la venta tiene delivery cost como item separado, agregar fila adicional
      if (deliveryCost > 0 && sale.items.length > 0) {
        detailedData.push([
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          `Delivery ${deliveryCost}`,
          1,
          deliveryCost,
          deliveryCost
        ]);
      }
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet(detailedData);
    
    // Ajustar ancho de columnas
    worksheet["!cols"] = [
      { wch: 8 },  // ID
      { wch: 16 }, // Fecha
      { wch: 20 }, // Nombre del Cliente
      { wch: 10 }, // Total
      { wch: 15 }, // Repartidor
      { wch: 12 }, // Monto Delivery
      { wch: 10 }, // Pago
      { wch: 10 }, // Saldo
      { wch: 15 }, // Método de Pago
      { wch: 12 }, // Monto Pagado
      { wch: 30 }, // Nombre del Producto
      { wch: 10 }, // Cantidad
      { wch: 12 }, // Precio Unitario
      { wch: 15 }  // Total del Producto
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas Detalladas");
    XLSX.writeFile(workbook, `ventas-detalladas-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  // Exportar solo Ventas por Cliente
  const exportSalesByClient = () => {
    const workbook = XLSX.utils.book_new();
    
    const data = [
      ["VENTAS POR CLIENTE"],
      [],
      ["Período:", getDateFilterLabel()],
      [],
      ["Cliente", "Total Gastado"],
      ...sortedCustomers.map((item) => [
        item.client || "Cliente sin nombre",
        item.totalSpent
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet["!cols"] = [{ wch: 30 }, { wch: 15 }];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas por Cliente");
    XLSX.writeFile(workbook, `ventas-por-cliente-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  // Exportar solo Productos Vendidos
  const exportProductsSold = () => {
    const workbook = XLSX.utils.book_new();
    
    const data = [
      ["DETALLE PRODUCTOS VENDIDOS"],
      [],
      ["Período:", getDateFilterLabel()],
      [],
      ["Producto", "Cantidad Vendida"],
      ...sortedProducts.map((item) => [
        item.productName,
        item.quantitySold
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet["!cols"] = [{ wch: 30 }, { wch: 18 }];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos Vendidos");
    XLSX.writeFile(workbook, `productos-vendidos-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  // Exportar solo Cuentas por Cobrar
  const exportPendingAccounts = () => {
    const workbook = XLSX.utils.book_new();
    
    const data = [
      ["MONTO A COBRAR POR CLIENTE"],
      [],
      ["Período:", getDateFilterLabel()],
      [],
      ["Cliente", "Monto Adeudado"],
      ...sortedPending.map((item) => [
        item.client || "Cliente sin nombre",
        item.pendingAmount
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet["!cols"] = [{ wch: 30 }, { wch: 15 }];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cuentas por Cobrar");
    XLSX.writeFile(workbook, `cuentas-por-cobrar-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  // Funciones de paginación
  const paginateData = (data: any[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength: number) => {
    return Math.ceil(dataLength / itemsPerPage);
  };

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    setPage: (page: number) => void
  ) => {
    const pages = [];
    
    // Botón Anterior
    pages.push(
      <button
        key="prev"
        onClick={() => setPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={{
          padding: "0.5rem 1rem",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          background: currentPage === 1 ? "#f1f5f9" : "white",
          color: currentPage === 1 ? "#94a3b8" : "#475569",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          fontWeight: 500,
          fontSize: "0.875rem",
        }}
      >
        Anterior
      </button>
    );

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(
          <button
            key={i}
            onClick={() => setPage(i)}
            style={{
              padding: "0.5rem 0.875rem",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              background: currentPage === i ? "#3b82f6" : "white",
              color: currentPage === i ? "white" : "#475569",
              cursor: "pointer",
              fontWeight: currentPage === i ? 700 : 500,
              fontSize: "0.875rem",
            }}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(
          <span key={i} style={{ padding: "0.5rem", color: "#94a3b8" }}>
            ...
          </span>
        );
      }
    }

    // Botón Siguiente
    pages.push(
      <button
        key="next"
        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={{
          padding: "0.5rem 1rem",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          background: currentPage === totalPages ? "#f1f5f9" : "white",
          color: currentPage === totalPages ? "#94a3b8" : "#475569",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          fontWeight: 500,
          fontSize: "0.875rem",
        }}
      >
        Siguiente
      </button>
    );

    return (
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem" }}>
        {pages}
      </div>
    );
  };

  const renderTable = (
    title: string,
    headers: string[],
    data: [string, number][],
    currentPage: number,
    setPage: (page: number) => void,
    exportFunction?: () => void
  ) => {
    const totalPages = getTotalPages(data.length);
    const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
      <div style={{ 
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        height: 'fit-content'
      }}>
        <h3 style={{ 
          fontSize: '1.1rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#2c3e50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {title}
          {exportFunction && (
            <button
              onClick={exportFunction}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#059669';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#10b981';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              title="Exportar esta tabla a Excel"
            >
              📊 Excel
            </button>
          )}
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {headers.map((header, i) => (
                  <th key={i} style={{ 
                    textAlign: i === 0 ? 'left' : 'right',
                    padding: '0.75rem 0.5rem',
                    color: '#64748b',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}>
                    {header} ↕
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ 
                    padding: '0.75rem 0.5rem',
                    color: '#334155',
                    fontWeight: '500'
                  }}>
                    {row[0]}
                  </td>
                  <td style={{ 
                    padding: '0.75rem 0.5rem',
                    textAlign: 'right',
                    color: '#1e293b',
                    fontFamily: 'monospace'
                  }}>
                    {headers[1].includes("Monto") || headers[1].includes("Total") 
                      ? formatCurrency(row[1]) 
                      : row[1]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && renderPagination(currentPage, totalPages, setPage)}
      </div>
    );
  };

  return (
    <div style={{ 
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      padding: '1.5rem',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Identificador de versión */}
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
        ✅ EXPORT BUTTONS ADDED - {new Date().toLocaleTimeString()}
      </div>

      {/* Encabezado con selector de fecha Y BOTÓN EXPORTAR */}
      <div className="reports-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>Informes</h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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

          {/* BOTÓN EXPORTAR MOVIDO AL HEADER */}
          <Button
            onClick={exportToExcel}
            disabled={filteredSales.length === 0}
            style={{
              background: filteredSales.length === 0 ? "#94a3b8" : "#10b981",
              color: "white",
              padding: "0.75rem 1.5rem",
              fontSize: "0.875rem",
              border: "none",
              borderRadius: "8px",
              cursor: filteredSales.length === 0 ? "not-allowed" : "pointer",
              fontWeight: "600",
              boxShadow: filteredSales.length === 0 ? "none" : "0 4px 6px rgba(16, 185, 129, 0.3)",
              whiteSpace: 'nowrap'
            }}
          >
            📥 Exportar General
          </Button>
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

      {/* GRID DE MÉTRICAS PRINCIPALES - CSS GRID AUTO-FIT */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem',
        width: '100%'
      }}>
        {/* Tarjeta 1: Ventas Totales */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
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
            {formatCurrency(metrics.totalSales)}
          </div>
        </div>

        {/* Tarjeta 2: Cantidad de Ventas */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
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
        </div>

        {/* Tarjeta 3: Valor Promedio de Pedido */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
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
            {formatCurrency(metrics.averageOrderValue)}
          </div>
        </div>
      </div>

      {/* SEGUNDA FILA DE MÉTRICAS - 2 COLUMNAS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
        width: '100%'
      }}>
        {/* Tarjeta 4: Facturas Pendientes */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
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
        </div>

        {/* Tarjeta 5: Monto Total a Cobrar */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
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
            {formatCurrency(metrics.totalPending)}
          </div>
        </div>
      </div>

      {/* DETALLE DE VENTAS - 3 TABLAS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1.5rem",
        marginTop: "2rem",
      }}>
        {renderTable(
          "VENTAS POR CLIENTE",
          ["Cliente", "Total Gastado"],
          sortedCustomers.map(c => [c.client || "Anónimo", c.totalSpent]),
          customerPage,
          setCustomerPage,
          exportSalesByClient
        )}

        {renderTable(
          "DETALLE PRODUCTOS VENDIDOS",
          ["Producto", "Cantidad Vendida"],
          sortedProducts.map(p => [p.productName, p.quantitySold]),
          productPage,
          setProductPage,
          exportProductsSold
        )}

        {renderTable(
          "MONTO A COBRAR POR CLIENTE",
          ["Cliente", "Monto Adeudado"],
          sortedPending.map(p => [p.client || "Anónimo", p.pendingAmount]),
          pendingPage,
          setPendingPage,
          exportPendingAccounts
        )}
      </div>

      {/* MENSAJE CUANDO NO HAY DATOS */}
      {filteredSales.length === 0 && (
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "3rem",
          textAlign: "center",
          marginTop: "2rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}>
          <div style={{
            fontSize: "3rem",
            marginBottom: "1rem"
          }}>
            📊
          </div>
          <h3 style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#475569",
            marginBottom: "0.5rem"
          }}>
            No hay ventas en este período
          </h3>
          <p style={{
            fontSize: "0.875rem",
            color: "#94a3b8"
          }}>
            Selecciona otro rango de fechas para ver los informes
          </p>
        </div>
      )}

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