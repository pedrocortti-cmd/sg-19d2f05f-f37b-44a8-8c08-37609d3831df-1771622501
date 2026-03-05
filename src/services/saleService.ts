import { supabase } from "@/integrations/supabase/client";
import type { Sale } from "@/types/pos";

export const saleService = {
  // Obtener todas las ventas
  async getAll(): Promise<Sale[]> {
    const { data, error } = await supabase
      .from("sales")
      .select(`
        *,
        sale_items(
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener ventas:", error);
      throw error;
    }

    return (data || []).map((sale) => ({
      id: sale.id,
      saleNumber: sale.sale_number,
      date: sale.created_at,
      items: (sale.sale_items || []).map((item: any) => ({
        product: {
          id: item.product_id,
          name: item.product_name,
          price: Number(item.price),
          categoryId: 0,
          active: true,
        },
        quantity: item.quantity,
      })),
      subtotal: Number(sale.subtotal),
      discount: Number(sale.discount_amount || 0),
      deliveryCost: Number(sale.delivery_cost || 0),
      total: Number(sale.total),
      paymentMethod: sale.payment_method || "cash",
      orderType: sale.order_type as "delivery" | "pickup" | "local" | "dineIn",
      customer: sale.customer_name
        ? {
            name: sale.customer_name,
            phone: sale.customer_phone || "",
            address: sale.customer_address || "",
            ruc: sale.customer_ruc || undefined,
            businessName: sale.customer_business_name || undefined,
            isExempt: sale.exempt || false,
          }
        : undefined,
      status: sale.status as "pending" | "completed" | "cancelled",
      note: sale.notes || undefined,
      deliveryDriverName: sale.delivery_driver_name || undefined,
    }));
  },

  // Obtener ventas por fecha
  async getByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    const { data, error } = await supabase
      .from("sales")
      .select(`
        *,
        sale_items(
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `)
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener ventas por fecha:", error);
      throw error;
    }

    return (data || []).map((sale) => ({
      id: sale.id,
      saleNumber: sale.sale_number,
      date: sale.created_at,
      items: (sale.sale_items || []).map((item: any) => ({
        product: {
          id: item.product_id,
          name: item.product_name,
          price: Number(item.price),
          categoryId: 0,
          active: true,
        },
        quantity: item.quantity,
      })),
      subtotal: Number(sale.subtotal),
      discount: Number(sale.discount_amount || 0),
      deliveryCost: Number(sale.delivery_cost || 0),
      total: Number(sale.total),
      paymentMethod: sale.payment_method || "cash",
      orderType: sale.order_type as "delivery" | "pickup" | "local" | "dineIn",
      status: sale.status as "pending" | "completed" | "cancelled",
      deliveryDriverName: sale.delivery_driver_name || undefined,
    }));
  },

  // Obtener venta por ID
  async getById(id: number): Promise<Sale | null> {
    const { data, error } = await supabase
      .from("sales")
      .select(`
        *,
        sale_items(
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error al obtener venta:", error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      saleNumber: data.sale_number,
      date: data.created_at,
      items: (data.sale_items || []).map((item: any) => ({
        product: {
          id: item.product_id,
          name: item.product_name,
          price: Number(item.price),
          categoryId: 0,
          active: true,
        },
        quantity: item.quantity,
      })),
      subtotal: Number(data.subtotal),
      discount: Number(data.discount_amount || 0),
      deliveryCost: Number(data.delivery_cost || 0),
      total: Number(data.total),
      paymentMethod: data.payment_method || "cash",
      orderType: data.order_type as "delivery" | "pickup" | "local" | "dineIn",
      customer: data.customer_name
        ? {
            name: data.customer_name,
            phone: data.customer_phone || "",
            address: data.customer_address || "",
            ruc: data.customer_ruc || undefined,
            businessName: data.customer_business_name || undefined,
            isExempt: data.exempt || false,
          }
        : undefined,
      status: data.status as "pending" | "completed" | "cancelled",
      note: data.notes || undefined,
      deliveryDriverName: data.delivery_driver_name || undefined,
    };
  },

  // Actualizar estado de venta
  async updateStatus(
    id: number,
    status: "pending" | "completed" | "cancelled"
  ): Promise<void> {
    const { error } = await supabase
      .from("sales")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar estado de venta:", error);
      throw error;
    }
  },

  // Actualizar venta completa
  async update(id: number, saleData: Partial<any>): Promise<void> {
    const { error } = await supabase
      .from("sales")
      .update(saleData)
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar venta:", error);
      throw error;
    }
  },

  // Completar venta
  async complete(id: number): Promise<void> {
    const { error } = await supabase
      .from("sales")
      .update({ status: "completed" })
      .eq("id", id);

    if (error) {
      console.error("Error al completar venta:", error);
      throw error;
    }
  },

  // Cancelar venta
  async cancel(id: number): Promise<void> {
    const { error } = await supabase
      .from("sales")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (error) {
      console.error("Error al cancelar venta:", error);
      throw error;
    }
  },

  // Eliminar venta
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from("sales")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error al eliminar venta:", error);
      throw error;
    }
  },

  // Obtener número de venta del día siguiente
  async getNextDailySaleNumber(): Promise<string> {
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    
    const { data, error } = await supabase
      .from("sales")
      .select("sale_number")
      .like("sale_number", `${today}%`)
      .order("sale_number", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error al obtener número de venta:", error);
      const timestamp = Date.now().toString().slice(-4);
      return `${today}-${timestamp}`;
    }

    if (!data || data.length === 0) {
      return `${today}-0001`;
    }

    const lastNumber = data[0].sale_number;
    const lastSeq = parseInt(lastNumber.split("-")[1] || "0");
    const nextSeq = (lastSeq + 1).toString().padStart(4, "0");
    
    return `${today}-${nextSeq}`;
  },
};