import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/pos";

export const productService = {
  // Obtener todos los productos
  async getAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error al obtener productos:", error);
        throw error;
      }

      if (!data) return [];

      return data.map(prod => ({
        id: prod.id,
        name: prod.name,
        price: prod.price,
        categoryId: prod.category_id,
        active: prod.active,
        stock: prod.stock || 0,
        image: prod.image || undefined
      }));
    } catch (error) {
      console.error("Error en productService.getAll:", error);
      return [];
    }
  },

  // Obtener productos activos
  async getActive(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error al obtener productos activos:", error);
        throw error;
      }

      if (!data) return [];

      return data.map(prod => ({
        id: prod.id,
        name: prod.name,
        price: prod.price,
        categoryId: prod.category_id,
        active: prod.active,
        stock: prod.stock || 0,
        image: prod.image || undefined
      }));
    } catch (error) {
      console.error("Error en productService.getActive:", error);
      return [];
    }
  },

  // Obtener producto por ID
  async getById(id: number): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error al obtener producto:", error);
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        price: data.price,
        categoryId: data.category_id,
        active: data.active,
        stock: data.stock || 0,
        image: data.image || undefined
      };
    } catch (error) {
      console.error("Error en productService.getById:", error);
      return null;
    }
  },

  // Guardar producto (crear o actualizar)
  async save(product: Product): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("products")
        .upsert({
          id: product.id,
          name: product.name,
          price: product.price,
          category_id: product.categoryId,
          active: product.active,
          stock: product.stock || 0,
          image: product.image || null
        });

      if (error) {
        console.error("Error al guardar producto:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error en productService.save:", error);
      return false;
    }
  },

  // Eliminar producto
  async delete(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error al eliminar producto:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error en productService.delete:", error);
      return false;
    }
  },

  // Actualizar stock
  async updateStock(productId: number, quantityChange: number): Promise<boolean> {
    try {
      const product = await this.getById(productId);
      if (!product) {
        console.error("Producto no encontrado");
        return false;
      }

      const newStock = (product.stock || 0) + quantityChange;

      const { error } = await supabase
        .from("products")
        .update({ stock: Math.max(0, newStock) })
        .eq("id", productId);

      if (error) {
        console.error("Error al actualizar stock:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error en productService.updateStock:", error);
      return false;
    }
  },
};