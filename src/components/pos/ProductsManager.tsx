import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, Search, Folder } from "lucide-react";
import type { Product, Category } from "@/types/pos";

interface ProductsManagerProps {
  products: Product[];
  categories?: Category[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onSaveCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: number) => void;
}

export function ProductsManager({ 
  products, 
  categories = [], 
  onSaveProduct, 
  onDeleteProduct,
  onSaveCategory,
  onDeleteCategory
}: ProductsManagerProps) {
  const [activeTab, setActiveTab] = useState<"products" | "categories">("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Product dialog states
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isEditProductMode, setIsEditProductMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    categoryId: 0,
    active: true,
  });

  // Category dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isEditCategoryMode, setIsEditCategoryMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({
    name: "",
    icon: "",
    active: true,
  });

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      product.categoryId === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Handle create/update product
  const handleSaveProduct = () => {
    const productToSave = {
      ...currentProduct,
      id: isEditProductMode && currentProduct.id ? currentProduct.id : Math.max(...products.map((p) => p.id), 0) + 1,
    } as Product;
    
    onSaveProduct(productToSave);
    handleCloseProductDialog();
  };

  // Handle delete product
  const handleDeleteProduct = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      onDeleteProduct(id);
    }
  };

  // Handle toggle product active status
  const handleToggleProductActive = (product: Product) => {
    onSaveProduct({ ...product, active: !product.active });
  };

  // Handle open product dialog
  const handleOpenProductDialog = (product?: Product) => {
    if (product) {
      setIsEditProductMode(true);
      setCurrentProduct(product);
    } else {
      setIsEditProductMode(false);
      setCurrentProduct({
        name: "",
        price: 0,
        categoryId: categories[0]?.id || 1,
        active: true,
      });
    }
    setIsProductDialogOpen(true);
  };

  // Handle close product dialog
  const handleCloseProductDialog = () => {
    setIsProductDialogOpen(false);
    setCurrentProduct({
      name: "",
      price: 0,
      categoryId: 0,
      active: true,
    });
  };

  // Handle create/update category
  const handleSaveCategory = () => {
    if (!onSaveCategory) return;
    
    const categoryToSave = {
      ...currentCategory,
      id: isEditCategoryMode && currentCategory.id ? currentCategory.id : Math.max(...categories.map((c) => c.id), 0) + 1,
    } as Category;
    
    onSaveCategory(categoryToSave);
    handleCloseCategoryDialog();
  };

  // Handle delete category
  const handleDeleteCategory = (id: number) => {
    if (!onDeleteCategory) return;
    
    if (id === 1) {
      alert('No puedes eliminar la categoría "Todos"');
      return;
    }
    
    if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      onDeleteCategory(id);
    }
  };

  // Handle toggle category active status
  const handleToggleCategoryActive = (category: Category) => {
    if (!onSaveCategory) return;
    
    if (category.id === 1) {
      alert('No puedes desactivar la categoría "Todos"');
      return;
    }
    
    onSaveCategory({ ...category, active: !category.active });
  };

  // Handle open category dialog
  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setIsEditCategoryMode(true);
      setCurrentCategory(category);
    } else {
      setIsEditCategoryMode(false);
      setCurrentCategory({
        name: "",
        icon: "🍔",
        active: true,
      });
    }
    setIsCategoryDialogOpen(true);
  };

  // Handle close category dialog
  const handleCloseCategoryDialog = () => {
    setIsCategoryDialogOpen(false);
    setCurrentCategory({
      name: "",
      icon: "",
      active: true,
    });
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `Gs. ${amount.toLocaleString("es-PY")}`;
  };

  // Get category name
  const getCategoryName = (categoryId: number): string => {
    return categories.find((c) => c.id === categoryId)?.name || "Sin categoría";
  };

  return (
    <div className="products-manager">
      <div className="products-manager-header">
        <h2>Productos y Servicios</h2>
        <div className="header-actions">
          <Button 
            variant={activeTab === "products" ? "default" : "outline"}
            onClick={() => setActiveTab("products")}
          >
            Productos
          </Button>
          <Button 
            variant={activeTab === "categories" ? "default" : "outline"}
            onClick={() => setActiveTab("categories")}
          >
            <Folder className="mr-2 h-4 w-4" />
            Categorías
          </Button>
        </div>
      </div>

      {activeTab === "products" ? (
        <>
          <div className="products-manager-actions">
            <Button onClick={() => handleOpenProductDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </div>

          {/* Filters */}
          <div className="products-filters">
            <div className="search-box">
              <Search className="search-icon" />
              <Input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.icon && <span className="mr-2">{category.icon}</span>}
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="products-table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleToggleProductActive(product)}
                          className={`status-badge ${
                            product.active ? "status-active" : "status-inactive"
                          }`}
                        >
                          {product.active ? "Activo" : "Inactivo"}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="action-buttons">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenProductDialog(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Product Dialog */}
          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditProductMode ? "Editar Producto" : "Nuevo Producto"}
                </DialogTitle>
              </DialogHeader>

              <div className="product-form">
                <div className="form-group">
                  <Label htmlFor="productName">Nombre del Producto</Label>
                  <Input
                    id="productName"
                    value={currentProduct.name}
                    onChange={(e) =>
                      setCurrentProduct({ ...currentProduct, name: e.target.value })
                    }
                    placeholder="Ej: Hamburguesa Clásica"
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="productCategory">Categoría</Label>
                  <Select
                    value={currentProduct.categoryId?.toString()}
                    onValueChange={(value) =>
                      setCurrentProduct({
                        ...currentProduct,
                        categoryId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(c => c.active && c.name.toLowerCase() !== 'todos')
                        .map((category) => {
                          console.log('Category in selector:', category);
                          return (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.icon && <span className="mr-2">{category.icon}</span>}
                              {category.name}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-group">
                  <Label htmlFor="productPrice">Precio (Gs.)</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    value={currentProduct.price}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                </div>

                <div className="form-group-checkbox">
                  <input
                    type="checkbox"
                    id="productActive"
                    checked={currentProduct.active}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        active: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="productActive">Producto activo</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseProductDialog}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProduct}>
                  {isEditProductMode ? "Guardar Cambios" : "Crear Producto"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <>
          <div className="products-manager-actions">
            <Button onClick={() => handleOpenCategoryDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </div>

          {/* Categories Table */}
          <div className="products-table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ícono</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No hay categorías
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => {
                    const productCount = products.filter(p => p.categoryId === category.id).length;
                    return (
                      <TableRow key={category.id}>
                        <TableCell className="text-2xl">{category.icon || "📦"}</TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{productCount} productos</TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleToggleCategoryActive(category)}
                            className={`status-badge ${
                              category.active ? "status-active" : "status-inactive"
                            }`}
                            disabled={category.id === 1}
                          >
                            {category.active ? "Activo" : "Inactivo"}
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="action-buttons">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenCategoryDialog(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {category.id !== 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Category Dialog */}
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditCategoryMode ? "Editar Categoría" : "Nueva Categoría"}
                </DialogTitle>
              </DialogHeader>

              <div className="product-form">
                <div className="form-group">
                  <Label htmlFor="categoryName">Nombre de la Categoría</Label>
                  <Input
                    id="categoryName"
                    value={currentCategory.name}
                    onChange={(e) =>
                      setCurrentCategory({ ...currentCategory, name: e.target.value })
                    }
                    placeholder="Ej: Hamburguesas"
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="categoryIcon">Ícono (Emoji)</Label>
                  <Input
                    id="categoryIcon"
                    value={currentCategory.icon}
                    onChange={(e) =>
                      setCurrentCategory({ ...currentCategory, icon: e.target.value })
                    }
                    placeholder="Ej: 🍔"
                    maxLength={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Puedes usar cualquier emoji. Ejemplos: 🍔 🍕 🍟 🥤 🌯 🍗
                  </p>
                </div>

                <div className="form-group-checkbox">
                  <input
                    type="checkbox"
                    id="categoryActive"
                    checked={currentCategory.active}
                    onChange={(e) =>
                      setCurrentCategory({
                        ...currentCategory,
                        active: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="categoryActive">Categoría activa</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseCategoryDialog}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveCategory}>
                  {isEditCategoryMode ? "Guardar Cambios" : "Crear Categoría"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      <style jsx>{`
        .products-manager {
          padding: 24px;
        }

        .products-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .products-manager-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #1e293b;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .products-manager-actions {
          margin-bottom: 16px;
        }

        .products-filters {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .search-box {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #64748b;
          pointer-events: none;
        }

        .search-box input {
          padding-left: 40px;
        }

        .products-table-container {
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .status-badge:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .status-active {
          background: #dcfce7;
          color: #16a34a;
        }

        .status-inactive {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-badge:hover:not(:disabled) {
          opacity: 0.8;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .product-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px 0;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-group-checkbox input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}