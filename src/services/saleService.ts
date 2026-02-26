import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Sale = Database["public"]["Tables"]["sales"]["Row"];
type SaleInsert = Database["public"]["Tables"]["sales"]["Insert"];
type SaleUpdate = Database["public"]["Tables"]["sales"]["Update"];
type SaleItem = Database["public"]["Tables"]["sale_items"]["Row"];
type SaleItemInsert = Database["public"]["Tables"]["sale_items"]["Insert"];

export interface SaleWithItems extends Sale {
  sale_items: SaleItem[];
}

export const saleService = {
  // Obtener todas las ventas
  async getAll(): Promise<SaleWithItems[]> {
    const { data, error } = await supabase
      .from("sales")
      .select(`
        *,
        sale_items (*)
      `)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching sales:", error);
      throw error;
    }

    return data || [];
  },

  // Obtener ventas por fecha
  async getByDate(startDate: string, endDate: string): Promise<SaleWithItems[]> {
    const { data, error } = await supabase
      .from("sales")
      .select(`
        *,
        sale_items (*)
      `)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching sales by date:", error);
      throw error;
    }

    return data || [];
  },

  // Obtener ventas del día
  async getToday(): Promise<SaleWithItems[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getByDate(today.toISOString(), tomorrow.toISOString());
  },

  // Obtener venta por ID
  async getById(id: number): Promise<SaleWithItems | null> {
    const { data, error } = await supabase
      .from("sales")
      .select(`
        *,
        sale_items (*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching sale:", error);
      throw error;
    }

    return data;
  },

  // Crear venta con items
  async create(
    sale: Omit<SaleInsert, "id">,
    items: Omit<SaleItemInsert, "id" | "sale_id">[]
  ): Promise<SaleWithItems> {
    // Crear la venta
    const { data: saleData, error: saleError } = await supabase
      .from("sales")
      .insert(sale)
      .select()
      .single();

    if (saleError) {
      console.error("Error creating sale:", saleError);
      throw saleError;
    }

    // Crear los items de la venta
    const saleItems = items.map(item => ({
      ...item,
      sale_id: saleData.id,
    }));

    const { data: itemsData, error: itemsError } = await supabase
      .from("sale_items")
      .insert(saleItems)
      .select();

    if (itemsError) {
      console.error("Error creating sale items:", itemsError);
      throw itemsError;
    }

    return {
      ...saleData,
      sale_items: itemsData || [],
    };
  },

  // Actualizar venta
  async update(id: number, updates: SaleUpdate): Promise<Sale> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("sales")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating sale:", error);
      throw error;
    }

    return data;
  },

  // Cancelar venta
  async cancel(id: number): Promise<Sale> {
    return this.update(id, { status: "cancelled" });
  },

  // Completar venta
  async complete(id: number): Promise<Sale> {
    return this.update(id, { status: "completed" });
  },

  // Eliminar venta (marca como eliminada o borra físicamente)
  async delete(id: number): Promise<void> {
    // Primero eliminar los items de la venta
    const { error: itemsError } = await supabase
      .from("sale_items")
      .delete()
      .eq("sale_id", id);

    if (itemsError) {
      console.error("Error deleting sale items:", itemsError);
      throw itemsError;
    }

    // Luego eliminar la venta
    const { error: saleError } = await supabase
      .from("sales")
      .delete()
      .eq("id", id);

    if (saleError) {
      console.error("Error deleting sale:", saleError);
      throw saleError;
    }
  },

  // Obtener siguiente número de venta del día
  async getNextDailySaleNumber(): Promise<string> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from("sales")
      .select("sale_number")
      .gte("date", today.toISOString())
      .lt("date", tomorrow.toISOString())
      .order("sale_number", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching last sale number:", error);
      return "#0001";
    }

    if (!data || data.length === 0) {
      return "#0001";
    }

    const lastNumber = parseInt(data[0].sale_number.replace("##", "").replace("#", ""));
    const nextNumber = lastNumber + 1;
    return `#${String(nextNumber).padStart(4, "0")}`;
  },

  // Obtener estadísticas de ventas
  async getStats(startDate: string, endDate: string) {
    const sales = await this.getByDate(startDate, endDate);

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    const salesByType = sales.reduce((acc, sale) => {
      const type = sale.order_type || "unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const salesByPayment = sales.reduce((acc, sale) => {
      const method = sale.payment_method || "unknown";
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSales,
      totalRevenue,
      averageSale,
      salesByType,
      salesByPayment,
    };
  },
};