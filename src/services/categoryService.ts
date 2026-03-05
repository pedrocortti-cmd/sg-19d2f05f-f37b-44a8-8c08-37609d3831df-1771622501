import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/types/pos";

export const categoryService = {
  // Obtener todas las categorías
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("order", { ascending: true });

    if (error) {
      console.error("Error al obtener categorías:", error);
      throw error;
    }

    return (data || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      active: cat.active,
      order: cat.order || 0,
      icon: cat.icon || undefined,
    }));
  },

  // Obtener categorías activas
  async getActive(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("order", { ascending: true });

    if (error) {
      console.error("Error al obtener categorías activas:", error);
      throw error;
    }

    return (data || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      active: cat.active,
      order: cat.order || 0,
      icon: cat.icon || undefined,
    }));
  },

  // Crear categoría
  async create(category: Omit<Category, "id">): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: category.name,
        active: category.active,
        order: category.order || 0,
        icon: category.icon || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error al crear categoría:", error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      active: data.active,
      order: data.order || 0,
      icon: data.icon || undefined,
    };
  },

  // Actualizar categoría
  async update(id: number, category: Partial<Category>): Promise<void> {
    const { error } = await supabase
      .from("categories")
      .update({
        name: category.name,
        active: category.active,
        order: category.order,
        icon: category.icon || null,
      })
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar categoría:", error);
      throw error;
    }
  },

  // Eliminar categoría
  async delete(id: number): Promise<void> {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("Error al eliminar categoría:", error);
      throw error;
    }
  },
};