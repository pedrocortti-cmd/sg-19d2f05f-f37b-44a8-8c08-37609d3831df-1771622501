import { useState } from "react";
import { Package, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import type { Product, Category } from "@/types/pos";

interface ProductsManagerProps {
  products: Product[];
  categories: Category[];
  onProductsChange: (products: Product[]) => void;
  onCategoriesChange: (categories: Category[]) => void;
}

export function ProductsManager({ products, categories, onProductsChange, onCategoriesChange }: ProductsManagerProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    category: "",
    active: true
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    
    const product: Product = {
      id: Math.max(0, ...products.map(p => p.id)) + 1,
      name: newProduct.name,
      price: newProduct.price,
      category: newProduct.category || "Sin categoría",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onProductsChange([...products, product]);
    setNewProduct({ name: "", price: 0, category: "", active: true });
    setIsAddingProduct(false);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    
    const updatedProducts = products.map(p => 
      p.id === editingProduct.id ? { ...editingProduct, updatedAt: new Date() } : p
    );
    
    onProductsChange(updatedProducts);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      onProductsChange(products.filter(p => p.id !== id));
    }
  };

  const toggleProductActive = (id: number) => {
    const updatedProducts = products.map(p => 
      p.id === id ? { ...p, active: !p.active, updatedAt: new Date() } : p
    );
    onProductsChange(updatedProducts);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
            Productos y Servicios
          </h1>
          <p style={{ color: "#64748b" }}>Gestiona tu catálogo de productos</p>
        </div>
        <button 
          onClick={() => setIsAddingProduct(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.5rem",
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
          }}
        >
          <Plus size={20} />
          Agregar Producto
        </button>
      </div>

      {/* Formulario agregar producto */}
      {isAddingProduct && (
        <div style={{
          background: "white",
          border: "2px solid #e2e8f0",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "2rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
        }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>Nuevo Producto</h3>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Nombre del producto"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              style={{
                padding: "0.75rem",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "0.95rem"
              }}
            />
            <input
              type="number"
              placeholder="Precio"
              value={newProduct.price || ""}
              onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
              style={{
                padding: "0.75rem",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "0.95rem"
              }}
            />
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              style={{
                padding: "0.75rem",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "0.95rem"
              }}
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={handleAddProduct}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1.25rem",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              <Save size={18} />
              Guardar
            </button>
            <button
              onClick={() => {
                setIsAddingProduct(false);
                setNewProduct({ name: "", price: 0, category: "", active: true });
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1.25rem",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              <X size={18} />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de productos */}
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
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, color: "#475569" }}>Producto</th>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, color: "#475569" }}>Categoría</th>
              <th style={{ padding: "1rem", textAlign: "right", fontWeight: 700, color: "#475569" }}>Precio</th>
              <th style={{ padding: "1rem", textAlign: "center", fontWeight: 700, color: "#475569" }}>Estado</th>
              <th style={{ padding: "1rem", textAlign: "center", fontWeight: 700, color: "#475569" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                {editingProduct?.id === product.id ? (
                  <>
                    <td style={{ padding: "1rem" }}>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        style={{
                          padding: "0.5rem",
                          border: "1px solid #e2e8f0",
                          borderRadius: "4px",
                          width: "100%"
                        }}
                      />
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        style={{
                          padding: "0.5rem",
                          border: "1px solid #e2e8f0",
                          borderRadius: "4px",
                          width: "100%"
                        }}
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <input
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        style={{
                          padding: "0.5rem",
                          border: "1px solid #e2e8f0",
                          borderRadius: "4px",
                          width: "100%",
                          textAlign: "right"
                        }}
                      />
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <button
                        onClick={handleUpdateProduct}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "#10b981",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginRight: "0.5rem"
                        }}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingProduct(null)}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        Cancelar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: "1rem", fontWeight: 600 }}>{product.name}</td>
                    <td style={{ padding: "1rem", color: "#64748b" }}>{product.category}</td>
                    <td style={{ padding: "1rem", textAlign: "right", fontWeight: 700, color: "#10b981" }}>
                      Gs. {product.price.toLocaleString("es-PY")}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <button
                        onClick={() => toggleProductActive(product.id)}
                        style={{
                          padding: "0.375rem 0.875rem",
                          background: product.active ? "#10b981" : "#94a3b8",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        {product.active ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <button
                        onClick={() => setEditingProduct(product)}
                        style={{
                          padding: "0.5rem",
                          background: "none",
                          border: "none",
                          color: "#3b82f6",
                          cursor: "pointer",
                          marginRight: "0.5rem"
                        }}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        style={{
                          padding: "0.5rem",
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer"
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}