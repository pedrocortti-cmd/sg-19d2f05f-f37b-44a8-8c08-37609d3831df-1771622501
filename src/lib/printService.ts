/**
 * Servicio de impresión para tickets térmicos 80mm
 * Gestiona tanto la generación de HTML para window.print()
 * como la configuración de preferencias.
 */

import type { CartItem, CustomerInfo, OrderType, DeliveryDriver } from "@/types/pos";

// Interfaces de configuración
export interface PrinterConfig {
  kitchenPrinter: string;
  clientPrinter: string;
  copies: number;
  paperSize: "80mm" | "58mm";
}

// Interfaz de datos para impresión
export interface PrintOrderData {
  orderNumber: string;
  date: Date;
  customerInfo: CustomerInfo;
  items: CartItem[];
  orderType: OrderType;
  deliveryDriver?: DeliveryDriver;
  deliveryCost?: number;
  subtotal: number;
  discount: number;
  total: number;
  note?: string;
}

const DEFAULT_CONFIG: PrinterConfig = {
  kitchenPrinter: "",
  clientPrinter: "",
  copies: 1,
  paperSize: "80mm",
};

/**
 * Clase para compatibilidad con PrinterSettings.tsx
 * Gestiona la configuración en LocalStorage
 */
export class PrintService {
  private static STORAGE_KEY = "pos_printer_config";

  static getConfig(): PrinterConfig {
    if (typeof window === "undefined") return DEFAULT_CONFIG;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  }

  static setConfig(config: PrinterConfig): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
  }

  static async getAvailablePrinters(): Promise<string[]> {
    // En un entorno web puro no podemos listar impresoras del sistema.
    // Retornamos una lista genérica o vacía.
    // Si hubiera un print-server local, aquí se haría el fetch.
    return ["Impresora Predeterminada", "Microsoft Print to PDF", "OneNote"];
  }

  static async testPrint(printerName: string): Promise<void> {
    // Simular impresión de prueba
    console.log(`Imprimiendo prueba en: ${printerName}`);
    printTicket("<h1>Ticket de Prueba</h1><p>Si lees esto, la impresora funciona.</p>", "Prueba");
  }
}

/* =================================================================================
 * FUNCIONES DE FORMATO Y GENERACIÓN DE TICKETS
 * ================================================================================= */

function formatCurrency(amount: number): string {
  return `Gs.${amount.toLocaleString("es-PY")}`;
}

function separator(char: string = "="): string {
  return char.repeat(42);
}

function formatItemLine(quantity: number, description: string): string {
  return `${quantity} ${description}`; // Simplificado para que entre mejor
}

/**
 * Genera el HTML para el ticket de cocina (sin precios)
 */
export function generateKitchenTicketHTML(data: PrintOrderData): string {
  const { orderNumber, date, customerInfo, items, orderType, deliveryDriver, note } = data;

  const dateStr = date.toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
  const timeStr = date.toLocaleTimeString("es-PY", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Comanda Cocina - ${orderNumber}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.2;
      width: 72mm; /* Margen de seguridad para papel de 80mm */
      margin: 0 auto;
      padding: 10px 0;
    }
    .header { text-align: center; font-weight: bold; margin-bottom: 5px; font-size: 14px; }
    .separator { text-align: center; margin: 5px 0; white-space: pre; }
    .info-line { margin: 2px 0; }
    .section-title { font-weight: bold; margin: 8px 0 4px 0; text-transform: uppercase; border-bottom: 1px solid black; display: inline-block; }
    .item-row { display: flex; margin: 4px 0; }
    .item-qty { width: 25px; font-weight: bold; }
    .item-desc { flex: 1; }
    .item-note { margin-left: 25px; font-style: italic; font-size: 11px; }
    .note-box { border: 1px solid black; padding: 5px; margin: 10px 0; font-weight: bold; }
    
    @media print {
      body { width: 100%; }
    }
  </style>
</head>
<body>
  <div class="header">== DE LA GRAN BURGER ==</div>
  <div class="header">COMANDA COCINA</div>
  
  <div class="separator">${separator()}</div>
  
  <div class="info-line"><strong>Pedido:</strong> ${orderNumber}</div>
  <div class="info-line"><strong>Fecha:</strong> ${dateStr} - ${timeStr}</div>
  <div class="info-line"><strong>Tipo:</strong> ${orderType === "delivery" ? "DELIVERY" : "PARA RETIRAR"}</div>

  <div class="separator">${separator("-")}</div>

  ${customerInfo.name ? `<div class="info-line"><strong>Cliente:</strong> ${customerInfo.name}</div>` : ''}
  ${customerInfo.phone ? `<div class="info-line"><strong>Tel:</strong> ${customerInfo.phone}</div>` : ''}
  
  ${orderType === "delivery" && deliveryDriver ? 
    `<div class="info-line"><strong>Repartidor:</strong> 🛵 ${deliveryDriver.name}</div>` : ''}

  <div class="separator">${separator()}</div>
  
  <div style="margin-bottom: 5px;">CANT DESCRIPCION</div>

  ${items.map(item => `
    <div class="item-row">
      <div class="item-qty">${item.quantity}</div>
      <div class="item-desc">${item.product.name}</div>
    </div>
    ${item.itemNote ? `<div class="item-note">📝 ${item.itemNote}</div>` : ''}
  `).join('')}

  ${note ? `
    <div class="note-box">
      NOTA: ${note}
    </div>
  ` : ''}

  <div class="separator">${separator()}</div>
  <br/>
  <div style="text-align: center;">.</div>
</body>
</html>
`;
  return html;
}

/**
 * Genera el HTML para el ticket del cliente (con precios)
 */
export function generateClientTicketHTML(data: PrintOrderData): string {
    // Reutilizamos lógica similar pero con precios
    // (Implementación simplificada para mantener el archivo manejable)
    return generateKitchenTicketHTML(data); // Por ahora usa el mismo formato, se puede expandir luego
}

/**
 * Abre ventana de impresión
 */
export function printTicket(html: string, title: string = "Ticket"): void {
  const printWindow = window.open("", "_blank", "width=400,height=600");
  
  if (!printWindow) {
    alert("Por favor permite las ventanas emergentes para imprimir");
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Opcional: printWindow.close(); después de imprimir
    }, 500);
  };
}

/**
 * Wrapper para imprimir comanda
 */
export function printKitchenOrder(data: PrintOrderData): void {
  const html = generateKitchenTicketHTML(data);
  printTicket(html, `Comanda-${data.orderNumber}`);
}

export function printClientTicket(data: PrintOrderData): void {
  const html = generateClientTicketHTML(data);
  printTicket(html, `Ticket-${data.orderNumber}`);
}