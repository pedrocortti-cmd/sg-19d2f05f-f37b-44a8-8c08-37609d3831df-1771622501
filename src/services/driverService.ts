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

      if (!data) {
        return [];
      }

      // Transformar de snake_case a camelCase
      return data.map((driver) => ({
        id: driver.id,
        name: driver.name,
        phone: driver.phone || "",
        active: driver.active,
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

      if (!data) {
        return [];
      }

      return data.map((driver) => ({
        id: driver.id,
        name: driver.name,
        phone: driver.phone || "",
        active: driver.active,
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

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        phone: data.phone || "",
        active: data.active,
      };
    } catch (error) {
      console.error("Error en driverService.getById:", error);
      return null;
    }
  },

  // Crear repartidor
  async create(driver: Omit<DeliveryDriver, "id">): Promise<DeliveryDriver | null> {
    try {
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

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        phone: data.phone || "",
        active: data.active,
      };
    } catch (error) {
      console.error("Error en driverService.create:", error);
      return null;
    }
  },

  // Actualizar repartidor
  async update(id: number, driver: Partial<DeliveryDriver>): Promise<boolean> {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (driver.name !== undefined) updateData.name = driver.name;
      if (driver.phone !== undefined) updateData.phone = driver.phone;
      if (driver.active !== undefined) updateData.active = driver.active;

      const { error } = await supabase
        .from("delivery_drivers")
        .update(updateData)
        .eq("id", id);

      if (error) {
        console.error("Error al actualizar repartidor:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error en driverService.update:", error);
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