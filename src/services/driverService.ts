import { supabase } from "@/integrations/supabase/client";
import type { DeliveryDriver } from "@/types/pos";

export const driverService = {
  // Obtener todos los repartidores
  async getAll(): Promise<DeliveryDriver[]> {
    const { data, error } = await supabase
      .from("delivery_drivers")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error al obtener repartidores:", error);
      throw error;
    }

    return (data || []).map((driver) => ({
      id: driver.id,
      name: driver.name,
      phone: driver.phone || "",
      active: driver.active,
    }));
  },

  // Obtener repartidores activos
  async getActive(): Promise<DeliveryDriver[]> {
    const { data, error } = await supabase
      .from("delivery_drivers")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error al obtener repartidores activos:", error);
      throw error;
    }

    return (data || []).map((driver) => ({
      id: driver.id,
      name: driver.name,
      phone: driver.phone || "",
      active: driver.active,
    }));
  },

  // Crear repartidor
  async create(driver: Omit<DeliveryDriver, "id">): Promise<DeliveryDriver> {
    const { data, error } = await supabase
      .from("delivery_drivers")
      .insert({
        name: driver.name,
        phone: driver.phone || null,
        active: driver.active,
      })
      .select()
      .single();

    if (error) {
      console.error("Error al crear repartidor:", error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      phone: data.phone || "",
      active: data.active,
    };
  },

  // Actualizar repartidor
  async update(id: number, driver: Partial<DeliveryDriver>): Promise<void> {
    const { error } = await supabase
      .from("delivery_drivers")
      .update({
        name: driver.name,
        phone: driver.phone || null,
        active: driver.active,
      })
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar repartidor:", error);
      throw error;
    }
  },

  // Eliminar repartidor
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from("delivery_drivers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error al eliminar repartidor:", error);
      throw error;
    }
  },
};