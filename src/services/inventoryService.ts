import { supabase } from "@/integrations/supabase/client";
import type { StockMovement, InventoryAlert } from "@/types/pos";

export const inventoryService = {
  // Registrar movimiento de stock
  async registerMovement(movement: Omit<StockMovement, "id" | "createdAt">): Promise<void> {
    const { error } = await supabase.from("stock_movements").insert({
      product_id: movement.productId,
      product_name: movement.productName,
      type: movement.type,
      quantity: movement.quantity,
      previous_stock: movement.previousStock,
      new_stock: movement.newStock,
      reason: movement.reason,
      created_by: movement.createdBy,
    });

    if (error) {
      console.error("Error al registrar movimiento:", error);
      throw error;
    }
  },

  // Obtener movimientos por producto
  async getMovementsByProduct(productId: number): Promise<StockMovement[]> {
    const { data, error } = await supabase
      .from("stock_movements")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener movimientos:", error);
      throw error;
    }

    return (data || []).map((mov) => ({
      id: mov.id,
      productId: mov.product_id,
      productName: mov.product_name,
      type: mov.type as "sale" | "adjustment" | "initial" | "return",
      quantity: mov.quantity,
      previousStock: mov.previous_stock,
      newStock: mov.new_stock,
      reason: mov.reason || "",
      createdBy: mov.created_by,
      createdAt: new Date(mov.created_at),
    }));
  },

  // Obtener alertas de inventario
  async getAlerts(): Promise<InventoryAlert[]> {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, stock, min_stock")
      .eq("active", true)
      .order("stock", { ascending: true });

    if (error) {
      console.error("Error al obtener alertas:", error);
      throw error;
    }

    const alerts: InventoryAlert[] = [];

    (data || []).forEach((prod) => {
      const minStock = prod.min_stock || 5;
      const currentStock = prod.stock || 0;

      if (currentStock === 0) {
        alerts.push({
          productId: prod.id,
          productName: prod.name,
          currentStock,
          minStock,
          status: "out",
        });
      } else if (currentStock <= minStock / 2) {
        alerts.push({
          productId: prod.id,
          productName: prod.name,
          currentStock,
          minStock,
          status: "critical",
        });
      } else if (currentStock <= minStock) {
        alerts.push({
          productId: prod.id,
          productName: prod.name,
          currentStock,
          minStock,
          status: "low",
        });
      }
    });

    return alerts;
  },
};