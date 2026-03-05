import { useState, useMemo } from "react";
import { TrendingUp, DollarSign, ShoppingBag, Users, Calendar, Download, BarChart3, PieChart } from "lucide-react";
import type { Sale, Product } from "@/types/pos";
import { formatCurrency } from "@/lib/utils";

interface ReportsProps {
  sales: Sale[];
  products: Product[];
}

export function Reports({ sales, products }: ReportsProps) {
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "all">("today");
  const [reportType, setReportType] = useState<"overview" | "products" | "customers">("overview");

  const filteredSales = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      
      switch (dateRange) {
        case "today":
          return saleDate >= today;
        case "week": {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return saleDate >= weekAgo;
        }
        case "month": {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return saleDate >= monthAgo;
        }
        default:
          return true;
      }
    });
  }, [sales, dateRange]);

  const stats = useMemo(() => {
    const completedSales = filteredSales.filter(s => s.status === "completed");
    const totalSales = completedSales.length;
    const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalItems = completedSales.reduce((sum, sale) => sum + sale.items.length, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    const deliverySales = completedSales.filter(s => s.orderType === "delivery").length;
    const pickupSales = completedSales.filter(s => s.orderType === "pickup").length;
    const localSales = completedSales.filter(s => s.orderType === "local").length;

    const productSales: Record<string, { count: number; revenue: number }> = {};
    completedSales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productSales[item.product.name]) {
          productSales[item.product.name] = { count: 0, revenue: 0 };
        }
        productSales[item.product.name].count += item.quantity;
        productSales[item.product.name].revenue += item.product.price * item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    return {
      totalSales,
      totalRevenue,
      totalItems,
      averageTicket,
      deliverySales,
      pickupSales,
      localSales,
      topProducts
    };
  }, [filteredSales]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b p-6">
        <h1 className="text-2xl font-bold mb-6">📊 Informes</h1>

        <div className="flex gap-3 mb-6">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === "today"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setDateRange("today")}
          >
            Hoy
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === "week"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setDateRange("week")}
          >
            Esta Semana
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === "month"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setDateRange("month")}
          >
            Este Mes
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setDateRange("all")}
          >
            Todo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-600 font-medium">Ventas Totales</span>
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">{stats.totalSales}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-600 font-medium">Ingresos</span>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalRevenue)}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-600 font-medium">Ticket Promedio</span>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.averageTicket)}</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-orange-600 font-medium">Items Vendidos</span>
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-900">{stats.totalItems}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Ventas por Tipo
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">🛵 Delivery</span>
                <span className="font-bold text-blue-600">{stats.deliverySales}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">📦 Para Retirar</span>
                <span className="font-bold text-purple-600">{stats.pickupSales}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">🏠 Local</span>
                <span className="font-bold text-gray-600">{stats.localSales}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Productos Más Vendidos
            </h3>
            <div className="space-y-2">
              {stats.topProducts.slice(0, 5).map(([name, data], index) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {index + 1}. {name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">
                      {data.count} uds.
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(data.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Top 10 Productos
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.topProducts.map(([name, data], index) => (
                  <tr key={name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{name}</td>
                    <td className="px-4 py-3 text-sm text-center font-medium text-gray-900">
                      {data.count} uds.
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600">
                      {formatCurrency(data.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}