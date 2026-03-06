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

      if (!data) {
        return [];
      }

      // Transformar de snake_case a camelCase
      return data.map((prod) => ({
        id: prod.id,
        name: prod.name,
        price: prod.price,
        categoryId: prod.category_id,
        active: prod.active,
        stock: prod.stock || 0,
        image: prod.image || undefined,
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

      if (!data) {
        return [];
      }

      return data.map((prod) => ({
        id: prod.id,
        name: prod.name,
        price: prod.price,
        categoryId: prod.category_id,
        active: prod.active,
        stock: prod.stock || 0,
        image: prod.image || undefined,
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

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        price: data.price,
        categoryId: data.category_id,
        active: data.active,
        stock: data.stock || 0,
        image: data.image || undefined,
      };
    } catch (error) {
      console.error("Error en productService.getById:", error);
      return null;
    }
  },

  // Crear producto
  async create(product: Omit<Product, "id">): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: product.name,
          price: product.price,
          category_id: product.categoryId,
          active: product.active,
          stock: product.stock || 0,
          image: product.image || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error al crear producto:", error);
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        price: data.price,
        categoryId: data.category_id,
        active: data.active,
        stock: data.stock || 0,
        image: data.image || undefined,
      };
    } catch (error) {
      console.error("Error en productService.create:", error);
      return null;
    }
  },

  // Actualizar producto
  async update(id: number, product: Partial<Product>): Promise<boolean> {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (product.name !== undefined) updateData.name = product.name;
      if (product.price !== undefined) updateData.price = product.price;
      if (product.categoryId !== undefined) updateData.category_id = product.categoryId;
      if (product.active !== undefined) updateData.active = product.active;
      if (product.stock !== undefined) updateData.stock = product.stock;
      if (product.image !== undefined) updateData.image = product.image;

      const { error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id);

      if (error) {
        console.error("Error al actualizar producto:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error en productService.update:", error);
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
  async updateStock(id: number, quantity: number): Promise<boolean> {
    try {
      // Obtener stock actual
      const { data: product, error: getError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", id)
        .single();

      if (getError) {
        console.error("Error al obtener stock actual:", getError);
        throw getError;
      }

      const currentStock = product?.stock || 0;
      const newStock = Math.max(0, currentStock + quantity);

      // Actualizar stock
      const { error: updateError } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", id);

      if (updateError) {
        console.error("Error al actualizar stock:", updateError);
        throw updateError;
      }

      return true;
    } catch (error) {
      console.error("Error en productService.updateStock:", error);
      return false;
    }
  },
};