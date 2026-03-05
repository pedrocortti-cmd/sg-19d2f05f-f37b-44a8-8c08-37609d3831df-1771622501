import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/pos";

export const productService = {
  // Obtener todos los productos
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(name)
      `)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error al obtener productos:", error);
      throw error;
    }

    return (data || []).map((prod) => ({
      id: prod.id,
      name: prod.name,
      price: Number(prod.price),
      stock: prod.stock || 0,
      categoryId: prod.category_id,
      category: prod.category?.name,
      image: prod.image || undefined,
      active: prod.active,
      createdAt: prod.created_at ? new Date(prod.created_at) : undefined,
      updatedAt: prod.updated_at ? new Date(prod.updated_at) : undefined,
    }));
  },

  // Obtener productos activos
  async getActive(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(name)
      `)
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error al obtener productos activos:", error);
      throw error;
    }

    return (data || []).map((prod) => ({
      id: prod.id,
      name: prod.name,
      price: Number(prod.price),
      stock: prod.stock || 0,
      categoryId: prod.category_id,
      category: prod.category?.name,
      image: prod.image || undefined,
      active: prod.active,
    }));
  },

  // Obtener productos por categoría
  async getByCategory(categoryId: number): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(name)
      `)
      .eq("category_id", categoryId)
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error al obtener productos por categoría:", error);
      throw error;
    }

    return (data || []).map((prod) => ({
      id: prod.id,
      name: prod.name,
      price: Number(prod.price),
      stock: prod.stock || 0,
      categoryId: prod.category_id,
      category: prod.category?.name,
      image: prod.image || undefined,
      active: prod.active,
    }));
  },

  // Crear producto
  async create(product: Omit<Product, "id">): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: product.name,
        price: product.price,
        category_id: product.categoryId,
        stock: product.stock || 0,
        image: product.image || null,
        active: product.active,
      })
      .select()
      .single();

    if (error) {
      console.error("Error al crear producto:", error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      price: Number(data.price),
      stock: data.stock || 0,
      categoryId: data.category_id,
      active: data.active,
    };
  },

  // Actualizar producto
  async update(id: number, product: Partial<Product>): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update({
        name: product.name,
        price: product.price,
        category_id: product.categoryId,
        stock: product.stock,
        image: product.image || null,
        active: product.active,
      })
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar producto:", error);
      throw error;
    }
  },

  // Eliminar producto
  async delete(id: number): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error al eliminar producto:", error);
      throw error;
    }
  },

  // Actualizar stock
  async updateStock(id: number, newStock: number): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar stock:", error);
      throw error;
    }
  },
};