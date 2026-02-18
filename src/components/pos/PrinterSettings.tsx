import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Printer, Check, AlertCircle } from "lucide-react";

interface PrinterInfo {
  name: string;
  vendorId: number;
  productId: number;
}

export function PrinterSettings() {
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [kitchenPrinter, setKitchenPrinter] = useState("");
  const [clientPrinter, setClientPrinter] = useState("");
  const [copies, setCopies] = useState(1);
  const [serverStatus, setServerStatus] = useState<"connected" | "disconnected">("disconnected");
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  // Check print server connection
  useEffect(() => {
    checkPrintServer();
  }, []);

  const checkPrintServer = async () => {
    try {
      const response = await fetch("http://localhost:3001/printers");
      if (response.ok) {
        const data = await response.json();
        setPrinters(data.printers || []);
        setServerStatus("connected");
      } else {
        setServerStatus("disconnected");
      }
    } catch (error) {
      setServerStatus("disconnected");
    }
  };

  const handleTestPrint = async (type: "kitchen" | "client") => {
    const printerName = type === "kitchen" ? kitchenPrinter : clientPrinter;

    if (!printerName) {
      alert("Por favor selecciona una impresora primero");
      return;
    }

    try {
      const testData = {
        type,
        printerName,
        content: type === "kitchen" ? 
          {
            orderNumber: "TEST-001",
            date: new Date().toLocaleString("es-PY"),
            type: "test",
            items: [
              { name: "Producto de Prueba", quantity: 1 }
            ],
            notes: "Esta es una impresión de prueba"
          } : 
          {
            storeName: "De la Gran Burger",
            saleNumber: "TEST-001",
            date: new Date().toLocaleString("es-PY"),
            items: [
              { name: "Producto de Prueba", quantity: 1, price: 10000, subtotal: 10000 }
            ],
            subtotal: 10000,
            discount: 0,
            total: 10000,
            paymentMethod: "Efectivo"
          }
      };

      const response = await fetch("http://localhost:3001/print", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      if (response.ok) {
        setTestResult("success");
        setTimeout(() => setTestResult(null), 3000);
      } else {
        setTestResult("error");
        setTimeout(() => setTestResult(null), 3000);
      }
    } catch (error) {
      setTestResult("error");
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage
    const settings = {
      kitchenPrinter,
      clientPrinter,
      copies,
    };
    localStorage.setItem("printerSettings", JSON.stringify(settings));
    alert("Configuración guardada correctamente");
  };

  // Load settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("printerSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setKitchenPrinter(settings.kitchenPrinter || "");
      setClientPrinter(settings.clientPrinter || "");
      setCopies(settings.copies || 1);
    }
  }, []);

  return (
    <div className="printer-settings">
      <div className="settings-header">
        <h2>Configuración de Impresoras</h2>
        <div className={`server-status ${serverStatus}`}>
          <div className="status-indicator"></div>
          <span>
            {serverStatus === "connected"
              ? "Print Server Conectado"
              : "Print Server Desconectado"}
          </span>
        </div>
      </div>

      {serverStatus === "disconnected" && (
        <div className="alert alert-warning">
          <AlertCircle className="alert-icon" />
          <div>
            <h4>Print Server no detectado</h4>
            <p>
              Asegúrate de que el Print Server esté instalado y ejecutándose en tu PC.
              <br />
              Para instalar, sigue las instrucciones en el archivo README.md del proyecto.
            </p>
            <Button variant="outline" size="sm" onClick={checkPrintServer} className="mt-2">
              Reintentar Conexión
            </Button>
          </div>
        </div>
      )}

      <div className="settings-grid">
        {/* Kitchen Printer */}
        <div className="settings-section">
          <div className="section-header">
            <Printer className="section-icon" />
            <h3>Impresora de Cocina</h3>
          </div>

          <div className="form-group">
            <Label>Seleccionar Impresora</Label>
            <Select value={kitchenPrinter} onValueChange={setKitchenPrinter}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar impresora..." />
              </SelectTrigger>
              <SelectContent>
                {printers.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No hay impresoras disponibles
                  </SelectItem>
                ) : (
                  printers.map((printer, index) => (
                    <SelectItem key={index} value={printer.name}>
                      {printer.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => handleTestPrint("kitchen")}
            disabled={!kitchenPrinter || serverStatus === "disconnected"}
            className="w-full"
          >
            Imprimir Prueba - Cocina
          </Button>
        </div>

        {/* Client Printer */}
        <div className="settings-section">
          <div className="section-header">
            <Printer className="section-icon" />
            <h3>Impresora de Cliente</h3>
          </div>

          <div className="form-group">
            <Label>Seleccionar Impresora</Label>
            <Select value={clientPrinter} onValueChange={setClientPrinter}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar impresora..." />
              </SelectTrigger>
              <SelectContent>
                {printers.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No hay impresoras disponibles
                  </SelectItem>
                ) : (
                  printers.map((printer, index) => (
                    <SelectItem key={index} value={printer.name}>
                      {printer.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => handleTestPrint("client")}
            disabled={!clientPrinter || serverStatus === "disconnected"}
            className="w-full"
          >
            Imprimir Prueba - Cliente
          </Button>
        </div>
      </div>

      {/* Additional Settings */}
      <div className="settings-section">
        <h3>Configuración Adicional</h3>

        <div className="form-group">
          <Label>Número de Copias</Label>
          <Input
            type="number"
            min="1"
            max="5"
            value={copies}
            onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
          />
          <span className="help-text">
            Define cuántas copias se imprimirán de cada ticket
          </span>
        </div>

        <div className="form-group">
          <Label>Tamaño de Papel</Label>
          <div className="paper-size-badge">
            80mm (Configurado)
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="settings-footer">
        <Button onClick={handleSaveSettings} className="save-button">
          <Check className="mr-2 h-4 w-4" />
          Guardar Configuración
        </Button>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`test-result ${testResult}`}>
          {testResult === "success" ? (
            <>
              <Check className="result-icon" />
              <span>Impresión de prueba enviada correctamente</span>
            </>
          ) : (
            <>
              <AlertCircle className="result-icon" />
              <span>Error al enviar la impresión</span>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .printer-settings {
          padding: 24px;
          max-width: 1200px;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .settings-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #1e293b;
        }

        .server-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .server-status.connected {
          background: #dcfce7;
          color: #16a34a;
        }

        .server-status.disconnected {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .alert {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          display: flex;
          gap: 12px;
        }

        .alert-warning {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          color: #92400e;
        }

        .alert-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }

        .alert h4 {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .alert p {
          font-size: 14px;
          line-height: 1.5;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }

        .settings-section {
          background: white;
          padding: 24px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .section-icon {
          width: 24px;
          height: 24px;
          color: #3b82f6;
        }

        .section-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .settings-section h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 16px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .help-text {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }

        .paper-size-badge {
          display: inline-flex;
          padding: 8px 16px;
          background: #f1f5f9;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
        }

        .settings-footer {
          display: flex;
          justify-content: flex-end;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .save-button {
          min-width: 200px;
        }

        .test-result {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          border-radius: 8px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .test-result.success {
          background: #dcfce7;
          color: #16a34a;
        }

        .test-result.error {
          background: #fee2e2;
          color: #dc2626;
        }

        .result-icon {
          width: 20px;
          height: 20px;
        }
      `}</style>
    </div>
  );
}