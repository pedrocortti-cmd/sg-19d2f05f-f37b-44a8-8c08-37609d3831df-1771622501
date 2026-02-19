import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
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

  // Función para exportar a Excel
  const exportToExcel = () => {
    if (filteredSales.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    // Preparar datos en el formato del screenshot
    const excelData: any[] = [];

    // Encabezados
    excelData.push([
      "ID",
      "Fecha",
      "Nombre del Cliente",
      "Total",
      "Repartidor",
      "Monto Delivery",
      "Pagado",
      "Saldo",
      "Método de Pago",
      "Monto",
      "Pagado",
      "Nombre del Producto",
      "Cantidad",
      "Precio Unitario",
      "Total del Producto",
    ]);

    // Procesar cada venta con orden ascendente (más antigua primero)
    const sortedSales = [...filteredSales].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    sortedSales.forEach((sale) => {
      const saleDate = new Date(sale.date);
      const formattedDate = `${saleDate.getDate()}/${saleDate.getMonth() + 1}/${saleDate.getFullYear()} ${saleDate.getHours()}:${String(saleDate.getMinutes()).padStart(2, "0")}`;

      const customerName = sale.customer?.name || sale.customerName || "";
      const total = sale.total || 0;
      // Usar deliveryDriverName si deliveryPerson no está definido
      const deliveryPerson = sale.deliveryPerson || sale.deliveryDriverName || "";
      const paymentStatus = sale.paymentStatus || (sale.status === "completed" ? "Pagado" : "Pendiente");
      const balance = sale.balance || 0;
      const paymentMethod = sale.paymentMethod || "cash";
      const amountPaid = sale.amountPaid || (sale.status === "completed" ? total : 0);

      // Usar deliveryCost directamente de la venta
      const deliveryAmount = sale.deliveryCost || 0;

      console.log(`=== VENTA ID: ${sale.id} ===`);
      console.log("deliveryCost:", sale.deliveryCost);
      console.log("Monto Delivery Total:", deliveryAmount);
      console.log("================");

      // Si la venta no tiene items, crear una fila con la información básica
      if (!sale.items || sale.items.length === 0) {
        const row: any[] = [
          sale.id,
          formattedDate,
          customerName,
          total,
          deliveryPerson,
          deliveryAmount,
          paymentStatus,
          balance,
          paymentMethod,
          amountPaid,
          "",
          "",
          "",
          "",
          ""
        ];
        excelData.push(row);
        return;
      }

      // Agregar una fila por cada item en la venta
      sale.items.forEach((item, itemIndex) => {
        const row: any[] = [];

        // Primera fila: información completa de la venta
        if (itemIndex === 0) {
          row.push(
            sale.id,
            formattedDate,
            customerName,
            total,
            deliveryPerson,
            deliveryAmount,
            paymentStatus,
            balance,
            paymentMethod,
            amountPaid,
            ""
          );
        } else {
          // Filas subsecuentes: celdas vacías para info de venta
          row.push("", "", "", "", "", "", "", "", "", "", "");
        }

        // Información del producto (siempre)
        row.push(
          item.productName || "", // Solo usar productName que es garantizado en SaleItem
          item.quantity || 0,
          item.price || 0,
          (item.quantity || 0) * (item.price || 0)
        );

        excelData.push(row);
      });
    });

    // Crear libro de Excel
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Ajustar anchos de columnas
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 18 },  // Fecha
      { wch: 20 },  // Nombre del Cliente
      { wch: 10 },  // Total
      { wch: 12 },  // Repartidor
      { wch: 12 },  // Monto Delivery
      { wch: 10 },  // Pagado
      { wch: 8 },   // Saldo
      { wch: 15 },  // Método de Pago
      { wch: 10 },  // Monto
      { wch: 8 },   // Pagado
      { wch: 40 },  // Nombre del Producto
      { wch: 10 },  // Cantidad
      { wch: 15 },  // Precio Unitario
      { wch: 18 },  // Total del Producto
    ];
    worksheet["!cols"] = columnWidths;

    // Crear libro y agregar hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");

    // Generar nombre de archivo con fecha
    const today = new Date();
    const fileName = `Ventas_${today.getDate()}-${
      today.getMonth() + 1
    }-${today.getFullYear()}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(workbook, fileName);
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

  return (
    <div style={{ 
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      padding: '1.5rem'
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
        ✅ GRID REDESIGN - {new Date().toLocaleTimeString()}
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
            Gs. {metrics.totalSales.toLocaleString('es-PY')}
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
            Gs. {metrics.averageOrderValue.toLocaleString('es-PY')}
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
            Gs. {metrics.totalPending.toLocaleString('es-PY')}
          </div>
        </div>
      </div>

      {/* DETALLE DE VENTAS - 3 TABLAS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1.5rem",
        marginTop: "2rem",
      }}>
        {/* VENTAS POR CLIENTE */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}>
          <h3 style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "1rem",
          }}>
            Ventas por Cliente
          </h3>
          
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{
                    textAlign: "left",
                    padding: "0.75rem 0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#475569",
                  }}>
                    Cliente
                    <button
                      onClick={() => setCustomerSort(customerSort === "desc" ? "asc" : "desc")}
                      style={{
                        marginLeft: "0.5rem",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                        fontSize: "0.75rem",
                      }}
                    >
                      {customerSort === "desc" ? "↓" : "↑"}
                    </button>
                  </th>
                  <th style={{
                    textAlign: "right",
                    padding: "0.75rem 0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#475569",
                  }}>
                    Total Gastado
                    <button
                      onClick={() => setCustomerSort(customerSort === "desc" ? "asc" : "desc")}
                      style={{
                        marginLeft: "0.5rem",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                        fontSize: "0.75rem",
                      }}
                    >
                      {customerSort === "desc" ? "↓" : "↑"}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginateData(sortedCustomers, customerPage).map((item, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{
                      padding: "0.75rem 0.5rem",
                      fontSize: "0.875rem",
                      color: "#1e293b",
                    }}>
                      {item.client}
                    </td>
                    <td style={{
                      padding: "0.75rem 0.5rem",
                      fontSize: "0.875rem",
                      color: "#1e293b",
                      textAlign: "right",
                      fontWeight: 600,
                    }}>
                      Gs. {item.totalSpent.toLocaleString('es-PY')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination(customerPage, getTotalPages(sortedCustomers.length), setCustomerPage)}
        </div>

        {/* DETALLE PRODUCTOS VENDIDOS */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}>
          <h3 style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "1rem",
          }}>
            Detalle Productos Vendidos
          </h3>
          
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{
                    textAlign: "left",
                    padding: "0.75rem 0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#475569",
                  }}>
                    Producto
                    <button
                      onClick={() => setProductSort(productSort === "desc" ? "asc" : "desc")}
                      style={{
                        marginLeft: "0.5rem",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                        fontSize: "0.75rem",
                      }}
                    >
                      {productSort === "desc" ? "↓" : "↑"}
                    </button>
                  </th>
                  <th style={{
                    textAlign: "right",
                    padding: "0.75rem 0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#475569",
                  }}>
                    Cantidad Vendida
                    <button
                      onClick={() => setProductSort(productSort === "desc" ? "asc" : "desc")}
                      style={{
                        marginLeft: "0.5rem",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                        fontSize: "0.75rem",
                      }}
                    >
                      {productSort === "desc" ? "↓" : "↑"}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginateData(sortedProducts, productPage).map((item, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{
                      padding: "0.75rem 0.5rem",
                      fontSize: "0.875rem",
                      color: "#1e293b",
                    }}>
                      {item.productName}
                    </td>
                    <td style={{
                      padding: "0.75rem 0.5rem",
                      fontSize: "0.875rem",
                      color: "#1e293b",
                      textAlign: "right",
                      fontWeight: 600,
                    }}>
                      {item.quantitySold}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination(productPage, getTotalPages(sortedProducts.length), setProductPage)}
        </div>

        {/* MONTO A COBRAR POR CLIENTE */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}>
          <h3 style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "1rem",
          }}>
            Monto a Cobrar por Cliente
          </h3>
          
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{
                    textAlign: "left",
                    padding: "0.75rem 0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#475569",
                  }}>
                    Cliente
                    <button
                      onClick={() => setPendingSort(pendingSort === "desc" ? "asc" : "desc")}
                      style={{
                        marginLeft: "0.5rem",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                        fontSize: "0.75rem",
                      }}
                    >
                      {pendingSort === "desc" ? "↓" : "↑"}
                    </button>
                  </th>
                  <th style={{
                    textAlign: "right",
                    padding: "0.75rem 0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#475569",
                  }}>
                    Monto Adeudado
                    <button
                      onClick={() => setPendingSort(pendingSort === "desc" ? "asc" : "desc")}
                      style={{
                        marginLeft: "0.5rem",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                        fontSize: "0.75rem",
                      }}
                    >
                      {pendingSort === "desc" ? "↓" : "↑"}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginateData(sortedPending, pendingPage).map((item, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{
                      padding: "0.75rem 0.5rem",
                      fontSize: "0.875rem",
                      color: "#1e293b",
                    }}>
                      {item.client}
                    </td>
                    <td style={{
                      padding: "0.75rem 0.5rem",
                      fontSize: "0.875rem",
                      color: "#1e293b",
                      textAlign: "right",
                      fontWeight: 600,
                    }}>
                      Gs. {item.pendingAmount.toLocaleString('es-PY')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination(pendingPage, getTotalPages(sortedPending.length), setPendingPage)}
        </div>
      </div>

      {/* BOTÓN EXPORTAR EXCEL */}
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <Button
          onClick={exportToExcel}
          style={{
            background: "#10b981",
            color: "white",
            padding: "1rem 2rem",
            fontSize: "1rem",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)",
          }}
        >
          Descargar Ventas en Excel
        </Button>
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