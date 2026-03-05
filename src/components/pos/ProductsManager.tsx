import { useState } from "react";
import { Plus, Edit, Trash2, X, Check, Search } from "lucide-react";
import type { Product, Category } from "@/types/pos";
import { formatCurrency } from "@/lib/utils";

interface ProductsManagerProps {
  products: Product[];
  categories: Category[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
  onSaveCategory: (category: Category) => void;
  onDeleteCategory: (id: number) => void;
}

export function ProductsManager({
  products,
  categories,
  onSaveProduct,
  onDeleteProduct,
  onSaveCategory,
  onDeleteCategory
}: ProductsManagerProps) {
  const [activeTab, setActiveTab] = useState<"products" | "categories">("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveProduct = () => {
    if (editingProduct && editingProduct.name && editingProduct.price > 0) {
      onSaveProduct(editingProduct);
      setEditingProduct(null);
      setShowProductForm(false);
    }
  };

  const handleSaveCategory = () => {
    if (editingCategory && editingCategory.name) {
      onSaveCategory(editingCategory);
      setEditingCategory(null);
      setShowCategoryForm(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b p-6">
        <h1 className="text-2xl font-bold mb-4">🎯 Productos y Servicios</h1>
        
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "products"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab("products")}
          >
            Productos
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "categories"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab("categories")}
          >
            Categorías
          </button>
        </div>

        {activeTab === "products" && (
          <div className="flex gap-3">
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
            <button
              onClick={() => {
                setEditingProduct({
                  id: Date.now(),
                  name: "",
                  price: 0,
                  categoryId: categories[0]?.id || 1,
                  active: true
                });
                setShowProductForm(true);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
          </div>
        )}

        {activeTab === "categories" && (
          <button
            onClick={() => {
              setEditingCategory({
                id: Date.now(),
                name: "",
                icon: "📦",
                active: true
              });
              setShowCategoryForm(true);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Categoría
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "products" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-lg shadow p-4 border-2 ${
                  product.active ? "border-green-200" : "border-gray-200 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-600">
                      {categories.find((c) => c.id === product.categoryId)?.name || "Sin categoría"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowProductForm(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar ${product.name}?`)) {
                          onDeleteProduct(product.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(product.price)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    product.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {product.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "categories" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`bg-white rounded-lg shadow p-4 border-2 ${
                  category.active ? "border-blue-200" : "border-gray-200 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <h3 className="font-bold">{category.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        category.active ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {category.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setShowCategoryForm(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {category.id !== 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar ${category.name}?`)) {
                            onDeleteCategory(category.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showProductForm && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {products.find((p) => p.id === editingProduct.id) ? "Editar" : "Nuevo"} Producto
              </h3>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(false);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  placeholder="Ej: Hamburguesa Clásica"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Precio</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingProduct.price || ""}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                  }
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingProduct.categoryId}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, categoryId: Number(e.target.value) })
                  }
                >
                  {categories
                    .filter((c) => c.id !== 1)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  className="w-4 h-4"
                  checked={editingProduct.active}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, active: e.target.checked })
                  }
                />
                <label htmlFor="active" className="text-sm font-medium">
                  Producto activo
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveProduct}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductForm(false);
                  }}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCategoryForm && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {categories.find((c) => c.id === editingCategory.id) ? "Editar" : "Nueva"} Categoría
              </h3>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryForm(false);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  placeholder="Ej: Hamburguesas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Icono (emoji)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl"
                  value={editingCategory.icon}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, icon: e.target.value })
                  }
                  placeholder="🍔"
                  maxLength={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="categoryActive"
                  className="w-4 h-4"
                  checked={editingCategory.active}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, active: e.target.checked })
                  }
                />
                <label htmlFor="categoryActive" className="text-sm font-medium">
                  Categoría activa
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveCategory}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setShowCategoryForm(false);
                  }}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}