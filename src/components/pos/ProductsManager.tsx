import { useState } from "react";
import { Package, Plus, Edit2, Trash2, Save, X, ArrowUp, ArrowDown } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  active: boolean;
}

interface Category {
  id: number;
  name: string;
  active: boolean;
  order: number;
}

interface Props {
  products: Product[];
  categories: Category[];
  onProductsChange: (products: Product[]) => void;
  onCategoriesChange: (categories: Category[]) => void;
}

export function ProductsManager({ products, categories, onProductsChange, onCategoriesChange }: Props) {
  const [activeTab, setActiveTab] = useState<"products" | "categories">("products");
  
  // Estados para productos
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    category: categories[0]?.name || "",
    active: true
  });
  
  // Estados para categorías
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<string>("");
  
  // Funciones para productos
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    
    const product: Product = {
      id: Math.max(0, ...products.map(p => p.id)) + 1,
      name: newProduct.name,
      price: newProduct.price,
      category: newProduct.category || categories[0]?.name || "General",
      active: true
    };
    
    onProductsChange([...products, product]);
    setNewProduct({ name: "", price: 0, category: categories[0]?.name || "", active: true });
  };
  
  const handleUpdateProduct = (product: Product) => {
    onProductsChange(products.map(p => p.id === product.id ? product : p));
    setEditingProduct(null);
  };
  
  const handleDeleteProduct = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      onProductsChange(products.filter(p => p.id !== id));
    }
  };
  
  const handleToggleProductActive = (id: number) => {
    onProductsChange(products.map(p => 
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };
  
  // Funciones para categorías
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    const category: Category = {
      id: Math.max(0, ...categories.map(c => c.id)) + 1,
      name: newCategory.trim(),
      active: true,
      order: categories.length + 1
    };
    
    onCategoriesChange([...categories, category]);
    setNewCategory("");
  };
  
  const handleUpdateCategory = (category: Category) => {
    onCategoriesChange(categories.map(c => c.id === category.id ? category : c));
    setEditingCategory(null);
  };
  
  const handleDeleteCategory = (id: number) => {
    const category = categories.find(c => c.id === id);
    const hasProducts = products.some(p => p.category === category?.name);
    
    if (hasProducts) {
      alert("No se puede eliminar una categoría que tiene productos asignados.");
      return;
    }
    
    if (confirm("¿Estás seguro de eliminar esta categoría?")) {
      onCategoriesChange(categories.filter(c => c.id !== id));
    }
  };
  
  const handleToggleCategoryActive = (id: number) => {
    onCategoriesChange(categories.map(c => 
      c.id === id ? { ...c, active: !c.active } : c
    ));
  };
  
  const handleMoveCategoryUp = (id: number) => {
    const index = categories.findIndex(c => c.id === id);
    if (index <= 0) return;
    
    const newCategories = [...categories];
    const temp = newCategories[index].order;
    newCategories[index].order = newCategories[index - 1].order;
    newCategories[index - 1].order = temp;
    
    onCategoriesChange(newCategories.sort((a, b) => a.order - b.order));
  };
  
  const handleMoveCategoryDown = (id: number) => {
    const index = categories.findIndex(c => c.id === id);
    if (index >= categories.length - 1) return;
    
    const newCategories = [...categories];
    const temp = newCategories[index].order;
    newCategories[index].order = newCategories[index + 1].order;
    newCategories[index + 1].order = temp;
    
    onCategoriesChange(newCategories.sort((a, b) => a.order - b.order));
  };
  
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("es-PY");
  };
  
  // Agrupar productos por categoría
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
  const productsByCategory = sortedCategories.reduce((acc, category) => {
    acc[category.name] = products.filter(p => p.category === category.name);
    return acc;
  }, {} as Record<string, Product[]>);
  
  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
          Productos y Servicios
        </h1>
        <p style={{ color: "#64748b" }}>Gestiona tus productos, categorías y precios</p>
      </div>
      
      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", borderBottom: "2px solid #e2e8f0" }}>
        <button
          onClick={() => setActiveTab("products")}
          style={{
            padding: "0.875rem 1.5rem",
            border: "none",
            background: "none",
            borderBottom: activeTab === "products" ? "3px solid #3b82f6" : "3px solid transparent",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: activeTab === "products" ? "#3b82f6" : "#64748b",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          <Package size={18} style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} />
          Productos
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          style={{
            padding: "0.875rem 1.5rem",
            border: "none",
            background: "none",
            borderBottom: activeTab === "categories" ? "3px solid #3b82f6" : "3px solid transparent",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: activeTab === "categories" ? "#3b82f6" : "#64748b",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          Categorías
        </button>
      </div>
      
      {activeTab === "products" ? (
        <>
          {/* Agregar producto */}
          <div style={{ 
            background: "white", 
            padding: "1.5rem", 
            borderRadius: "12px", 
            marginBottom: "2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem", color: "#0f172a" }}>
              Agregar Nuevo Producto
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr auto", gap: "1rem", alignItems: "end" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={newProduct.name || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Ej: Hamburguesa Clásica"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "0.95rem"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>
                  Precio (Gs.)
                </label>
                <input
                  type="number"
                  value={newProduct.price || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  placeholder="15000"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "0.95rem"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>
                  Categoría
                </label>
                <select
                  value={newProduct.category || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "0.95rem"
                  }}
                >
                  {categories.filter(c => c.active).map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddProduct}
                disabled={!newProduct.name || !newProduct.price}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  opacity: (!newProduct.name || !newProduct.price) ? 0.5 : 1
                }}
              >
                <Plus size={18} />
                Agregar
              </button>
            </div>
          </div>
          
          {/* Lista de productos por categoría */}
          {sortedCategories.map(category => {
            const categoryProducts = productsByCategory[category.name] || [];
            if (categoryProducts.length === 0) return null;
            
            return (
              <div key={category.id} style={{ marginBottom: "2rem" }}>
                <h3 style={{ 
                  fontSize: "1.25rem", 
                  fontWeight: 700, 
                  color: "#0f172a", 
                  marginBottom: "1rem",
                  padding: "0.75rem 0",
                  borderBottom: "2px solid #e2e8f0"
                }}>
                  {category.name} ({categoryProducts.length})
                </h3>
                
                <div style={{ 
                  background: "white", 
                  borderRadius: "12px", 
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                        <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, fontSize: "0.875rem", color: "#475569" }}>
                          Producto
                        </th>
                        <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, fontSize: "0.875rem", color: "#475569" }}>
                          Precio
                        </th>
                        <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, fontSize: "0.875rem", color: "#475569" }}>
                          Estado
                        </th>
                        <th style={{ padding: "1rem", textAlign: "right", fontWeight: 700, fontSize: "0.875rem", color: "#475569" }}>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryProducts.map(product => (
                        <tr key={product.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "1rem" }}>
                            {editingProduct?.id === product.id ? (
                              <input
                                type="text"
                                value={editingProduct.name}
                                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                style={{
                                  padding: "0.5rem",
                                  border: "2px solid #3b82f6",
                                  borderRadius: "6px",
                                  width: "100%"
                                }}
                              />
                            ) : (
                              <span style={{ fontWeight: 600, color: "#0f172a" }}>{product.name}</span>
                            )}
                          </td>
                          <td style={{ padding: "1rem" }}>
                            {editingProduct?.id === product.id ? (
                              <input
                                type="number"
                                value={editingProduct.price}
                                onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                                style={{
                                  padding: "0.5rem",
                                  border: "2px solid #3b82f6",
                                  borderRadius: "6px",
                                  width: "120px"
                                }}
                              />
                            ) : (
                              <span style={{ fontWeight: 700, color: "#10b981" }}>Gs. {formatCurrency(product.price)}</span>
                            )}
                          </td>
                          <td style={{ padding: "1rem" }}>
                            <button
                              onClick={() => handleToggleProductActive(product.id)}
                              style={{
                                padding: "0.375rem 0.875rem",
                                borderRadius: "6px",
                                border: "none",
                                fontWeight: 600,
                                fontSize: "0.8rem",
                                cursor: "pointer",
                                background: product.active ? "#dcfce7" : "#fee2e2",
                                color: product.active ? "#166534" : "#991b1b"
                              }}
                            >
                              {product.active ? "Activo" : "Inactivo"}
                            </button>
                          </td>
                          <td style={{ padding: "1rem", textAlign: "right" }}>
                            {editingProduct?.id === product.id ? (
                              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                <button
                                  onClick={() => handleUpdateProduct(editingProduct)}
                                  style={{
                                    padding: "0.5rem 0.875rem",
                                    background: "#10b981",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.375rem"
                                  }}
                                >
                                  <Save size={16} />
                                  Guardar
                                </button>
                                <button
                                  onClick={() => setEditingProduct(null)}
                                  style={{
                                    padding: "0.5rem 0.875rem",
                                    background: "#64748b",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer"
                                  }}
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                <button
                                  onClick={() => setEditingProduct(product)}
                                  style={{
                                    padding: "0.5rem 0.875rem",
                                    background: "#3b82f6",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.375rem"
                                  }}
                                >
                                  <Edit2 size={16} />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  style={{
                                    padding: "0.5rem 0.875rem",
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer"
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <>
          {/* Agregar categoría */}
          <div style={{ 
            background: "white", 
            padding: "1.5rem", 
            borderRadius: "12px", 
            marginBottom: "2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem", color: "#0f172a" }}>
              Agregar Nueva Categoría
            </h3>
            <div style={{ display: "flex", gap: "1rem", alignItems: "end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Ej: Hamburguesas, Bebidas, Acompañamientos"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "0.95rem"
                  }}
                />
              </div>
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.trim()}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  opacity: !newCategory.trim() ? 0.5 : 1
                }}
              >
                <Plus size={18} />
                Agregar
              </button>
            </div>
          </div>
          
          {/* Lista de categorías */}
          <div style={{ 
            background: "white", 
            borderRadius: "12px", 
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, fontSize: "0.875rem", color: "#475569", width: "80px" }}>
                    Orden
                  </th>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, fontSize: "0.875rem", color: "#475569" }}>
                    Categoría
                  </th>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, fontSize: "0.875rem", color: "#475569" }}>
                    Productos
                  </th>
                  <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, fontSize: "0.875rem", color: "#475569" }}>
                    Estado
                  </th>
                  <th style={{ padding: "1rem", textAlign: "right", fontWeight: 700, fontSize: "0.875rem", color: "#475569" }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCategories.map((category, index) => (
                  <tr key={category.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        <button
                          onClick={() => handleMoveCategoryUp(category.id)}
                          disabled={index === 0}
                          style={{
                            padding: "0.25rem",
                            background: index === 0 ? "#f1f5f9" : "#e2e8f0",
                            border: "none",
                            borderRadius: "4px",
                            cursor: index === 0 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => handleMoveCategoryDown(category.id)}
                          disabled={index === sortedCategories.length - 1}
                          style={{
                            padding: "0.25rem",
                            background: index === sortedCategories.length - 1 ? "#f1f5f9" : "#e2e8f0",
                            border: "none",
                            borderRadius: "4px",
                            cursor: index === sortedCategories.length - 1 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {editingCategory?.id === category.id ? (
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          style={{
                            padding: "0.5rem",
                            border: "2px solid #3b82f6",
                            borderRadius: "6px",
                            width: "100%"
                          }}
                        />
                      ) : (
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>{category.name}</span>
                      )}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ color: "#64748b" }}>
                        {products.filter(p => p.category === category.name).length} productos
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <button
                        onClick={() => handleToggleCategoryActive(category.id)}
                        style={{
                          padding: "0.375rem 0.875rem",
                          borderRadius: "6px",
                          border: "none",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          background: category.active ? "#dcfce7" : "#fee2e2",
                          color: category.active ? "#166534" : "#991b1b"
                        }}
                      >
                        {category.active ? "Activa" : "Inactiva"}
                      </button>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      {editingCategory?.id === category.id ? (
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleUpdateCategory(editingCategory)}
                            style={{
                              padding: "0.5rem 0.875rem",
                              background: "#10b981",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.375rem"
                            }}
                          >
                            <Save size={16} />
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            style={{
                              padding: "0.5rem 0.875rem",
                              background: "#64748b",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => setEditingCategory(category)}
                            style={{
                              padding: "0.5rem 0.875rem",
                              background: "#3b82f6",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.375rem"
                            }}
                          >
                            <Edit2 size={16} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            style={{
                              padding: "0.5rem 0.875rem",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer"
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}