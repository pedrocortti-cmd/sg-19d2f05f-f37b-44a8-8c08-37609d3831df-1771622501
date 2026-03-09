import { supabase } from "@/integrations/supabase/client";
import type { DeliveryDriver } from "@/types/pos";

export const driverService = {
  // Obtener todos los repartidores
  async getAll(): Promise<DeliveryDriver[]> {
    try {
      const { data, error } = await supabase
        .from("delivery_drivers")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error al obtener repartidores:", error);
        throw error;
      }

      if (!data) return [];

      return data.map(driver => ({
        id: driver.id,
        name: driver.name,
        phone: driver.phone || undefined,
        active: driver.active
      }));
    } catch (error) {
      console.error("Error en driverService.getAll:", error);
      return [];
    }
  },

  // Obtener repartidores activos
  async getActive(): Promise<DeliveryDriver[]> {
    try {
      const { data, error } = await supabase
        .from("delivery_drivers")
        .select("*")
        .eq("active", true)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error al obtener repartidores activos:", error);
        throw error;
      }

      if (!data) return [];

      return data.map(driver => ({
        id: driver.id,
        name: driver.name,
        phone: driver.phone || undefined,
        active: driver.active
      }));
    } catch (error) {
      console.error("Error en driverService.getActive:", error);
      return [];
    }
  },

  // Obtener repartidor por ID
  async getById(id: number): Promise<DeliveryDriver | null> {
    try {
      const { data, error } = await supabase
        .from("delivery_drivers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error al obtener repartidor:", error);
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        phone: data.phone || undefined,
        active: data.active
      };
    } catch (error) {
      console.error("Error en driverService.getById:", error);
      return null;
    }
  },

  // Guardar repartidor (crear o actualizar)
  async save(driver: DeliveryDriver): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("delivery_drivers")
        .upsert({
          id: driver.id,
          name: driver.name,
          phone: driver.phone || null,
          active: driver.active
        });

      if (error) {
        console.error("Error al guardar repartidor:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error en driverService.save:", error);
      return false;
    }
  },

  // Eliminar repartidor
  async delete(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("delivery_drivers")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error al eliminar repartidor:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error en driverService.delete:", error);
      return false;
    }
  },
};