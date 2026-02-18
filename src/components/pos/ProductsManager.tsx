import { useState, useEffect } from "react";
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
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import type { Product, Category } from "@/types/pos";

interface ProductsManagerProps {
  products: Product[];
  categories: Category[];
  onProductsChange: (products: Product[]) => void;
  onCategoriesChange: (categories: Category[]) => void;
}

export function ProductsManager({ 
  products, 
  categories, 
  onProductsChange, 
  onCategoriesChange 
}: ProductsManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    categoryId: 0,
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
    if (isEditMode && currentProduct.id) {
      // Update existing product
      onProductsChange(
        products.map((p) =>
          p.id === currentProduct.id ? (currentProduct as Product) : p
        )
      );
    } else {
      // Create new product
      const newProduct: Product = {
        ...currentProduct,
        id: Math.max(...products.map((p) => p.id), 0) + 1,
      } as Product;
      onProductsChange([...products, newProduct]);
    }
    handleCloseDialog();
  };

  // Handle delete product
  const handleDeleteProduct = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      onProductsChange(products.filter((p) => p.id !== id));
    }
  };

  // Handle toggle active status
  const handleToggleActive = (id: number) => {
    onProductsChange(
      products.map((p) =>
        p.id === id ? { ...p, active: !p.active } : p
      )
    );
  };

  // Handle open dialog
  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setIsEditMode(true);
      setCurrentProduct(product);
    } else {
      setIsEditMode(false);
      setCurrentProduct({
        name: "",
        price: 0,
        categoryId: categories[0]?.id || 1,
        active: true,
      });
    }
    setIsDialogOpen(true);
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentProduct({
      name: "",
      price: 0,
      categoryId: 0,
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
        <Button onClick={() => handleOpenDialog()}>
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
                      onClick={() => handleToggleActive(product.id)}
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
                        onClick={() => handleOpenDialog(product)}
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Producto" : "Nuevo Producto"}
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
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
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
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProduct}>
              {isEditMode ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

        .status-active {
          background: #dcfce7;
          color: #16a34a;
        }

        .status-inactive {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-badge:hover {
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