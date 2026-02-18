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

const PRINT_SERVER_URL = "http://localhost:3001";

export class PrintService {
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
      const response = await fetch(`${PRINT_SERVER_URL}/printers`);
      if (!response.ok) throw new Error("No se pudo conectar con el servidor de impresión");
      const data = await response.json();
      return data.printers || [];
    } catch (error) {
      console.error("Error obteniendo impresoras:", error);
      return [];
    }
  }

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

    const content = this.generateKitchenReceipt(
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

    const content = this.generateClientReceipt(
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

  private static async sendPrintJob(job: PrintJob): Promise<boolean> {
    try {
      const config = this.getConfig();
      const printer = job.type === "kitchen" ? config.kitchenPrinter : config.clientPrinter;

      const response = await fetch(`${PRINT_SERVER_URL}/print`, {
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

  private static generateKitchenReceipt(
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

  private static generateClientReceipt(
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

  static async testPrint(printerName: string, type: "kitchen" | "client"): Promise<boolean> {
    const content = type === "kitchen" 
      ? this.generateTestKitchenReceipt()
      : this.generateTestClientReceipt();

    try {
      const response = await fetch(`${PRINT_SERVER_URL}/print`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printer: printerName,
          content,
          copies: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al imprimir");
      }

      return true;
    } catch (error) {
      console.error("Error en impresión de prueba:", error);
      alert(`Error al imprimir: ${error instanceof Error ? error.message : "Error desconocido"}`);
      return false;
    }
  }

  private static generateTestKitchenReceipt(): string {
    let receipt = "\x1B\x40";
    receipt += "\x1B\x61\x01";
    receipt += "\x1B\x21\x30";
    receipt += "PRUEBA COCINA\n";
    receipt += "\x1B\x21\x00";
    receipt += "================================\n";
    receipt += "\x1B\x61\x00";
    receipt += "Esta es una impresión de prueba\n";
    receipt += "para la impresora de cocina.\n";
    receipt += "================================\n\n\n";
    receipt += "\x1B\x64\x03";
    receipt += "\x1B\x69";
    return receipt;
  }

  private static generateTestClientReceipt(): string {
    let receipt = "\x1B\x40";
    receipt += "\x1B\x61\x01";
    receipt += "\x1B\x21\x30";
    receipt += "PRUEBA CLIENTE\n";
    receipt += "\x1B\x21\x00";
    receipt += "================================\n";
    receipt += "\x1B\x61\x00";
    receipt += "Esta es una impresión de prueba\n";
    receipt += "para la impresora de cliente.\n";
    receipt += "================================\n\n\n";
    receipt += "\x1B\x64\x03";
    receipt += "\x1B\x69";
    return receipt;
  }
}