import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type DeliveryDriver = Database["public"]["Tables"]["delivery_drivers"]["Row"];
type DeliveryDriverInsert = Database["public"]["Tables"]["delivery_drivers"]["Insert"];
type DeliveryDriverUpdate = Database["public"]["Tables"]["delivery_drivers"]["Update"];

export const driverService = {
  // Obtener todos los conductores
  async getAll(): Promise<DeliveryDriver[]> {
    const { data, error } = await supabase
      .from("delivery_drivers")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching drivers:", error);
      throw error;
    }

    return data || [];
  },

  // Obtener conductores activos
  async getActive(): Promise<DeliveryDriver[]> {
    const { data, error } = await supabase
      .from("delivery_drivers")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching active drivers:", error);
      throw error;
    }

    return data || [];
  },

  // Obtener conductor por ID
  async getById(id: number): Promise<DeliveryDriver | null> {
    const { data, error } = await supabase
      .from("delivery_drivers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching driver:", error);
      throw error;
    }

    return data;
  },

  // Crear conductor
  async create(driver: Omit<DeliveryDriverInsert, "id">): Promise<DeliveryDriver> {
    const { data, error } = await supabase
      .from("delivery_drivers")
      .insert(driver)
      .select()
      .single();

    if (error) {
      console.error("Error creating driver:", error);
      throw error;
    }

    return data;
  },

  // Actualizar conductor
  async update(id: number, updates: DeliveryDriverUpdate): Promise<DeliveryDriver> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("delivery_drivers")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating driver:", error);
      throw error;
    }

    return data;
  },

  // Eliminar conductor
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from("delivery_drivers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting driver:", error);
      throw error;
    }
  },

  // Activar/Desactivar conductor
  async toggleActive(id: number): Promise<DeliveryDriver> {
    const driver = await this.getById(id);
    if (!driver) {
      throw new Error("Driver not found");
    }

    return this.update(id, { active: !driver.active });
  },
};