/**
 * Servicio de impresión para tickets térmicos 80mm
 * Formato optimizado para impresoras térmicas POS
 */

import type { CartItem, CustomerInfo, OrderType, DeliveryDriver } from "@/types/pos";

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

/**
 * Formatea un número como moneda paraguaya
 */
function formatCurrency(amount: number): string {
  return `Gs.${amount.toLocaleString("es-PY")}`;
}

/**
 * Genera una línea de separación
 */
function separator(char: string = "="): string {
  return char.repeat(42);
}

/**
 * Centra un texto en el ancho del ticket (42 caracteres)
 */
function centerText(text: string): string {
  const width = 42;
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return " ".repeat(padding) + text;
}

/**
 * Formatea una línea de item: cantidad + descripción
 */
function formatItemLine(quantity: number, description: string): string {
  return `${quantity}  ${description}`;
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

  let html = `
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
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Courier New', monospace;
      font-size: 11pt;
      line-height: 1.3;
      width: 80mm;
      padding: 8mm 4mm;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 8px;
      font-weight: bold;
    }
    
    .separator {
      text-align: center;
      margin: 4px 0;
      letter-spacing: -0.5px;
    }
    
    .info-line {
      margin: 2px 0;
    }
    
    .section-title {
      font-weight: bold;
      font-size: 12pt;
      margin: 8px 0 4px 0;
      text-transform: uppercase;
    }
    
    .item {
      margin: 4px 0;
      font-size: 11pt;
    }
    
    .item-note {
      margin-left: 20px;
      font-style: italic;
      font-size: 10pt;
      color: #333;
    }
    
    .note-box {
      border: 2px solid #000;
      padding: 6px;
      margin: 8px 0;
      background: #f0f0f0;
    }
    
    .note-title {
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    
    @media print {
      body {
        background: none;
      }
    }
  </style>
</head>
<body>
`;

  // Header
  html += `  <div class="header">COMANDA COCINA</div>\n`;
  html += `  <div class="separator">${separator()}</div>\n`;
  html += `  <div class="info-line">Pedido: ${orderNumber}</div>\n`;
  html += `  <div class="info-line">${dateStr} - ${timeStr}</div>\n`;
  html += `  <div class="info-line">Tipo: ${orderType === "delivery" ? "DELIVERY" : "PARA RETIRAR"}</div>\n`;

  // Cliente
  if (customerInfo.name) {
    html += `  <div class="separator">${separator("-")}</div>\n`;
    html += `  <div class="info-line">Cliente: ${customerInfo.name}</div>\n`;
    if (customerInfo.phone) {
      html += `  <div class="info-line">Tel: ${customerInfo.phone}</div>\n`;
    }
    if (orderType === "delivery" && customerInfo.address) {
      html += `  <div class="info-line">Dir: ${customerInfo.address}</div>\n`;
    }
  }

  // Repartidor
  if (orderType === "delivery" && deliveryDriver) {
    html += `  <div class="info-line">Repartidor: ${deliveryDriver.name}</div>\n`;
  }

  // Items
  html += `  <div class="separator">${separator()}</div>\n`;
  html += `  <div class="section-title">Productos:</div>\n`;

  items.forEach((item) => {
    html += `  <div class="item">${formatItemLine(item.quantity, item.product.name)}</div>\n`;
    if (item.itemNote) {
      html += `  <div class="item-note">📝 ${item.itemNote}</div>\n`;
    }
  });

  // Nota general
  if (note) {
    html += `  <div class="separator">${separator()}</div>\n`;
    html += `  <div class="note-box">\n`;
    html += `    <div class="note-title">⚠️ NOTA IMPORTANTE:</div>\n`;
    html += `    <div>${note}</div>\n`;
    html += `  </div>\n`;
  }

  html += `  <div class="separator">${separator()}</div>\n`;

  html += `
</body>
</html>
`;

  return html;
}

/**
 * Genera el HTML para el ticket del cliente (con precios)
 */
export function generateClientTicketHTML(data: PrintOrderData): string {
  const { orderNumber, date, customerInfo, items, orderType, deliveryDriver, deliveryCost, subtotal, discount, total } = data;

  const dateStr = date.toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("es-PY", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ticket Cliente - ${orderNumber}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Courier New', monospace;
      font-size: 10pt;
      line-height: 1.3;
      width: 80mm;
      padding: 8mm 4mm;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 8px;
      font-weight: bold;
      font-size: 12pt;
    }
    
    .separator {
      text-align: center;
      margin: 4px 0;
      letter-spacing: -0.5px;
    }
    
    .info-line {
      margin: 2px 0;
      font-size: 9pt;
    }
    
    .item-line {
      display: flex;
      justify-content: space-between;
      margin: 3px 0;
      font-size: 10pt;
    }
    
    .item-name {
      flex: 1;
      padding-right: 8px;
    }
    
    .item-price {
      text-align: right;
      white-space: nowrap;
    }
    
    .item-note {
      margin-left: 12px;
      font-style: italic;
      font-size: 9pt;
      color: #333;
    }
    
    .totals {
      margin-top: 8px;
      border-top: 1px dashed #000;
      padding-top: 6px;
    }
    
    .total-line {
      display: flex;
      justify-content: space-between;
      margin: 3px 0;
      font-size: 10pt;
    }
    
    .total-final {
      font-weight: bold;
      font-size: 14pt;
      margin-top: 6px;
      padding-top: 6px;
      border-top: 2px solid #000;
    }
    
    .footer {
      text-align: center;
      margin-top: 12px;
      font-size: 10pt;
      font-weight: bold;
    }
    
    @media print {
      body {
        background: none;
      }
    }
  </style>
</head>
<body>
`;

  // Header
  html += `  <div class="header">== DE LA GRAN BURGER ==</div>\n`;
  html += `  <div class="separator">${separator()}</div>\n`;
  html += `  <div class="info-line">Pedido: ${orderNumber}</div>\n`;
  html += `  <div class="info-line">${dateStr} - ${timeStr}</div>\n`;
  
  if (customerInfo.name) {
    html += `  <div class="info-line">Cliente: ${customerInfo.name}</div>\n`;
  }
  
  html += `  <div class="info-line">Tipo: ${orderType === "delivery" ? "DELIVERY" : "PARA RETIRAR"}</div>\n`;

  if (orderType === "delivery" && deliveryDriver) {
    html += `  <div class="info-line">Repartidor: ${deliveryDriver.name}</div>\n`;
  }

  // Items
  html += `  <div class="separator">${separator()}</div>\n`;

  items.forEach((item) => {
    const itemTotal = item.product.price * item.quantity;
    html += `  <div class="item-line">\n`;
    html += `    <div class="item-name">${item.quantity} ${item.product.name}</div>\n`;
    html += `    <div class="item-price">${formatCurrency(itemTotal)}</div>\n`;
    html += `  </div>\n`;
    
    if (item.itemNote) {
      html += `  <div class="item-note">📝 ${item.itemNote}</div>\n`;
    }
  });

  // Totales
  html += `  <div class="totals">\n`;
  
  if (discount > 0) {
    html += `    <div class="total-line">\n`;
    html += `      <div>Subtotal:</div>\n`;
    html += `      <div>${formatCurrency(subtotal)}</div>\n`;
    html += `    </div>\n`;
    html += `    <div class="total-line">\n`;
    html += `      <div>Descuento:</div>\n`;
    html += `      <div>-${formatCurrency(discount)}</div>\n`;
    html += `    </div>\n`;
  }
  
  if (orderType === "delivery" && deliveryCost && deliveryCost > 0) {
    html += `    <div class="total-line">\n`;
    html += `      <div>Delivery:</div>\n`;
    html += `      <div>${formatCurrency(deliveryCost)}</div>\n`;
    html += `    </div>\n`;
  }

  html += `    <div class="total-line total-final">\n`;
  html += `      <div>TOTAL:</div>\n`;
  html += `      <div>${formatCurrency(total)}</div>\n`;
  html += `    </div>\n`;
  html += `  </div>\n`;

  html += `  <div class="separator">${separator()}</div>\n`;
  html += `  <div class="footer">¡Gracias por tu compra!</div>\n`;

  html += `
</body>
</html>
`;

  return html;
}

/**
 * Imprime un ticket abriendo una ventana de impresión
 */
export function printTicket(html: string, title: string = "Ticket"): void {
  const printWindow = window.open("", "_blank", "width=302,height=800");
  
  if (!printWindow) {
    alert("Por favor permite las ventanas emergentes para imprimir");
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Esperar a que se cargue el contenido antes de imprimir
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      
      // Cerrar la ventana después de imprimir (opcional)
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    }, 250);
  };
}

/**
 * Imprime la comanda de cocina
 */
export function printKitchenOrder(data: PrintOrderData): void {
  const html = generateKitchenTicketHTML(data);
  printTicket(html, `Comanda-${data.orderNumber}`);
}

/**
 * Imprime el ticket del cliente
 */
export function printClientTicket(data: PrintOrderData): void {
  const html = generateClientTicketHTML(data);
  printTicket(html, `Ticket-${data.orderNumber}`);
}