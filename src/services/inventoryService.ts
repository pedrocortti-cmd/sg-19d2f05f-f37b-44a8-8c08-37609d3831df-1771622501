import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { productService } from "./productService";

type InventoryMovement = Database["public"]["Tables"]["inventory_movements"]["Row"];
type InventoryMovementInsert = Database["public"]["Tables"]["inventory_movements"]["Insert"];

export const inventoryService = {
  // Obtener movimientos de inventario
  async getMovements(productId?: number): Promise<InventoryMovement[]> {
    let query = supabase
      .from("inventory_movements")
      .select("*")
      .order("created_at", { ascending: false });

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching inventory movements:", error);
      throw error;
    }

    return data || [];
  },

  // Registrar entrada de inventario
  async registerEntry(
    productId: number,
    quantity: number,
    reason?: string
  ): Promise<InventoryMovement> {
    const product = await productService.getById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const previousStock = product.stock || 0;
    const newStock = previousStock + quantity;

    // Actualizar stock del producto
    await productService.update(productId, { stock: newStock });

    // Registrar movimiento
    const movement: Omit<InventoryMovementInsert, "id"> = {
      product_id: productId,
      movement_type: "entry",
      quantity,
      previous_stock: previousStock,
      new_stock: newStock,
      reason: reason || "Entrada de inventario",
    };

    const { data, error } = await supabase
      .from("inventory_movements")
      .insert(movement)
      .select()
      .single();

    if (error) {
      console.error("Error registering inventory entry:", error);
      throw error;
    }

    return data;
  },

  // Registrar salida de inventario
  async registerExit(
    productId: number,
    quantity: number,
    reason?: string
  ): Promise<InventoryMovement> {
    const product = await productService.getById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const previousStock = product.stock || 0;
    const newStock = Math.max(0, previousStock - quantity);

    // Actualizar stock del producto
    await productService.update(productId, { stock: newStock });

    // Registrar movimiento
    const movement: Omit<InventoryMovementInsert, "id"> = {
      product_id: productId,
      movement_type: "exit",
      quantity,
      previous_stock: previousStock,
      new_stock: newStock,
      reason: reason || "Salida de inventario",
    };

    const { data, error } = await supabase
      .from("inventory_movements")
      .insert(movement)
      .select()
      .single();

    if (error) {
      console.error("Error registering inventory exit:", error);
      throw error;
    }

    return data;
  },

  // Ajustar inventario manualmente
  async adjustStock(
    productId: number,
    newStock: number,
    reason: string
  ): Promise<InventoryMovement> {
    const product = await productService.getById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const previousStock = product.stock || 0;
    const quantity = newStock - previousStock;

    // Actualizar stock del producto
    await productService.update(productId, { stock: newStock });

    // Registrar movimiento
    const movement: Omit<InventoryMovementInsert, "id"> = {
      product_id: productId,
      movement_type: "adjustment",
      quantity,
      previous_stock: previousStock,
      new_stock: newStock,
      reason,
    };

    const { data, error } = await supabase
      .from("inventory_movements")
      .insert(movement)
      .select()
      .single();

    if (error) {
      console.error("Error adjusting inventory:", error);
      throw error;
    }

    return data;
  },

  // Obtener productos con stock bajo
  async getLowStockProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("stock", { ascending: true });

    if (error) {
      console.error("Error fetching low stock products:", error);
      throw error;
    }

    // Filtrar en memoria ya que comparar dos columnas (stock <= min_stock) 
    // requiere una función RPC o filtro complejo en PostgREST
    return (data || []).filter(p => (p.stock || 0) <= (p.min_stock || 5));
  },
};