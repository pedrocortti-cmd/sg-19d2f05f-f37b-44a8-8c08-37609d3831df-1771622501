import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { formatCurrency } from "@/lib/utils";
import { SEO } from "@/components/SEO";
import type { 
  Product, 
  Category, 
  CartItem, 
  Sale, 
  DeliveryDriver, 
  CustomerInfo, 
  OrderType, 
  PrintFormatConfig, 
  Payment,
  User 
} from "@/types/pos";
import { printKitchenOrder } from "@/lib/printService";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  FileText, 
  CreditCard,
  Store,
  Package,
  Settings,
  LogOut,
  BarChart3,
  DollarSign,
  Printer,
  MessageSquare,
  X,
  Eye,
  Check,
  Search
} from "lucide-react";
import { SalesHistory } from "@/components/pos/SalesHistory";
import { ProductsManager } from "@/components/pos/ProductsManager";
import { Inventory } from "@/components/pos/Inventory";
import { Reports } from "@/components/pos/Reports";
import { PrinterSettings } from "@/components/pos/PrinterSettings";
import { PrintFormatSettings } from "@/components/pos/PrintFormatSettings";
import { DeliveryDrivers } from "@/components/pos/DeliveryDrivers";
import { LogoSettings } from "@/components/pos/LogoSettings";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { SalePreviewModal } from "@/components/pos/SalePreviewModal";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { saleService } from "@/services/saleService";
import { driverService } from "@/services/driverService";

export default function POS() {
  const [activeView, setActiveView] = useState<"pos" | "sales" | "products" | "inventory" | "reports" | "settings" | "drivers">("pos");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"pending" | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [deliveryDrivers, setDeliveryDrivers] = useState<DeliveryDriver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [nextSaleNumber, setNextSaleNumber] = useState<string>("#0001");
  const [loadedSaleId, setLoadedSaleId] = useState<number | null>(null);
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [displayedSalesCount, setDisplayedSalesCount] = useState(10);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    ruc: "",
    businessName: "",
    isExempt: false,
    exempt: false
  });
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [orderNote, setOrderNote] = useState("");
  const [currentUser, setCurrentUser] = useState<User>({
    id: 1,
    username: "cajero1",
    role: "cashier",
    name: "Juan Pérez",
    active: true
  });
  const [printFormatConfig, setPrintFormatConfig] = useState<PrintFormatConfig>({
    comandaTitleSize: 16,
    comandaProductSize: 12,
    comandaShowPrices: false,
    comandaCopies: 1,
    comandaCustomFields: [],
    ticketHeaderSize: 14,
    ticketProductSize: 12,
    ticketTotalSize: 14,
    ticketThankYouMessage: "¡Gracias por tu compra!",
    ticketShowLogo: true,
    businessInfo: {
      name: "De la Gran Burger",
      address: "Av. Principal 123, Asunción",
      phone: "021-1234567",
      ruc: "80012345-6",
      additionalInfo: ""
    }
  });
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      console.log("🔄 Iniciando carga de datos...");

      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("active", true)
        .order("name");

      if (categoriesError) {
        console.error("❌ Error al cargar categorías:", categoriesError);
        throw new Error(`Error en categorías: ${categoriesError.message}`);
      }

      const loadedCategories: Category[] = (categoriesData || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        active: cat.active,
        createdAt: cat.created_at,
      }));

      console.log("✅ Categorías cargadas:", loadedCategories.length);
      setCategories(loadedCategories);

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("name");

      if (productsError) {
        console.error("❌ Error al cargar productos:", productsError);
        throw new Error(`Error en productos: ${productsError.message}`);
      }

      const loadedProducts: Product[] = (productsData || []).map((prod: any) => ({
        id: prod.id,
        name: prod.name,
        price: prod.price,
        categoryId: prod.category_id,
        active: prod.active,
        stock: prod.stock,
        minStock: prod.min_stock,
        createdAt: prod.created_at,
      }));

      console.log("✅ Productos cargados:", loadedProducts.length);
      setProducts(loadedProducts);

      const { data: driversData, error: driversError } = await supabase
        .from("delivery_drivers")
        .select("*")
        .eq("active", true)
        .order("name");

      if (driversError) {
        console.error("❌ Error al cargar repartidores:", driversError);
        throw new Error(`Error en repartidores: ${driversError.message}`);
      }

      const loadedDrivers: DeliveryDriver[] = (driversData || []).map((driver: any) => ({
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        active: driver.active,
        createdAt: driver.created_at,
      }));

      console.log("✅ Repartidores cargados:", loadedDrivers.length);
      setDeliveryDrivers(loadedDrivers);

      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .select(`
          *,
          sale_items(*)
        `)
        .order("created_at", { ascending: false });

      if (salesError) {
        console.error("❌ Error al cargar ventas:", salesError);
      } else {
        const loadedSales: Sale[] = (salesData || []).map((sale: any) => ({
          id: sale.id,
          saleNumber: sale.sale_number,
          date: sale.created_at,
          total: sale.total,
          subtotal: sale.subtotal,
          discount: sale.discount_amount || 0,
          deliveryCost: sale.delivery_cost || 0,
          paymentMethod: sale.payment_method || "Efectivo",
          orderType: sale.order_type || "local",
          status: sale.status || "completed",
          note: sale.notes || "",
          customer: sale.customer_name ? {
            name: sale.customer_name,
            phone: sale.customer_phone || "",
            address: sale.customer_address || "",
            ruc: sale.customer_ruc || "",
            businessName: sale.customer_business_name || "",
            isExempt: sale.exempt || false,
            exempt: sale.exempt || false
          } : undefined,
          deliveryDriverName: sale.delivery_driver_name || undefined,
          items: (sale.sale_items || []).map((item: any) => ({
            product: {
              id: item.product_id,
              name: item.product_name,
              price: item.product_price,
              categoryId: 0,
              active: true,
              createdAt: new Date().toISOString()
            },
            quantity: item.quantity
          }))
        }));
        console.log("✅ Ventas cargadas:", loadedSales.length);
        setSales(loadedSales);
      }

      console.log("🎉 Todos los datos cargados exitosamente");
      setLoading(false);

    } catch (error: any) {
      console.error("❌ Error inesperado al cargar datos:", error);
      
      setLoading(false);
      
      alert(
        `Error al cargar datos: ${error.message || "Error desconocido"}\n\n` +
        `Por favor:\n` +
        `1. Abre la consola (F12)\n` +
        `2. Comparte una captura del error\n` +
        `3. Si el problema persiste, contacta al soporte`
      );
    }
  };

  useEffect(() => {
    loadAllData();

    const savedLogo = localStorage.getItem("businessLogo");
    if (savedLogo) {
      setBusinessLogo(savedLogo);
    }
  }, []);

  useEffect(() => {
    console.log('🔍 selectedDriverId cambió a:', selectedDriverId);
    console.log('🔍 deliveryDrivers disponibles:', deliveryDrivers);
    if (selectedDriverId) {
      const driver = deliveryDrivers.find(d => d.id === selectedDriverId);
      console.log('🔍 Repartidor seleccionado:', driver);
    }
  }, [selectedDriverId, deliveryDrivers]);

  const handleLogoChange = (logoUrl: string | null) => {
    setBusinessLogo(logoUrl);
    if (logoUrl) {
      localStorage.setItem("businessLogo", logoUrl);
    } else {
      localStorage.removeItem("businessLogo");
    }
  };

  const getDailySaleNumber = async (): Promise<string> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      console.log('📅 Generando número de venta para:', today);
      
      const { data: todaySales, error } = await supabase
        .from('sales')
        .select('sale_number')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .order('sale_number', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Error al obtener ventas del día:', error);
        const timestamp = Date.now().toString().slice(-4);
        return `${today.replace(/-/g, '')}-${timestamp}`;
      }

      console.log('📊 Última venta de hoy:', todaySales);

      if (!todaySales || todaySales.length === 0) {
        const firstNumber = `${today.replace(/-/g, '')}-0001`;
        console.log('✅ Primera venta del día:', firstNumber);
        return firstNumber;
      }

      const lastSaleNumber = todaySales[0].sale_number;
      console.log('📋 Último número de venta:', lastSaleNumber);
      
      const parts = lastSaleNumber.split('-');
      const lastSequence = parseInt(parts[parts.length - 1], 10);
      const nextSequence = lastSequence + 1;
      
      const nextNumber = `${today.replace(/-/g, '')}-${nextSequence.toString().padStart(4, '0')}`;
      
      console.log('✅ Nuevo número de venta:', nextNumber);
      
      return nextNumber;
    } catch (err) {
      console.error('❌ Error inesperado al generar número de venta:', err);
      const today = new Date().toISOString().split('T')[0];
      const timestamp = Date.now().toString().slice(-4);
      return `${today.replace(/-/g, '')}-${timestamp}`;
    }
  };

  const handleSaveProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .upsert({
          id: product.id,
          name: product.name,
          price: product.price,
          category_id: product.categoryId,
          active: product.active,
          stock: product.stock || 0
        });

      if (error) throw error;

      await loadAllData();
      alert("✅ Producto guardado exitosamente");
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("❌ Error al guardar producto");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await loadAllData();
      alert("✅ Producto eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("❌ Error al eliminar producto");
    }
  };

  const handleSaveCategory = async (category: Category) => {
    try {
      const { error } = await supabase
        .from("categories")
        .upsert({
          id: category.id,
          name: category.name,
          icon: category.icon,
          active: category.active
        });

      if (error) throw error;

      await loadAllData();
      alert("✅ Categoría guardada exitosamente");
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      alert("❌ Error al guardar categoría");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const { data: productsInCategory } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", id);

      if (productsInCategory && productsInCategory.length > 0) {
        alert("❌ No se puede eliminar la categoría porque tiene productos asociados");
        return;
      }

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await loadAllData();
      alert("✅ Categoría eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      alert("❌ Error al eliminar categoría");
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: product.name,
          price: product.price,
          category_id: product.categoryId,
          active: product.active,
          stock: product.stock || 0
        })
        .eq("id", product.id);

      if (error) throw error;

      await loadAllData();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      alert("❌ Error al actualizar producto");
    }
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountType === "percentage") {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  }, [subtotal, discountType, discountValue]);

  const cartTotal = useMemo(() => {
    const baseTotal = Math.max(0, subtotal - discountAmount);
    return orderType === "delivery" ? baseTotal + deliveryCost : baseTotal;
  }, [subtotal, discountAmount, orderType, deliveryCost]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategoryId === null || product.categoryId === selectedCategoryId;
      const isActive = product.active;
      return matchesSearch && matchesCategory && isActive;
    });
  }, [products, searchTerm, selectedCategoryId]);

  const filteredSales = useMemo(() => {
    return sales
      .filter((sale) => {
        const matchesSearch = 
          sale.saleNumber.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
          sale.customer?.name?.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
          "";
        const matchesStatus = historyFilter === "all" || sale.status === "pending";
        return matchesSearch && matchesStatus;
      })
      .slice(0, displayedSalesCount);
  }, [sales, historySearchTerm, displayedSalesCount, historyFilter]);

  const addToCart = (product: Product) => {
    if (product.stock !== undefined && product.stock <= 0) {
      alert(`❌ "${product.name}" está agotado. Stock: 0 unidades`);
      return;
    }

    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      if (product.stock !== undefined && existingItem.quantity >= product.stock) {
        alert(`❌ Stock insuficiente. Solo quedan ${product.stock} unidades de "${product.name}"`);
        return;
      }
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.product.id !== productId));
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product?.stock !== undefined && newQuantity > product.stock) {
      alert(`❌ Stock insuficiente. Solo quedan ${product.stock} unidades`);
      return;
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const updateItemNote = (productId: number, note: string) => {
    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, itemNote: note } : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    
    if (loadedSaleId) {
      const confirmMessage = "¿Qué deseas hacer?\n\nOK = Cancelar edición (mantener pedido)\nCancelar = Eliminar pedido definitivamente";
      
      if (confirm(confirmMessage)) {
        clearCartSilently();
        alert("❌ Edición cancelada\n\n💾 Pedido original mantenido");
      } else {
        if (confirm("⚠️ ¿ELIMINAR PEDIDO DEFINITIVAMENTE?\n\nEsta acción NO se puede deshacer.")) {
          handleDeleteSale(loadedSaleId);
        }
      }
    } else {
      if (confirm("¿Estás seguro de que deseas vaciar el carrito?")) {
        clearCartSilently();
      }
    }
  };

  const clearCartSilently = () => {
    setCart([]);
    setCustomerInfo({
      name: "",
      phone: "",
      address: "",
      ruc: "",
      businessName: "",
      isExempt: false,
      exempt: false
    });
    setOrderNote("");
    setDiscountValue(0);
    setSelectedDriverId(null);
    setDeliveryCost(0);
    setLoadedSaleId(null);
  };

  const handleDeleteSale = async (saleId: number) => {
    try {
      await saleService.delete(saleId);
      await loadAllData();
      clearCartSilently();
      alert("🗑️ Pedido eliminado definitivamente");
    } catch (error) {
      console.error("Error eliminando venta:", error);
      alert("❌ Error al eliminar el pedido. Por favor intenta nuevamente.");
    }
  };

  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      alert("❌ El carrito está vacío. Agrega productos primero.");
      return;
    }

    try {
      console.log("=== CONFIRMAR PEDIDO - INICIO ===");

      if (loadedSaleId) {
        console.log("📝 MODO: Actualizando venta existente ID:", loadedSaleId);

        const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        let discountAmount = 0;
        if (discountType === "percentage") {
          discountAmount = (subtotal * discountValue) / 100;
        } else if (discountType === "amount") {
          discountAmount = discountValue;
        }
        const orderTotal = subtotal - discountAmount;
        const finalTotal = orderType === "delivery" ? orderTotal + deliveryCost : orderTotal;

        const updateData = {
          customer_name: customerInfo.name || null,
          customer_phone: customerInfo.phone || null,
          customer_address: customerInfo.address || null,
          customer_ruc: customerInfo.ruc || null,
          customer_business_name: customerInfo.businessName || null,
          exempt: customerInfo.isExempt || false,
          order_type: orderType,
          notes: orderNote,
          subtotal: subtotal,
          discount_amount: discountAmount,
          total: finalTotal,
          delivery_cost: orderType === "delivery" ? deliveryCost : 0,
          driver_id: orderType === "delivery" && selectedDriverId ? selectedDriverId : null,
          delivery_driver_name: orderType === "delivery" && selectedDriverId ? deliveryDrivers.find((d) => d.id === selectedDriverId)?.name : null
        };

        const { error: updateError } = await supabase
          .from("sales")
          .update(updateData)
          .eq("id", loadedSaleId);

        if (updateError) throw updateError;

        const { error: deleteItemsError } = await supabase
          .from("sale_items")
          .delete()
          .eq("sale_id", loadedSaleId);

        if (deleteItemsError) throw deleteItemsError;

        const saleItems = cart.map((item) => ({
          sale_id: loadedSaleId,
          product_id: item.product.id,
          product_name: item.product.name,
          product_price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity
        }));

        const { error: itemsError } = await supabase
          .from("sale_items")
          .insert(saleItems);

        if (itemsError) throw itemsError;

        await loadAllData();
        alert(`✅ Pedido actualizado exitosamente`);
        clearCartSilently();
        return;
      }

      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");

      const { data: existingSales } = await supabase
        .from("sales")
        .select("sale_number")
        .like("sale_number", `${dateStr}-%`)
        .order("sale_number", { ascending: false })
        .limit(1);

      let sequence = 1;
      if (existingSales && existingSales.length > 0) {
        const lastNumber = existingSales[0].sale_number;
        const lastSequence = parseInt(lastNumber.split("-")[1]);
        sequence = lastSequence + 1;
      }

      const saleNumber = `${dateStr}-${sequence.toString().padStart(4, "0")}`;

      const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      let discountAmount = 0;
      if (discountType === "percentage") {
        discountAmount = (subtotal * discountValue) / 100;
      } else if (discountType === "amount") {
        discountAmount = discountValue;
      }
      const orderTotal = subtotal - discountAmount;
      const finalTotal = orderType === "delivery" ? orderTotal + deliveryCost : orderTotal;

      const saleData = {
        sale_number: saleNumber,
        created_at: today.toISOString(),
        customer_name: customerInfo.name || null,
        customer_phone: customerInfo.phone || null,
        customer_address: customerInfo.address || null,
        customer_ruc: customerInfo.ruc || null,
        customer_business_name: customerInfo.businessName || null,
        exempt: customerInfo.isExempt || false,
        order_type: orderType,
        status: "pending",
        notes: orderNote,
        subtotal: subtotal,
        discount_amount: discountAmount,
        total: finalTotal,
        delivery_cost: orderType === "delivery" ? deliveryCost : 0,
        driver_id: orderType === "delivery" ? (selectedDriverId || null) : null,
        delivery_driver_name: orderType === "delivery" && selectedDriverId ? deliveryDrivers.find((d) => d.id === selectedDriverId)?.name : null
      };

      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert([saleData])
        .select()
        .single();

      if (saleError) throw saleError;
      if (!sale) throw new Error("No se pudo crear la venta");

      if (sale) {
        const saleItems = cart.map(item => ({
          sale_id: sale.id,
          product_id: item.product.id,
          product_name: item.product.name,
          product_price: Number(item.product.price),
          quantity: item.quantity,
          subtotal: Number(item.product.price) * item.quantity
        }));

        const { error: itemsError } = await supabase
          .from("sale_items")
          .insert(saleItems);

        if (itemsError) {
          throw new Error(`Error al guardar items: ${itemsError.message}`);
        }
      }

      await loadAllData();
      alert(`✅ Pedido #${sale.sale_number} confirmado exitosamente`);
      clearCartSilently();

    } catch (error: unknown) {
      console.error("❌ Error al confirmar pedido:", error);
      const msg = error instanceof Error ? error.message : String(error);
      alert(`❌ Error al confirmar el pedido:\n\n${msg}\n\nRevisa la consola (F12) para más detalles.`);
    }
  };

  const handleConfirmPayment = async (payments: Payment[], note: string) => {
    if (cart.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    try {
      const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const selectedDriver = deliveryDrivers.find(d => d.id === selectedDriverId);
      const saleNumber = await getDailySaleNumber();

      if (loadedSaleId) {
        const updatedSale = {
          customerName: customerInfo.name || null,
          customerPhone: customerInfo.phone || null,
          customerAddress: customerInfo.address || null,
          orderType: orderType,
          driverId: orderType === "delivery" ? (selectedDriverId || null) : null,
          deliveryDriverName: orderType === "delivery" && selectedDriver ? selectedDriver.name : null,
          deliveryCost: orderType === "delivery" ? Number(deliveryCost) : 0,
          subtotal: Number(subtotal),
          discountAmount: Number(discountAmount),
          total: Number(cartTotal),
          paymentMethod: payments.length > 0 ? payments[0].method : "cash",
          notes: note || orderNote || null,
          status: "completed" as const,
          amountPaid: Number(amountPaid),
          balance: Math.max(0, Number(cartTotal) - Number(amountPaid))
        };

        await saleService.update(loadedSaleId, updatedSale);
        await saleService.complete(loadedSaleId);
        await loadAllData();
        clearCartSilently();
        setShowPaymentModal(false);
        alert(`✅ Pago registrado exitosamente\n\n💰 Pedido actualizado y completado`);
      } else {
        for (const item of cart) {
          if (item.product.stock !== undefined) {
            await productService.updateStock(item.product.id, -item.quantity);
          }
        }

        const finalTotal = Number(cartTotal) || 0;
        const finalSubtotal = Number(subtotal) || 0;
        const finalDiscountAmount = Number(discountAmount) || 0;
        const finalDeliveryCost = orderType === "delivery" ? (Number(deliveryCost) || 0) : 0;
        const finalAmountPaid = Number(amountPaid) || 0;
        const finalBalance = Math.max(0, finalTotal - finalAmountPaid);
        
        const saleToInsert = {
          sale_number: saleNumber,
          total: finalTotal,
          subtotal: finalSubtotal,
          discount_amount: finalDiscountAmount,
          delivery_cost: finalDeliveryCost,
          order_type: orderType,
          payment_method: payments.length > 0 ? payments[0].method : "cash",
          customer_name: customerInfo.name || null,
          customer_phone: customerInfo.phone || null,
          customer_address: customerInfo.address || null,
          customer_ruc: customerInfo.ruc || null,
          customer_business_name: customerInfo.businessName || null,
          exempt: customerInfo.isExempt || false,
          driver_id: orderType === "delivery" && selectedDriverId ? selectedDriverId : null,
          delivery_driver_name: orderType === "delivery" && selectedDriver ? selectedDriver.name : null,
          notes: note || orderNote || null,
          status: "completed",
          amount_paid: finalAmountPaid,
          balance: finalBalance,
          created_by: currentUser.name
        };

        const { data: saleData, error: saleError } = await supabase
          .from("sales")
          .insert(saleToInsert)
          .select()
          .single();

        if (saleError) {
          throw new Error(`Error al guardar venta: ${saleError.message}`);
        }

        if (saleData) {
          const saleItems = cart.map(item => ({
            sale_id: saleData.id,
            product_id: item.product.id,
            product_name: item.product.name,
            product_price: Number(item.product.price),
            quantity: item.quantity,
            subtotal: Number(item.product.price) * item.quantity
          }));

          const { error: itemsError } = await supabase
            .from("sale_items")
            .insert(saleItems);

          if (itemsError) {
            throw new Error(`Error al guardar items: ${itemsError.message}`);
          }
        }

        await loadAllData();
        setCart([]);
        setCustomerInfo({
          name: "",
          phone: "",
          address: "",
          ruc: "",
          businessName: "",
          isExempt: false,
          exempt: false
        });
        setOrderNote("");
        setDiscountValue(0);
        setSelectedDriverId(null);
        setDeliveryCost(0);
        setLoadedSaleId(null);
        setShowPaymentModal(false);
        alert(`✅ Venta ${saleNumber} confirmada exitosamente\n\n🔄 Stock actualizado automáticamente`);
      }
    } catch (error) {
      console.error("❌ Error completo al confirmar pago:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error al confirmar el pago:\n\n${errorMessage}\n\nPor favor revisa la consola del navegador (F12) para más detalles.`);
    }
  };

  const handleCancelSale = async (saleId: number, reason: string) => {
    if (confirm("¿Estás seguro de que deseas anular esta venta?")) {
      try {
        await saleService.cancel(saleId);
        await loadAllData();
      } catch (error) {
        console.error("Error cancelando venta:", error);
        alert("Error al cancelar la venta");
      }
    }
  };

  const handleSaveDriver = async (driver: DeliveryDriver) => {
    try {
      if (driver.id && driver.id > 1000000000) {
        const { error } = await supabase
          .from("delivery_drivers")
          .insert({
            name: driver.name,
            phone: driver.phone,
            active: driver.active
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("delivery_drivers")
          .update({
            name: driver.name,
            phone: driver.phone,
            active: driver.active
          })
          .eq("id", driver.id);
        if (error) throw error;
      }

      await loadAllData();
      alert("✅ Repartidor guardado exitosamente");
    } catch (error) {
      console.error("Error al guardar repartidor:", error);
      alert("❌ Error al guardar repartidor");
    }
  };

  const handleDeleteDriver = async (id: number) => {
    try {
      const { error } = await supabase
        .from("delivery_drivers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await loadAllData();
      alert("✅ Repartidor eliminado exitosamente");
    } catch (error) {
      console.error("Error eliminando repartidor:", error);
      alert("❌ Error al eliminar el repartidor");
    }
  };

  const loadSaleToEdit = async (saleId: number) => {
    try {
      const sale = sales.find(s => s.id === saleId);
      
      if (!sale) {
        alert("❌ No se encontró la venta");
        return;
      }

      const cartItems: CartItem[] = sale.items;

      setCart(cartItems);
      setCustomerInfo(sale.customer || {
        name: "",
        phone: "",
        address: "",
        ruc: "",
        businessName: "",
        isExempt: false,
        exempt: false
      });
      setOrderType(sale.orderType || "local");
      setOrderNote(sale.note || "");
      setDiscountType("percentage"); 
      setDiscountValue(0); 
      setDeliveryCost(Number(sale.deliveryCost || 0));
      
      if (sale.deliveryDriverName) {
        const driver = deliveryDrivers.find(d => d.name === sale.deliveryDriverName);
        if (driver) {
          setSelectedDriverId(driver.id);
        } else {
          setSelectedDriverId(null);
        }
      } else {
        setSelectedDriverId(null);
      }

      setLoadedSaleId(saleId);
      setActiveView("pos");
      alert(`📝 Venta #${sale.saleNumber} cargada para editar`);
    } catch (error: unknown) {
      console.error("❌ Error al cargar venta:", error);
      const msg = error instanceof Error ? error.message : String(error);
      alert(`❌ Error al cargar venta:\n\n${msg}`);
    }
  };

  const handleLoadSale = (sale: Sale) => {
    const cartItems: CartItem[] = sale.items.map(item => {
      const product = products.find(p => p.id === item.product.id);
      if (!product) return null;
      return {
        product,
        quantity: item.quantity
      };
    }).filter(Boolean) as CartItem[];

    setCart(cartItems);
    setCustomerInfo(sale.customer || {
      name: "",
      phone: "",
      address: "",
      ruc: "",
      businessName: "",
      isExempt: false,
      exempt: false
    });
    setOrderType(sale.orderType);
    setOrderNote(sale.note || "");
    setLoadedSaleId(sale.id);
    
    if (sale.deliveryCost) {
      setDeliveryCost(sale.deliveryCost);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const statusText = sale.status === "pending" ? "⏳ Pendiente de pago" : "✅ Pagado";
    alert(`📋 Pedido ${sale.saleNumber} cargado\n\n${statusText}\n\n💡 Puedes editarlo y guardar cambios`);
  };

  if (loading) {
    return (
      <div className="pos-layout">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-[#2c3e50] text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">{printFormatConfig.businessInfo.name}</h1>
          <p className="text-sm text-gray-400 mt-1">Sistema POS</p>
        </div>

        <div className="bg-green-600 text-white text-center py-2 text-xs font-bold">
          🔄 v2026-03-09-PANEL-FIX ✅
        </div>

        <nav className="flex-1 py-6">
          <button
            onClick={() => setActiveView("pos")}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
              activeView === "pos" ? "bg-[#34495e] text-white" : "text-gray-300 hover:bg-[#34495e]"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Punto de Venta</span>
          </button>

          <button
            onClick={() => setActiveView("sales")}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
              activeView === "sales" ? "bg-[#34495e] text-white" : "text-gray-300 hover:bg-[#34495e]"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Ventas</span>
          </button>

          <button
            onClick={() => setActiveView("products")}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
              activeView === "products" ? "bg-[#34495e] text-white" : "text-gray-300 hover:bg-[#34495e]"
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Productos y Servicios</span>
          </button>

          <button
            onClick={() => setActiveView("inventory")}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
              activeView === "inventory" ? "bg-[#34495e] text-white" : "text-gray-300 hover:bg-[#34495e]"
            }`}
          >
            <Store className="w-5 h-5" />
            <span>Inventario</span>
          </button>

          <button
            onClick={() => setActiveView("drivers")}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
              activeView === "drivers" ? "bg-[#34495e] text-white" : "text-gray-300 hover:bg-[#34495e]"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">🛵</div>
            <span>Repartidores</span>
          </button>

          <button
            onClick={() => setActiveView("reports")}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
              activeView === "reports" ? "bg-[#34495e] text-white" : "text-gray-300 hover:bg-[#34495e]"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Informes</span>
          </button>

          <button
            onClick={() => setActiveView("settings")}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
              activeView === "settings" ? "bg-[#34495e] text-white" : "text-gray-300 hover:bg-[#34495e]"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Ajustes</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={() => alert("Cerrar sesión")}>
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden flex">
        {activeView === "pos" && (
          <>
            <div className="w-[400px] bg-white border-r flex flex-col overflow-y-auto flex-shrink-0">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="text-sm font-medium">CLIENTE</span>
                </div>

                <div className="customer-compact">
                  <div className="customer-compact-field">
                    <label className="customer-compact-label">NOMBRE</label>
                    <input
                      type="text"
                      className="customer-compact-input"
                      placeholder="Nombre del cliente"
                      value={customerInfo.name}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, name: e.target.value })
                      }
                    />
                  </div>

                  {orderType === "delivery" && (
                    <>
                      <div className="customer-compact-field">
                        <label className="customer-compact-label">REPARTIDOR</label>
                        <select
                          className="customer-compact-input"
                          value={selectedDriverId || ""}
                          onChange={(e) => {
                            setSelectedDriverId(e.target.value ? Number(e.target.value) : null);
                          }}
                        >
                          <option value="">Seleccionar repartidor</option>
                          {deliveryDrivers.filter(d => d.active).map(driver => (
                            <option key={driver.id} value={driver.id}>
                              🛵 {driver.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="customer-compact-field">
                        <label className="customer-compact-label">COSTO DELIVERY</label>
                        <input
                          type="number"
                          className="customer-compact-input"
                          placeholder="0"
                          value={deliveryCost || ""}
                          onChange={(e) => setDeliveryCost(Math.max(0, Number(e.target.value) || 0))}
                          min="0"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="cart-items-section">
                  {cart.length === 0 ? (
                    <div className="cart-empty-state">
                      <ShoppingCart className="cart-empty-icon" />
                      <p>No hay productos en el carrito</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="cart-item-card">
                        <div className="cart-item-header">
                          <div className="cart-item-name-container">
                            <span className="cart-item-name">{item.product.name}</span>
                            {item.itemNote && (
                              <span className="cart-item-note-indicator">
                                <MessageSquare className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <span className="cart-item-price">{formatCurrency(item.product.price * item.quantity)}</span>
                        </div>
                        
                        {item.itemNote && (
                          <div className="cart-item-note-display">
                            📝 {item.itemNote}
                          </div>
                        )}
                        
                        <div className="cart-item-controls">
                          <button 
                            className="cart-item-qty-btn" 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="cart-item-quantity">{item.quantity}</span>
                          <button 
                            className="cart-item-qty-btn" 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            +
                          </button>
                          <button 
                            className="cart-item-remove" 
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="cart-item-note-input">
                          <input
                            type="text"
                            placeholder="Agregar nota (ej: Sin Huevo)"
                            value={item.itemNote || ""}
                            onChange={(e) => updateItemNote(item.product.id, e.target.value)}
                            className="cart-item-note-field"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-6 border-t">
                <div className="cart-footer">
                  <div className="order-type-buttons">
                    <button
                      className={`order-type-btn ${orderType === "delivery" ? "active" : ""}`}
                      onClick={() => {
                        setOrderType("delivery");
                        if (deliveryCost === 0) setDeliveryCost(0);
                      }}
                    >
                      Delivery
                    </button>
                    <button
                      className={`order-type-btn ${orderType === "pickup" ? "active" : ""}`}
                      onClick={() => {
                        setOrderType("pickup");
                        setDeliveryCost(0);
                        setSelectedDriverId(null);
                      }}
                    >
                      Para Retirar
                    </button>
                  </div>

                  <div className="cart-total-display">
                    {orderType === "delivery" && deliveryCost > 0 && (
                      <>
                        <div className="cart-subtotal-row">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(subtotal - discountAmount)}</span>
                        </div>
                        <div className="cart-delivery-row">
                          <span>🛵 Delivery:</span>
                          <span>{formatCurrency(deliveryCost)}</span>
                        </div>
                      </>
                    )}
                    <div className="cart-total-label">TOTAL</div>
                    <div className="cart-total-amount">{formatCurrency(cartTotal)}</div>
                  </div>

                  <div className="cart-action-buttons">
                    <button
                      className="cart-action-btn btn-confirm-order"
                      disabled={cart.length === 0}
                      onClick={handleConfirmOrder}
                    >
                      <Check className="w-4 h-4" />
                      {loadedSaleId ? "Guardar Cambios" : "Confirmar Pedido"}
                    </button>

                    <button
                      className="cart-action-btn btn-receive-payment"
                      disabled={cart.length === 0}
                      onClick={() => setShowPaymentModal(true)}
                    >
                      <DollarSign className="w-4 h-4" />
                      Recibir Pago
                    </button>

                    <button
                      className="cart-action-btn btn-print-order"
                      disabled={cart.length === 0}
                      onClick={async () => {
                        const saleNumber = loadedSaleId 
                          ? sales.find(s => s.id === loadedSaleId)?.saleNumber 
                          : await getDailySaleNumber();
                      
                        const printData = {
                          orderNumber: saleNumber || "##0001",
                          date: new Date(),
                          customerInfo,
                          items: cart,
                          orderType,
                          deliveryDriver: orderType === "delivery" ? deliveryDrivers.find(d => d.id === selectedDriverId) : undefined,
                          deliveryCost,
                          subtotal,
                          discount: discountAmount,
                          total: cartTotal,
                          note: orderNote
                        };
                    
                        printKitchenOrder(printData);
                      }}
                    >
                      <Printer className="w-4 h-4" />
                      Imprimir Pedido
                    </button>

                    <button
                      className="cart-action-btn btn-preview"
                      disabled={cart.length === 0}
                      onClick={() => setShowPreviewModal(true)}
                    >
                      <Eye className="w-4 h-4" />
                      Vista Previa
                    </button>

                    <button
                      className="cart-action-btn btn-delete-sale"
                      disabled={cart.length === 0}
                      onClick={clearCart}
                    >
                      <Trash2 className="w-4 h-4" />
                      {loadedSaleId ? "Eliminar Pedido" : "Vaciar Carrito"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-5 h-5" />
                  <span className="text-sm font-medium">PRODUCTOS</span>
                </div>

                <div className="products-search-bar">
                  <Search className="products-search-icon" />
                  <input
                    type="text"
                    className="products-search-input"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="products-tabs">
                  <button
                    className={`products-tab ${selectedCategoryId === null ? "active" : ""}`}
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setSelectedCategory("Todos");
                    }}
                  >
                    Todos
                  </button>
                  {categories.filter(c => c.active && c.name !== "Todos").map((cat) => (
                    <button
                      key={cat.id}
                      className={`products-tab ${selectedCategoryId === cat.id ? "active" : ""}`}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setSelectedCategory(cat.name);
                      }}
                    >
                      {cat.icon && <span className="mr-1">{cat.icon}</span>}
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="products-grid">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="product-card"
                      onClick={() => addToCart(product)}
                    >
                      <div className="product-card-name">{product.name}</div>
                      <div className="product-card-price">{formatCurrency(product.price)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === "sales" && (
          <SalesHistory 
            sales={sales} 
            onLoadSale={(sale) => sale.id && loadSaleToEdit(sale.id)}
            onDeleteSale={handleDeleteSale}
          />
        )}

        {activeView === "drivers" && (
          <DeliveryDrivers 
            drivers={deliveryDrivers}
            onSaveDriver={handleSaveDriver}
            onDeleteDriver={handleDeleteDriver}
          />
        )}

        {activeView === "products" && (
          <ProductsManager
            products={products}
            categories={categories}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeView === "inventory" && (
          <Inventory
            products={products}
            onUpdateProduct={handleUpdateProduct}
          />
        )}

        {activeView === "reports" && (
          <Reports
            sales={sales}
            products={products}
          />
        )}

        {activeView === "settings" && (
          <div className="h-full overflow-y-auto p-6 flex-1">
            <PrinterSettings />
          </div>
        )}
      </main>

      {showPaymentModal && (
        <PaymentModal
          total={cartTotal}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handleConfirmPayment}
        />
      )}

      {showPreviewModal && (
        <SalePreviewModal
          sale={{
            id: loadedSaleId || undefined,
            saleNumber: loadedSaleId 
              ? sales.find(s => s.id === loadedSaleId)?.saleNumber || nextSaleNumber
              : nextSaleNumber,
            date: new Date().toISOString(),
            items: cart,
            subtotal: subtotal,
            discount: discountAmount,
            deliveryCost: orderType === "delivery" ? deliveryCost : undefined,
            total: cartTotal,
            paymentMethod: "Efectivo",
            orderType: orderType === "dineIn" ? "local" : orderType,
            customer: customerInfo.name ? customerInfo : undefined,
            status: "completed",
            note: orderNote,
          }}
          businessLogo={businessLogo}
          onClose={() => setShowPreviewModal(false)}
          onPrint={async () => {
            const saleNumber = loadedSaleId 
              ? sales.find(s => s.id === loadedSaleId)?.saleNumber || nextSaleNumber
              : nextSaleNumber;
            const printData = {
              orderNumber: saleNumber,
              date: new Date(),
              customerInfo,
              items: cart,
              orderType,
              deliveryDriver: orderType === "delivery" ? deliveryDrivers.find(d => d.id === selectedDriverId) : undefined,
              deliveryCost,
              subtotal,
              discount: discountAmount,
              total: cartTotal,
              note: orderNote
            };
            
            printKitchenOrder(printData);
            setShowPreviewModal(false);
          }}
        />
      )}
    </div>
  );
}