import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/types/pos";

export const categoryService = {
  // Obtener todas las categorías
  async getAll(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("order", { ascending: true });

      if (error) {
        console.error("Error al obtener categorías:", error);
        throw error;
      }

      if (!data) return [];

      return data.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon || undefined,
        active: cat.active,
        order: cat.order || 0
      }));
    } catch (error) {
      console.error("Error en categoryService.getAll:", error);
      return [];
    }
  },

  // Obtener categorías activas
  async getActive(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("active", true)
        .order("order", { ascending: true });

      if (error) {
        console.error("Error al obtener categorías activas:", error);
        throw error;
      }

      if (!data) return [];

      return data.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon || undefined,
        active: cat.active,
        order: cat.order || 0
      }));
    } catch (error) {
      console.error("Error en categoryService.getActive:", error);
      return [];
    }
  },

  // Guardar categoría (crear o actualizar)
  async save(category: Category): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("categories")
        .upsert({
          id: category.id,
          name: category.name,
          icon: category.icon || null,
          active: category.active,
          order: category.order || 0
        });

      if (error) {
        console.error("Error al guardar categoría:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error en categoryService.save:", error);
      return false;
    }
  },

  // Eliminar categoría
  async delete(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error al eliminar categoría:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error en categoryService.delete:", error);
      return false;
    }
  },
};