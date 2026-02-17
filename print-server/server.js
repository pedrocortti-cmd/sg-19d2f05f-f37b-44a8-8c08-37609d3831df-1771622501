const express = require('express');
const cors = require('cors');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Detectar impresoras USB disponibles
function getAvailablePrinters() {
  try {
    const devices = escpos.USB.findPrinter();
    return devices.map((device, index) => ({
      id: index,
      name: `USB Printer ${index + 1}`,
      vendorId: device.deviceDescriptor.idVendor,
      productId: device.deviceDescriptor.idProduct
    }));
  } catch (error) {
    console.error('Error detectando impresoras:', error);
    return [];
  }
}

// Función para imprimir comanda de cocina (sin precios)
async function printKitchenTicket(data, printerIndex = 0) {
  try {
    const devices = escpos.USB.findPrinter();
    if (!devices[printerIndex]) {
      throw new Error('Impresora de cocina no encontrada');
    }

    const device = new escpos.USB(devices[printerIndex]);
    const printer = new escpos.Printer(device);

    device.open(function(error) {
      if (error) {
        console.error('Error abriendo impresora:', error);
        return;
      }

      printer
        .font('a')
        .align('ct')
        .style('bu')
        .size(1, 1)
        .text('═══════════════════════════════')
        .text('COMANDA COCINA')
        .text('DE LA GRAN BURGER')
        .text('═══════════════════════════════')
        .style('normal')
        .size(0, 0)
        .text('')
        .align('lt')
        .text(`Pedido: ${data.orderNumber}`)
        .text(`Fecha: ${new Date(data.date).toLocaleString('es-PY')}`)
        .text(`Tipo: ${data.orderType.toUpperCase()}`)
        .text('─────────────────────────────')
        .text('')
        .style('b');

      // Items
      data.items.forEach(item => {
        printer
          .size(1, 1)
          .text(`${item.quantity}x ${item.product.name}`)
          .size(0, 0);
      });

      printer
        .style('normal')
        .text('')
        .text('─────────────────────────────');

      // Nota si existe
      if (data.note) {
        printer
          .text('')
          .style('bu')
          .size(1, 1)
          .text('NOTA:')
          .style('normal')
          .size(0, 0)
          .text(data.note)
          .text('─────────────────────────────');
      }

      // Info del cliente si es delivery
      if (data.orderType === 'delivery' && data.customer.name) {
        printer
          .text('')
          .text('CLIENTE:')
          .text(`Nombre: ${data.customer.name}`)
          .text(`Tel: ${data.customer.phone}`)
          .text(`Dir: ${data.customer.address}`)
          .text('─────────────────────────────');
      }

      printer
        .text('')
        .align('ct')
        .text('═══════════════════════════════')
        .cut()
        .close();
    });

    return { success: true, message: 'Comanda impresa correctamente' };
  } catch (error) {
    console.error('Error imprimiendo comanda:', error);
    throw error;
  }
}

// Función para imprimir ticket de cliente (con precios)
async function printClientTicket(data, printerIndex = 0) {
  try {
    const devices = escpos.USB.findPrinter();
    if (!devices[printerIndex]) {
      throw new Error('Impresora de cliente no encontrada');
    }

    const device = new escpos.USB(devices[printerIndex]);
    const printer = new escpos.Printer(device);

    device.open(function(error) {
      if (error) {
        console.error('Error abriendo impresora:', error);
        return;
      }

      printer
        .font('a')
        .align('ct')
        .style('bu')
        .size(1, 1)
        .text('DE LA GRAN BURGER')
        .style('normal')
        .size(0, 0)
        .text('')
        .text('═══════════════════════════════')
        .align('lt')
        .text(`Pedido: ${data.orderNumber}`)
        .text(`Fecha: ${new Date(data.date).toLocaleString('es-PY')}`)
        .text(`Tipo: ${data.orderType.toUpperCase()}`)
        .text('─────────────────────────────')
        .text('');

      // Items con precios
      data.items.forEach(item => {
        const itemTotal = item.product.price * item.quantity;
        printer.text(`${item.quantity}x ${item.product.name}`);
        printer.text(`   Gs. ${item.product.price.toLocaleString()} x ${item.quantity} = Gs. ${itemTotal.toLocaleString()}`);
      });

      printer
        .text('')
        .text('─────────────────────────────');

      // Totales
      printer
        .text(`Subtotal:     Gs. ${data.subtotal.toLocaleString()}`)
        .text(`Descuento:    Gs. ${data.discountAmount.toLocaleString()}`)
        .style('bu')
        .size(1, 1)
        .text(`TOTAL:        Gs. ${data.total.toLocaleString()}`)
        .style('normal')
        .size(0, 0)
        .text('─────────────────────────────')
        .text(`Pago: ${data.paymentMethod.toUpperCase()}`)
        .text('─────────────────────────────');

      // Cliente si existe
      if (data.customer.name) {
        printer
          .text('')
          .text(`Cliente: ${data.customer.name}`)
          .text(`Tel: ${data.customer.phone}`);
        
        if (data.customer.ruc) {
          printer.text(`RUC: ${data.customer.ruc}`);
        }
      }

      printer
        .text('')
        .align('ct')
        .text('═══════════════════════════════')
        .text('¡Gracias por tu compra!')
        .text('')
        .cut()
        .close();
    });

    return { success: true, message: 'Ticket de cliente impreso correctamente' };
  } catch (error) {
    console.error('Error imprimiendo ticket cliente:', error);
    throw error;
  }
}

// Endpoints

// Listar impresoras disponibles
app.get('/api/printers', (req, res) => {
  try {
    const printers = getAvailablePrinters();
    res.json({ success: true, printers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Imprimir comanda de cocina
app.post('/api/print/kitchen', async (req, res) => {
  try {
    const { data, printerIndex = 0 } = req.body;
    const result = await printKitchenTicket(data, printerIndex);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Imprimir ticket de cliente
app.post('/api/print/client', async (req, res) => {
  try {
    const { data, printerIndex = 0 } = req.body;
    const result = await printClientTicket(data, printerIndex);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Imprimir ambos tickets (comanda + cliente)
app.post('/api/print/both', async (req, res) => {
  try {
    const { data, kitchenPrinter = 0, clientPrinter = 0, copies = 1 } = req.body;
    
    const results = [];
    
    // Imprimir comanda de cocina
    for (let i = 0; i < copies; i++) {
      const kitchenResult = await printKitchenTicket(data, kitchenPrinter);
      results.push(kitchenResult);
    }
    
    // Imprimir ticket de cliente
    const clientResult = await printClientTicket(data, clientPrinter);
    results.push(clientResult);
    
    res.json({ success: true, message: 'Tickets impresos correctamente', results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint de prueba
app.post('/api/print/test', async (req, res) => {
  try {
    const { printerIndex = 0 } = req.body;
    const devices = escpos.USB.findPrinter();
    
    if (!devices[printerIndex]) {
      throw new Error('Impresora no encontrada');
    }

    const device = new escpos.USB(devices[printerIndex]);
    const printer = new escpos.Printer(device);

    device.open(function(error) {
      if (error) {
        res.status(500).json({ success: false, error: error.message });
        return;
      }

      printer
        .font('a')
        .align('ct')
        .style('bu')
        .size(1, 1)
        .text('DE LA GRAN BURGER')
        .style('normal')
        .size(0, 0)
        .text('')
        .text('═══════════════════════════════')
        .text('PRUEBA DE IMPRESIÓN')
        .text('═══════════════════════════════')
        .text('')
        .text(`Fecha: ${new Date().toLocaleString('es-PY')}`)
        .text('')
        .text('Impresora configurada correctamente')
        .text('')
        .text('═══════════════════════════════')
        .cut()
        .close();
    });

    res.json({ success: true, message: 'Impresión de prueba enviada' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🖨️  Print Server corriendo en http://localhost:${PORT}`);
  console.log('════════════════════════════════════════════════');
  console.log('📋 Endpoints disponibles:');
  console.log('   GET  /api/printers - Listar impresoras');
  console.log('   POST /api/print/kitchen - Imprimir comanda');
  console.log('   POST /api/print/client - Imprimir ticket');
  console.log('   POST /api/print/both - Imprimir ambos');
  console.log('   POST /api/print/test - Prueba de impresión');
  console.log('════════════════════════════════════════════════\n');
  
  // Detectar impresoras al iniciar
  const printers = getAvailablePrinters();
  console.log(`🔍 Impresoras detectadas: ${printers.length}`);
  printers.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name} (VID: ${p.vendorId}, PID: ${p.productId})`);
  });
  console.log('');
});