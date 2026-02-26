import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export const productService = {
  // Obtener todos los productos
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    return data || [];
  },

  // Obtener productos activos
  async getActive(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching active products:", error);
      throw error;
    }

    return data || [];
  },

  // Obtener productos por categoría
  async getByCategory(categoryId: number): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", categoryId)
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }

    return data || [];
  },

  // Obtener producto por ID
  async getById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      throw error;
    }

    return data;
  },

  // Crear producto
  async create(product: Omit<ProductInsert, "id">): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      throw error;
    }

    return data;
  },

  // Actualizar producto
  async update(id: number, updates: ProductUpdate): Promise<Product> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      throw error;
    }

    return data;
  },

  // Eliminar producto
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  // Actualizar stock
  async updateStock(id: number, quantity: number): Promise<Product> {
    const product = await this.getById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    const newStock = (product.stock || 0) + quantity;

    return this.update(id, { stock: newStock });
  },

  // Buscar productos
  async search(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .ilike("name", `%${query}%`)
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error searching products:", error);
      throw error;
    }

    return data || [];
  },
};