import { useState, useMemo } from "react";
import { Search, Package, AlertTriangle, TrendingUp, Edit, Save, X } from "lucide-react";
import type { Product } from "@/types/pos";
import { formatCurrency } from "@/lib/utils";

interface InventoryProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
}

export function Inventory({ products, onUpdateProduct }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStock, setEditingStock] = useState<{ productId: number; newStock: number } | null>(null);
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const stock = product.stock || 0;
      
      let matchesFilter = true;
      if (filter === "low") {
        matchesFilter = stock > 0 && stock <= 10;
      } else if (filter === "out") {
        matchesFilter = stock === 0;
      }
      
      return matchesSearch && matchesFilter;
    });
  }, [products, searchTerm, filter]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;
    const outOfStock = products.filter(p => (p.stock || 0) === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
    
    return { totalProducts, lowStock, outOfStock, totalValue };
  }, [products]);

  const handleUpdateStock = (productId: number, adjustment: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, (product.stock || 0) + adjustment);
    onUpdateProduct({ ...product, stock: newStock });
  };

  const handleSaveStock = () => {
    if (!editingStock) return;
    
    const product = products.find(p => p.id === editingStock.productId);
    if (!product) return;

    onUpdateProduct({ ...product, stock: editingStock.newStock });
    setEditingStock(null);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "AGOTADO", color: "bg-red-100 text-red-800" };
    if (stock <= 10) return { label: "BAJO STOCK", color: "bg-orange-100 text-orange-800" };
    return { label: "EN STOCK", color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b p-6">
        <h1 className="text-2xl font-bold mb-6">📦 Inventario</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-600 font-medium">Total Productos</span>
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">{stats.totalProducts}</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-orange-600 font-medium">Bajo Stock</span>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-900">{stats.lowStock}</p>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-red-600 font-medium">Agotados</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-900">{stats.outOfStock}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-600 font-medium">Valor Total</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalValue)}</p>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilter("all")}
          >
            Todos ({products.length})
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "low"
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilter("low")}
          >
            Bajo Stock ({stats.lowStock})
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "out"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilter("out")}
          >
            Agotados ({stats.outOfStock})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Actual
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stock = product.stock || 0;
                const status = getStockStatus(stock);
                const isEditing = editingStock?.productId === product.id;

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(product.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-20 px-2 py-1 border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editingStock.newStock}
                          onChange={(e) =>
                            setEditingStock({
                              ...editingStock,
                              newStock: Math.max(0, Number(e.target.value))
                            })
                          }
                          autoFocus
                        />
                      ) : (
                        <span className="text-lg font-bold text-gray-900">{stock}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.price * stock)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={handleSaveStock}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Guardar"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingStock(null)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleUpdateStock(product.id, -1)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            disabled={stock === 0}
                          >
                            -
                          </button>
                          <button
                            onClick={() =>
                              setEditingStock({ productId: product.id, newStock: stock })
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Editar stock"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStock(product.id, 1)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}