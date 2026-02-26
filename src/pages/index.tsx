import { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import { ShoppingCart, Package, BarChart3, Settings, LogOut, X, User as UserIcon, Trash2, Plus, Minus, ShoppingBag, TrendingUp, DollarSign, Users, Clock, Search, Printer, Check, Edit, Send, Eye, FileText, MessageSquare } from "lucide-react";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { SalesHistory } from "@/components/pos/SalesHistory";
import { ProductsManager } from "@/components/pos/ProductsManager";
import { Inventory } from "@/components/pos/Inventory";
import { Reports } from "@/components/pos/Reports";
import { PrinterSettings } from "@/components/pos/PrinterSettings";
import { PrintFormatSettings } from "@/components/pos/PrintFormatSettings";
import { DeliveryDrivers } from "@/components/pos/DeliveryDrivers";
import { LogoSettings } from "@/components/pos/LogoSettings";
import { SEO } from "@/components/SEO";
import { cn, formatCurrency } from "@/lib/utils";
import { printKitchenOrder } from "@/lib/printService";
import type { Product, CartItem, Sale, Category, PaymentMethod, DiscountType, OrderType, CustomerInfo, User, PrintFormatConfig, Payment, DeliveryDriver } from "@/types/pos";
import { SalePreviewModal } from "@/components/pos/SalePreviewModal";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { saleService } from "@/services/saleService";
import { driverService } from "@/services/driverService";

export default function POS() {
  // Estado para la vista actual
  const [currentView, setCurrentView] = useState<
    | "pos"
    | "sales"
    | "products"
    | "inventory"
    | "informes"
    | "settings"
    | "drivers"
  >("pos");

  // Estados del POS
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

  // Estado de repartidores
  const [deliveryDrivers, setDeliveryDrivers] = useState<DeliveryDriver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [deliveryCost, setDeliveryCost] = useState(0);

  // Estado para el próximo número de venta
  const [nextSaleNumber, setNextSaleNumber] = useState<string>("#0001");

  // Estado para controlar si estamos editando/cobrando una venta existente
  const [loadedSaleId, setLoadedSaleId] = useState<number | null>(null);

  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [displayedSalesCount, setDisplayedSalesCount] = useState(10);

  // Estado del cliente
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    ruc: "",
    businessName: "",
    isExempt: false,
    exempt: false
  });

  // Estado del tipo de orden
  const [orderType, setOrderType] = useState<OrderType>("delivery");

  // Estado de descuento
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  const [discountValue, setDiscountValue] = useState(0);

  // Estado de nota
  const [orderNote, setOrderNote] = useState("");

  // Usuario actual
  const [currentUser, setCurrentUser] = useState<User>({
    id: 1,
    username: "cajero1",
    role: "cashier",
    name: "Juan Pérez",
    active: true
  });

  // Estado para configuración de impresión
  const [printFormatConfig, setPrintFormatConfig] = useState<PrintFormatConfig>({
    comandaTitleSize: 16,
    comandaProductSize: 12,
    comandaShowPrices: false,
    comandaCopies: 1,
    comandaCustomFields: [],
    ticketHeaderSize: 14,
    ticketProductSize: 12,
    ticketTotalSize: 14,
    ticketThankYouMessage: "¡Gracias por su compra!",
    ticketShowLogo: true,
    businessInfo: {
      name: "De la Gran Burger",
      address: "Av. Principal 123, Asunción",
      phone: "021-1234567",
      ruc: "80012345-6",
      additionalInfo: ""
    }
  });

  // Estado para el logo del negocio
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);

  // Cargar todos los datos desde Supabase al iniciar
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);

      // Cargar productos
      const productsData = await productService.getActive();
      setProducts(productsData.map(p => ({
        ...p,
        categoryId: p.category_id || 0, // Mapear category_id a categoryId
        price: Number(p.price), // Asegurar que sea número
        stock: p.stock || 0
      })));

      // Cargar categorías
      const categoriesData = await categoryService.getAll();
      console.log('Categories loaded from Supabase:', categoriesData);
      setCategories(categoriesData.map(c => ({
        ...c,
        active: c.active ?? true // Asegurar active
      })));

      // Cargar ventas
      const salesData = await saleService.getAll();
      setSales(salesData.map(sale => ({
        ...sale,
        id: sale.id,
        saleNumber: sale.sale_number,
        date: new Date(sale.date || new Date()),
        items: sale.sale_items?.map(item => ({
          productId: item.product_id || 0,
          productName: item.product_name,
          quantity: item.quantity,
          price: Number(item.product_price)
        })) || [],
        subtotal: Number(sale.subtotal),
        discount: Number(sale.discount_amount || 0),
        total: Number(sale.total),
        customer: {
          name: sale.customer_name || "",
          phone: sale.customer_phone || "",
          address: sale.customer_address || "",
          ruc: sale.customer_ruc || "",
          businessName: sale.customer_business_name || "",
          isExempt: sale.exempt || false,
          exempt: sale.exempt || false
        },
        type: (sale.order_type as OrderType) || "local",
        paymentMethod: sale.payment_method || "cash",
        status: (sale.status as "pending" | "completed" | "cancelled") || "pending",
        note: sale.notes || sale.note || "",
        user: sale.created_by || "Usuario",
        deliveryDriverName: sale.delivery_driver_name || undefined,
        deliveryDriverId: sale.driver_id || undefined,
        deliveryCost: Number(sale.delivery_cost || 0),
        amountPaid: Number(sale.amount_paid || 0),
        balance: Number(sale.balance || 0)
      })));

      // Cargar conductores
      const driversData = await driverService.getActive();
      setDeliveryDrivers(driversData);

      // Cargar próximo número de venta
      const nextNumber = await saleService.getNextDailySaleNumber();
      setNextSaleNumber(nextNumber);

      // Cargar logo desde localStorage (este se mantiene en local)
      const savedLogo = localStorage.getItem("businessLogo");
      if (savedLogo) {
        setBusinessLogo(savedLogo);
      }

    } catch (error) {
      console.error("Error cargando datos:", error);
      alert("Error al cargar datos. Por favor recarga la página.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (logoUrl: string | null) => {
    setBusinessLogo(logoUrl);
    if (logoUrl) {
      localStorage.setItem("businessLogo", logoUrl);
    } else {
      localStorage.removeItem("businessLogo");
    }
  };

  // Función para obtener el número de pedido del día (ahora desde Supabase)
  const getDailySaleNumber = async (): Promise<string> => {
    try {
      return await saleService.getNextDailySaleNumber();
    } catch (error) {
      console.error("Error obteniendo número de venta:", error);
      // Fallback a localStorage si falla Supabase
      const today = new Date().toISOString().split('T')[0];
      const savedData = localStorage.getItem('dailySaleCounter');
      
      let dailyCounter = 1;
      
      if (savedData) {
        const { date, counter } = JSON.parse(savedData);
        if (date === today) {
          dailyCounter = counter + 1;
        }
      }
      
      localStorage.setItem('dailySaleCounter', JSON.stringify({
        date: today,
        counter: dailyCounter
      }));
      
      return `#${dailyCounter.toString().padStart(4, '0')}`;
    }
  };

  // Cálculos del carrito
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

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategoryId === null || product.categoryId === selectedCategoryId;
      const isActive = product.active;
      return matchesSearch && matchesCategory && isActive;
    });
  }, [products, searchTerm, selectedCategoryId]);

  // Filtrar historial de ventas
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

  // Agregar al carrito
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

  // Actualizar cantidad
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

  // Actualizar nota de un item
  const updateItemNote = (productId: number, note: string) => {
    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, itemNote: note } : item
      )
    );
  };

  // Eliminar del carrito
  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  // Vaciar carrito
  const clearCart = () => {
    if (cart.length === 0) return;
    
    if (loadedSaleId) {
      const confirmMessage = "¿Qué deseas hacer?\n\nOK = Cancelar edición (mantener pedido)\nCancelar = Eliminar pedido definitivamente";
      
      if (confirm(confirmMessage)) {
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
        alert("❌ Edición cancelada\n\n💾 Pedido original mantenido");
      } else {
        if (confirm("⚠️ ¿ELIMINAR PEDIDO DEFINITIVAMENTE?\n\nEsta acción NO se puede deshacer.")) {
          handleDeleteSale(loadedSaleId);
        }
      }
    } else {
      if (confirm("¿Estás seguro de que deseas vaciar el carrito?")) {
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
      }
    }
  };

  // Eliminar venta de Supabase
  const handleDeleteSale = async (saleId: number) => {
    try {
      // Eliminar de Supabase
      await saleService.delete(saleId);
      
      // Recargar datos para reflejar los cambios
      await loadAllData();
      
      // Limpiar el carrito y estado
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
      
      alert("🗑️ Pedido eliminado definitivamente");
    } catch (error) {
      console.error("Error eliminando venta:", error);
      alert("❌ Error al eliminar el pedido. Por favor intenta nuevamente.");
    }
  };

  // Confirmar pedido sin pago (para cocina)
  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    try {
      const selectedDriver = deliveryDrivers.find(d => d.id === selectedDriverId);
      const saleNumber = await getDailySaleNumber();

      if (loadedSaleId) {
        // MODO EDICIÓN: Actualizar pedido existente
        const updatedSale = {
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_address: customerInfo.address,
          order_type: orderType,
          driver_id: orderType === "delivery" ? (selectedDriverId || null) : null,
          delivery_driver_name: orderType === "delivery" && selectedDriver ? selectedDriver.name : null,
          delivery_cost: orderType === "delivery" ? deliveryCost : 0,
          subtotal,
          discount_amount: discountAmount,
          total: cartTotal,
          notes: orderNote,
        };

        // Actualizar en Supabase
        await saleService.update(loadedSaleId, updatedSale);

        // Recargar ventas
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

        alert(`✅ Pedido actualizado exitosamente\n\n💾 Cambios guardados`);
      } else {
        // MODO NUEVO: Crear nuevo pedido
        const newSale = {
          sale_number: saleNumber,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_address: customerInfo.address,
          order_type: orderType,
          driver_id: orderType === "delivery" ? (selectedDriverId || null) : null,
          delivery_driver_name: orderType === "delivery" && selectedDriver ? selectedDriver.name : null,
          delivery_cost: orderType === "delivery" ? deliveryCost : 0,
          subtotal,
          discount_amount: discountAmount,
          total: cartTotal,
          payment_method: "pending",
          notes: orderNote,
          created_by: currentUser.name,
          status: "pending" as const,
          amount_paid: 0,
          balance: cartTotal
        };

        const saleItems = cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          product_price: item.product.price,
          subtotal: item.product.price * item.quantity
        }));

        await saleService.create(newSale, saleItems);

        // Recargar ventas
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

        alert(`✅ Pedido ${saleNumber} confirmado\n\n🖨️ Comanda enviada a cocina\n⏳ Pendiente de pago`);
      }
    } catch (error) {
      console.error("Error confirmando pedido:", error);
      alert("Error al confirmar el pedido. Por favor intenta nuevamente.");
    }
  };

  // Confirmar pago y generar venta
  const handleConfirmPayment = async (payments: Payment[], note: string) => {
    if (cart.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    try {
      console.log('Iniciando confirmación de pago...', { payments, note, cart });
      
      const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const selectedDriver = deliveryDrivers.find(d => d.id === selectedDriverId);
      const saleNumber = await getDailySaleNumber();

      console.log('Datos calculados:', { amountPaid, selectedDriver, saleNumber, loadedSaleId });

      if (loadedSaleId) {
        console.log('MODO EDICIÓN: Actualizando pedido existente', loadedSaleId);
        
        // MODO EDICIÓN: Actualizar pedido existente con pago
        const updatedSale = {
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_address: customerInfo.address,
          order_type: orderType,
          driver_id: orderType === "delivery" ? (selectedDriverId || null) : null,
          delivery_driver_name: orderType === "delivery" && selectedDriver ? selectedDriver.name : null,
          delivery_cost: orderType === "delivery" ? deliveryCost : 0,
          subtotal,
          discount_amount: discountAmount,
          total: cartTotal,
          payment_method: payments.length > 0 ? payments[0].method : "mixed",
          notes: note || orderNote,
          status: "completed" as const,
          amount_paid: amountPaid,
          balance: Math.max(0, cartTotal - amountPaid)
        };

        console.log('Actualizando venta en Supabase...', updatedSale);
        await saleService.update(loadedSaleId, updatedSale);
        
        console.log('Completando venta...');
        await saleService.complete(loadedSaleId);

        console.log('Recargando datos...');
        await loadAllData();

        // Limpiar estado
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

        console.log('Pago completado exitosamente');
        alert(`✅ Pago registrado exitosamente\n\n💰 Pedido actualizado y completado`);
      } else {
        console.log('MODO NUEVO: Creando nueva venta directa');
        
        // MODO NUEVO: Crear nueva venta directa
        const newSale = {
          sale_number: saleNumber,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_address: customerInfo.address,
          order_type: orderType,
          driver_id: orderType === "delivery" ? (selectedDriverId || null) : null,
          delivery_driver_name: orderType === "delivery" && selectedDriver ? selectedDriver.name : null,
          delivery_cost: orderType === "delivery" ? deliveryCost : 0,
          subtotal,
          discount_amount: discountAmount,
          total: cartTotal,
          payment_method: payments.length > 0 ? payments[0].method : "mixed",
          notes: note || orderNote,
          created_by: currentUser.name,
          status: "completed" as const,
          amount_paid: amountPaid,
          balance: Math.max(0, cartTotal - amountPaid)
        };

        const saleItems = cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          product_price: item.product.price,
          subtotal: item.product.price * item.quantity
        }));

        console.log('Descontando stock de productos...');
        // Descontar stock
        for (const item of cart) {
          if (item.product.stock !== undefined) {
            await productService.updateStock(item.product.id, -item.quantity);
          }
        }

        console.log('Creando venta en Supabase...', newSale);
        await saleService.create(newSale, saleItems);

        console.log('Recargando datos...');
        await loadAllData();

        // Limpiar estado
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
        setShowPaymentModal(false);

        console.log('Venta completada exitosamente');
        alert(`✅ Venta ${saleNumber} confirmada exitosamente\n\n🔄 Stock actualizado automáticamente`);
      }
    } catch (error) {
      console.error("Error completo al confirmar pago:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack available');
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : 'Unknown',
      });
      alert(`❌ Error al confirmar el pago:\n\n${error instanceof Error ? error.message : 'Error desconocido'}\n\nPor favor intenta nuevamente o contacta soporte.`);
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

  const handleSaveProduct = async (product: Product) => {
    try {
      if (product.id && products.find(p => p.id === product.id)) {
        await productService.update(product.id, {
          name: product.name,
          price: product.price,
          category_id: product.categoryId,
          active: product.active,
          stock: product.stock
        });
      } else {
        await productService.create({
          name: product.name,
          price: product.price,
          category_id: product.categoryId,
          active: product.active,
          stock: product.stock || 0
        });
      }
      await loadAllData();
    } catch (error) {
      console.error("Error guardando producto:", error);
      alert("Error al guardar el producto");
    }
  };

  const handleSaveDriver = async (driver: DeliveryDriver) => {
    try {
      if (deliveryDrivers.find(d => d.id === driver.id)) {
        await driverService.update(driver.id, {
          name: driver.name,
          phone: driver.phone,
          active: driver.active
        });
      } else {
        await driverService.create({
          name: driver.name,
          phone: driver.phone,
          active: driver.active
        });
      }
      await loadAllData();
    } catch (error) {
      console.error("Error guardando conductor:", error);
      alert("Error al guardar el conductor");
    }
  };

  const handleDeleteDriver = async (id: number) => {
    try {
      await driverService.delete(id);
      await loadAllData();
    } catch (error) {
      console.error("Error eliminando conductor:", error);
      alert("Error al eliminar el conductor");
    }
  };

  const handleLoadSale = (sale: Sale) => {
    const cartItems: CartItem[] = sale.items.map(item => {
      const product = products.find(p => p.id === item.productId);
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
    setOrderType(sale.type);
    setOrderNote(sale.note || "");
    setLoadedSaleId(sale.id);
    
    if (sale.deliveryDriverId) {
      setSelectedDriverId(sale.deliveryDriverId);
    }
    if (sale.deliveryCost) {
      setDeliveryCost(sale.deliveryCost);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const statusText = sale.status === "pending" ? "⏳ Pendiente de pago" : "✅ Pagado";
    alert(`📋 Pedido ${sale.saleNumber} cargado\n\n${statusText}\n\n💡 Puedes editarlo y guardar cambios`);
  };

  const renderContent = () => {
    switch (currentView) {
      case "products":
        return <ProductsManager 
          products={products} 
          categories={categories}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={async (id) => {
            if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
              try {
                await productService.delete(id);
                await loadAllData();
              } catch (error) {
                console.error("Error eliminando producto:", error);
                alert("Error al eliminar el producto");
              }
            }
          }}
          onSaveCategory={async (category) => {
            try {
              if (categories.find(c => c.id === category.id)) {
                await categoryService.update(category.id, {
                  name: category.name,
                  active: category.active,
                  icon: category.icon
                });
              } else {
                await categoryService.create({
                  name: category.name,
                  active: category.active,
                  icon: category.icon
                });
              }
              await loadAllData();
            } catch (error) {
              console.error("Error guardando categoría:", error);
              alert("Error al guardar la categoría");
            }
          }}
          onDeleteCategory={async (id) => {
            if (id === 1) {
              alert('No puedes eliminar la categoría "Todos"');
              return;
            }
            if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
              try {
                await categoryService.delete(id);
                await loadAllData();
              } catch (error) {
                console.error("Error eliminando categoría:", error);
                alert("Error al eliminar la categoría");
              }
            }
          }}
        />;
      case "inventory":
        return <Inventory products={products} onUpdateProduct={handleSaveProduct} />;
      case "sales":
        return <SalesHistory 
          sales={sales}
          onLoadSale={handleLoadSale}
          onDeleteSale={handleDeleteSale}
        />;
      case "drivers":
        return <DeliveryDrivers 
          drivers={deliveryDrivers}
          onSaveDriver={handleSaveDriver}
          onDeleteDriver={handleDeleteDriver}
        />;
      case "informes":
        return <Reports sales={sales} products={products} />;
      case "settings":
        return (
          <div className="settings-container">
            <h2>⚙️ Ajustes</h2>
            <div className="settings-sections">
              <LogoSettings 
                currentLogo={businessLogo}
                onLogoChange={handleLogoChange}
              />
              <PrinterSettings />
              <PrintFormatSettings 
                config={printFormatConfig}
                onSave={setPrintFormatConfig}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const navigationItems = [
    { id: "pos", label: "Punto de Venta", icon: "🛒" },
    { id: "sales", label: "Ventas", icon: "📋" },
    { id: "products", label: "Productos y Servicios", icon: "🎯" },
    { id: "inventory", label: "Inventario", icon: "📦" },
    { id: "drivers", label: "Repartidores", icon: "🛵" },
    { id: "informes", label: "Informes", icon: "📊" },
    { id: "settings", label: "Ajustes", icon: "⚙️" },
  ];

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
    <div className="pos-layout">
      <Head>
        <title>De la Gran Burger - POS</title>
        <SEO
          title="De la Gran Burger - Sistema POS"
          description="Sistema de punto de venta para hamburguesería"
        />
      </Head>

      <div className="pos-sidebar">
        <div className="sidebar-header">
          {businessLogo ? (
            <img 
              src={businessLogo} 
              alt="Logo" 
              className="sidebar-logo-image"
            />
          ) : (
            <div className="sidebar-logo">DG</div>
          )}
          <h1 className="sidebar-title">De la Gran Burger</h1>
        </div>
        
        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${currentView === item.id ? "active" : ""}`}
              onClick={() => setCurrentView(item.id as any)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={() => alert("Cerrar sesión")}>
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {currentView === "pos" ? (
        <>
          <div className="pos-cart-panel">
            <div className="cart-panel-header">
              <ShoppingCart className="w-5 h-5" />
              <span>CARRITO</span>
            </div>

            <div className="customer-compact">
              <div className="customer-compact-field">
                <label className="customer-compact-label">CLIENTE</label>
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
                      onChange={(e) => setSelectedDriverId(e.target.value ? Number(e.target.value) : null)}
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

          <div className="pos-products-panel">
            <div className="products-panel-header">
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
                {categories.filter(c => c.active).map((cat) => (
                  <button
                    key={cat.id}
                    className={`products-tab ${selectedCategoryId === cat.id ? "active" : ""}`}
                    onClick={() => {
                      if (cat.name === "Todos") {
                        setSelectedCategoryId(null);
                      } else {
                        setSelectedCategoryId(cat.id);
                      }
                      setSelectedCategory(cat.name);
                    }}
                  >
                    {cat.icon && <span className="mr-1">{cat.icon}</span>}
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="products-grid-container">
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

          <div className="history-panel">
            <div className="history-content">
              <SalesHistory 
                sales={sales}
                onLoadSale={handleLoadSale}
                onDeleteSale={handleDeleteSale}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="pos-content-area">
          {renderContent()}
        </div>
      )}

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
            id: sales.length + 1,
            saleNumber: loadedSaleId 
              ? sales.find(s => s.id === loadedSaleId)?.saleNumber || nextSaleNumber
              : nextSaleNumber,
            date: new Date(),
            items: cart.map(item => ({
              productId: item.product.id,
              productName: item.product.name,
              quantity: item.quantity,
              price: item.product.price
            })),
            subtotal,
            discount: discountAmount,
            total: cartTotal,
            customer: customerInfo,
            customerName: customerInfo.name,
            type: orderType,
            status: "pending",
            paymentMethod: "cash",
            payments: [],
            deliveryCost,
            deliveryDriverName: orderType === "delivery" && selectedDriverId ? deliveryDrivers.find(d => d.id === selectedDriverId)?.name : undefined
          }}
          products={products}
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
          businessLogo={businessLogo}
        />
      )}
    </div>
  );
}