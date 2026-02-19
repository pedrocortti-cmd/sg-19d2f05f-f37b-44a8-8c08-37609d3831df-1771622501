import { Sale } from "@/types/pos";

// Print Service - Comunicación con Print Server local

export interface PrinterConfig {
  kitchenPrinter: string;
  clientPrinter: string;
  paperSize: "80mm" | "58mm";
  copies: number;
}

export interface PrintJob {
  type: "kitchen" | "client";
  content: string;
  copies?: number;
}

export interface PrintFormatConfig {
  header?: string;
  footer?: string;
  showLogo?: boolean;
  paperSize?: "80mm" | "58mm";
  kitchenCopies?: number;
  clientCopies?: number;
}

export class PrintService {
  private static PRINT_SERVER_URL = "http://localhost:3001";

  private static config: PrinterConfig = {
    kitchenPrinter: "",
    clientPrinter: "",
    paperSize: "80mm",
    copies: 1,
  };

  static setConfig(config: Partial<PrinterConfig>) {
    this.config = { ...this.config, ...config };
    if (typeof window !== "undefined") {
      localStorage.setItem("printerConfig", JSON.stringify(this.config));
    }
  }

  static getConfig(): PrinterConfig {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("printerConfig");
      if (saved) {
        this.config = JSON.parse(saved);
      }
    }
    return this.config;
  }

  static async getAvailablePrinters(): Promise<string[]> {
    try {
      const response = await fetch(`${this.PRINT_SERVER_URL}/printers`);
      if (!response.ok) {
        console.warn("Print Server no disponible");
        return [];
      }
      const data = await response.json();
      return data.printers || [];
    } catch (error) {
      console.warn("No se pudo conectar con el servidor de impresión:", error);
      return [];
    }
  }

  // Método legacy (mantener por compatibilidad si es necesario, o refactorizar)
  static async printKitchenOrder(
    orderNumber: string,
    items: Array<{ name: string; quantity: number; note?: string }>,
    type: string,
    note: string,
    customerName?: string,
    customerPhone?: string,
    customerAddress?: string
  ): Promise<boolean> {
    const config = this.getConfig();
    if (!config.kitchenPrinter) {
      alert("No se ha configurado la impresora de cocina. Ve a Ajustes > Impresoras.");
      return false;
    }

    const content = this.generateKitchenReceiptLegacy(
      orderNumber,
      items,
      type,
      note,
      customerName,
      customerPhone,
      customerAddress
    );

    return this.sendPrintJob({
      type: "kitchen",
      content,
      copies: config.copies,
    });
  }

  // Método legacy
  static async printClientReceipt(
    saleNumber: string,
    items: Array<{ name: string; quantity: number; price: number; subtotal: number }>,
    subtotal: number,
    discount: number,
    total: number,
    paymentMethod: string,
    customerName?: string
  ): Promise<boolean> {
    const config = this.getConfig();
    if (!config.clientPrinter) {
      alert("No se ha configurado la impresora de cliente. Ve a Ajustes > Impresoras.");
      return false;
    }

    const content = this.generateClientReceiptLegacy(
      saleNumber,
      items,
      subtotal,
      discount,
      total,
      paymentMethod,
      customerName
    );

    return this.sendPrintJob({
      type: "client",
      content,
      copies: 1,
    });
  }

  static async printKitchenTicket(
    sale: Sale,
    printerName: string,
    config: PrintFormatConfig
  ): Promise<boolean> {
    try {
      const content = this.generateKitchenTicketContent(sale, config);
      const response = await fetch(`${this.PRINT_SERVER_URL}/print`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printerName,
          content,
          copies: config.kitchenCopies || 1,
        }),
      });

      if (!response.ok) {
        console.error("Error al imprimir comanda de cocina");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error al conectar con el servidor de impresión:", error);
      alert(
        "⚠️ Servidor de impresión no disponible.\n\nPara usar la función de impresión automática:\n1. Instala el Print Server (ver carpeta print-server/)\n2. Inicia el servidor: npm start\n3. Configura las impresoras en Ajustes"
      );
      return false;
    }
  }

  static async printClientTicket(
    sale: Sale,
    printerName: string,
    config: PrintFormatConfig
  ): Promise<boolean> {
    try {
      const content = this.generateClientTicketContent(sale, config);
      const response = await fetch(`${this.PRINT_SERVER_URL}/print`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printerName,
          content,
          copies: config.clientCopies || 1,
        }),
      });

      if (!response.ok) {
        console.error("Error al imprimir ticket de cliente");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error al conectar con el servidor de impresión:", error);
      alert(
        "⚠️ Servidor de impresión no disponible.\n\nPara usar la función de impresión automática:\n1. Instala el Print Server (ver carpeta print-server/)\n2. Inicia el servidor: npm start\n3. Configura las impresoras en Ajustes"
      );
      return false;
    }
  }

  private static async sendPrintJob(job: PrintJob): Promise<boolean> {
    try {
      const config = this.getConfig();
      const printer = job.type === "kitchen" ? config.kitchenPrinter : config.clientPrinter;

      const response = await fetch(`${this.PRINT_SERVER_URL}/print`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printer,
          content: job.content,
          copies: job.copies || 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al imprimir");
      }

      return true;
    } catch (error) {
      console.error("Error en impresión:", error);
      alert(`Error al imprimir: ${error instanceof Error ? error.message : "Error desconocido"}`);
      return false;
    }
  }

  private static generateKitchenReceiptLegacy(
    orderNumber: string,
    items: Array<{ name: string; quantity: number; note?: string }>,
    type: string,
    note: string,
    customerName?: string,
    customerPhone?: string,
    customerAddress?: string
  ): string {
    const now = new Date();
    const date = now.toLocaleDateString("es-PY");
    const time = now.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" });

    let receipt = "\x1B\x40"; // Initialize
    receipt += "\x1B\x61\x01"; // Center align
    receipt += "\x1B\x21\x30"; // Double size
    receipt += "COMANDA COCINA\n";
    receipt += "\x1B\x21\x00"; // Normal size
    receipt += "================================\n";
    receipt += "\x1B\x61\x00"; // Left align
    
    receipt += `Pedido #: ${orderNumber}\n`;
    receipt += `Fecha: ${date} ${time}\n`;
    receipt += `Tipo: ${type}\n`;
    receipt += "--------------------------------\n";

    // Items
    receipt += "\x1B\x21\x10"; // Bold
    items.forEach((item) => {
      receipt += `${item.quantity}x ${item.name}\n`;
      if (item.note) {
        receipt += "\x1B\x21\x00"; // Normal
        receipt += `   Nota: ${item.note}\n`;
        receipt += "\x1B\x21\x10"; // Bold again
      }
    });
    receipt += "\x1B\x21\x00"; // Normal

    // General note
    if (note) {
      receipt += "--------------------------------\n";
      receipt += "\x1B\x21\x20"; // Double height
      receipt += `NOTA: ${note}\n`;
      receipt += "\x1B\x21\x00"; // Normal
    }

    // Customer info for delivery
    if (type === "Delivery" && customerName) {
      receipt += "--------------------------------\n";
      receipt += `Cliente: ${customerName}\n`;
      if (customerPhone) receipt += `Tel: ${customerPhone}\n`;
      if (customerAddress) receipt += `Dir: ${customerAddress}\n`;
    }

    receipt += "================================\n\n\n";
    receipt += "\x1B\x64\x03"; // Feed 3 lines
    receipt += "\x1B\x69"; // Cut paper

    return receipt;
  }

  private static generateClientReceiptLegacy(
    saleNumber: string,
    items: Array<{ name: string; quantity: number; price: number; subtotal: number }>,
    subtotal: number,
    discount: number,
    total: number,
    paymentMethod: string,
    customerName?: string
  ): string {
    const now = new Date();
    const date = now.toLocaleDateString("es-PY");
    const time = now.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" });

    let receipt = "\x1B\x40"; // Initialize
    receipt += "\x1B\x61\x01"; // Center align
    receipt += "\x1B\x21\x30"; // Double size
    receipt += "De la Gran Burger\n";
    receipt += "\x1B\x21\x00"; // Normal size
    receipt += "================================\n";
    receipt += "\x1B\x61\x00"; // Left align
    
    receipt += `Venta #: ${saleNumber}\n`;
    receipt += `Fecha: ${date} ${time}\n`;
    if (customerName) receipt += `Cliente: ${customerName}\n`;
    receipt += "--------------------------------\n";

    // Items
    items.forEach((item) => {
      receipt += `${item.quantity}x ${item.name}\n`;
      receipt += `   Gs. ${item.price.toLocaleString("es-PY")} x ${item.quantity}\n`;
      receipt += `   Subtotal: Gs. ${item.subtotal.toLocaleString("es-PY")}\n`;
    });

    receipt += "--------------------------------\n";
    receipt += `Subtotal: Gs. ${subtotal.toLocaleString("es-PY")}\n`;
    if (discount > 0) {
      receipt += `Descuento: Gs. ${discount.toLocaleString("es-PY")}\n`;
    }
    receipt += "\x1B\x21\x20"; // Double height
    receipt += `TOTAL: Gs. ${total.toLocaleString("es-PY")}\n`;
    receipt += "\x1B\x21\x00"; // Normal
    receipt += "--------------------------------\n";
    receipt += `Pago: ${paymentMethod}\n`;
    receipt += "================================\n";
    receipt += "\x1B\x61\x01"; // Center align
    receipt += "¡Gracias por tu compra!\n";
    receipt += "\x1B\x61\x00"; // Left align
    receipt += "\n\n\n";
    receipt += "\x1B\x64\x03"; // Feed 3 lines
    receipt += "\x1B\x69"; // Cut paper

    return receipt;
  }

  private static generateKitchenTicketContent(sale: Sale, config: PrintFormatConfig): string {
    const now = new Date(sale.date);
    const date = now.toLocaleDateString("es-PY");
    const time = now.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" });

    let receipt = "\x1B\x40"; // Initialize
    receipt += "\x1B\x61\x01"; // Center align
    receipt += "\x1B\x21\x30"; // Double size
    receipt += "COMANDA COCINA\n";
    receipt += "\x1B\x21\x00"; // Normal size
    receipt += "================================\n";
    receipt += "\x1B\x61\x00"; // Left align
    
    receipt += `Pedido #: ${sale.id.toString().slice(0, 8)}\n`;
    receipt += `Fecha: ${date} ${time}\n`;
    receipt += `Tipo: ${sale.type === 'dineIn' ? 'En Local' : sale.type === 'pickup' ? 'Para llevar' : 'Delivery'}\n`;
    receipt += "--------------------------------\n";

    // Items
    receipt += "\x1B\x21\x10"; // Bold
    sale.items.forEach((item) => {
      receipt += `${item.quantity}x ${item.productName}\n`;
      // Notas específicas del item si existieran (en el futuro)
    });
    receipt += "\x1B\x21\x00"; // Normal

    // General note
    if (sale.note) {
      receipt += "--------------------------------\n";
      receipt += "\x1B\x21\x20"; // Double height
      receipt += `NOTA: ${sale.note}\n`;
      receipt += "\x1B\x21\x00"; // Normal
    }

    // Customer info for delivery
    if (sale.type === "delivery" && sale.customer) {
      receipt += "--------------------------------\n";
      receipt += `Cliente: ${sale.customer.name}\n`;
      if (sale.customer.phone) receipt += `Tel: ${sale.customer.phone}\n`;
      if (sale.customer.address) receipt += `Dir: ${sale.customer.address}\n`;
    }

    receipt += "================================\n\n\n";
    receipt += "\x1B\x64\x03"; // Feed 3 lines
    receipt += "\x1B\x69"; // Cut paper

    return receipt;
  }

  private static generateClientTicketContent(sale: Sale, config: PrintFormatConfig): string {
    const now = new Date(sale.date);
    const date = now.toLocaleDateString("es-PY");
    const time = now.toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" });

    let receipt = "\x1B\x40"; // Initialize
    receipt += "\x1B\x61\x01"; // Center align
    
    // Header personalizado
    if (config.header) {
      receipt += `${config.header}\n`;
    } else {
      receipt += "\x1B\x21\x30"; // Double size
      receipt += "De la Gran Burger\n";
      receipt += "\x1B\x21\x00"; // Normal size
    }
    
    receipt += "================================\n";
    receipt += "\x1B\x61\x00"; // Left align
    
    receipt += `Venta #: ${sale.id.toString().slice(0, 8)}\n`;
    receipt += `Fecha: ${date} ${time}\n`;
    if (sale.customer?.name) receipt += `Cliente: ${sale.customer.name}\n`;
    if (sale.customer?.ruc) receipt += `RUC: ${sale.customer.ruc}\n`;
    receipt += "--------------------------------\n";

    // Items
    sale.items.forEach((item) => {
      receipt += `${item.quantity}x ${item.productName}\n`;
      receipt += `   Gs. ${item.price.toLocaleString("es-PY")} x ${item.quantity}\n`;
      receipt += `   Subtotal: Gs. ${(item.price * item.quantity).toLocaleString("es-PY")}\n`;
    });

    receipt += "--------------------------------\n";
    receipt += `Subtotal: Gs. ${sale.total.toLocaleString("es-PY")}\n`; // Nota: Sale no tiene subtotal explícito, asumimos total por ahora o calculamos
    if (sale.discount > 0) {
      receipt += `Descuento: Gs. ${sale.discount.toLocaleString("es-PY")}\n`;
    }
    receipt += "\x1B\x21\x20"; // Double height
    receipt += `TOTAL: Gs. ${sale.total.toLocaleString("es-PY")}\n`;
    receipt += "\x1B\x21\x00"; // Normal
    receipt += "--------------------------------\n";
    receipt += `Pago: ${sale.paymentMethod}\n`;
    
    // Footer personalizado
    if (config.footer) {
      receipt += "================================\n";
      receipt += "\x1B\x61\x01"; // Center align
      receipt += `${config.footer}\n`;
    } else {
      receipt += "================================\n";
      receipt += "\x1B\x61\x01"; // Center align
      receipt += "¡Gracias por tu compra!\n";
    }
    
    receipt += "\x1B\x61\x00"; // Left align
    receipt += "\n\n\n";
    receipt += "\x1B\x64\x03"; // Feed 3 lines
    receipt += "\x1B\x69"; // Cut paper

    return receipt;
  }

  static async testPrint(printerName: string): Promise<boolean> {
    try {
      const testContent = `
================================
     PRUEBA DE IMPRESIÓN
================================

Impresora: ${printerName}
Fecha: ${new Date().toLocaleString("es-PY")}

Esta es una prueba de impresión
para verificar que la impresora
está funcionando correctamente.

================================
      De la Gran Burger
================================
      `;

      const response = await fetch(`${this.PRINT_SERVER_URL}/print`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printerName,
          content: testContent,
          copies: 1,
        }),
      });

      if (!response.ok) {
        console.error("Error en prueba de impresión");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error al conectar con el servidor de impresión:", error);
      alert(
        "⚠️ Servidor de impresión no disponible.\n\nPara usar la función de impresión automática:\n1. Instala el Print Server (ver carpeta print-server/)\n2. Inicia el servidor: npm start\n3. Configura las impresoras en Ajustes"
      );
      return false;
    }
  }
}