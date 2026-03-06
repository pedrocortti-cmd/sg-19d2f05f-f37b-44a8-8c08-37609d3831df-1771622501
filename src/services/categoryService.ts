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

      if (!data) {
        return [];
      }

      // Transformar de snake_case a camelCase
      return data.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        active: cat.active,
        order: cat.order || 0,
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

      if (!data) {
        return [];
      }

      return data.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        active: cat.active,
        order: cat.order || 0,
      }));
    } catch (error) {
      console.error("Error en categoryService.getActive:", error);
      return [];
    }
  },

  // Crear categoría
  async create(category: Omit<Category, "id">): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: category.name,
          icon: category.icon,
          active: category.active,
          order: category.order || 0,
        })
        .select()
        .single();

      if (error) {
        console.error("Error al crear categoría:", error);
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        icon: data.icon,
        active: data.active,
        order: data.order || 0,
      };
    } catch (error) {
      console.error("Error en categoryService.create:", error);
      return null;
    }
  },

  // Actualizar categoría
  async update(id: number, category: Partial<Category>): Promise<boolean> {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (category.name !== undefined) updateData.name = category.name;
      if (category.icon !== undefined) updateData.icon = category.icon;
      if (category.active !== undefined) updateData.active = category.active;
      if (category.order !== undefined) updateData.order = category.order;

      const { error } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", id);

      if (error) {
        console.error("Error al actualizar categoría:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error en categoryService.update:", error);
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