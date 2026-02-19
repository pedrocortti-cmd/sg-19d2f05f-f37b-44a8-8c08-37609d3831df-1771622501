import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Printer, Check, X } from "lucide-react";
import { PrintService } from "@/lib/printService";

export function PrinterSettings() {
  const [printers, setPrinters] = useState<string[]>([]);
  const [config, setConfig] = useState(PrintService.getConfig());
  const [loading, setLoading] = useState(false);
  const [testingKitchen, setTestingKitchen] = useState(false);
  const [testingClient, setTestingClient] = useState(false);

  useEffect(() => {
    loadPrinters();
  }, []);

  const loadPrinters = async () => {
    setLoading(true);
    try {
      const availablePrinters = await PrintService.getAvailablePrinters();
      setPrinters(availablePrinters);
    } catch (error) {
      console.error("Error cargando impresoras:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    PrintService.setConfig(config);
    alert("Configuración de impresoras guardada correctamente");
  };

  const handleTestPrint = async (printer: string) => {
    setLoading(true);
    await PrintService.testPrint(printer);
    setLoading(false);
  };

  const handleTestKitchen = async () => {
    if (!config.kitchenPrinter) {
      alert("Selecciona una impresora de cocina primero");
      return;
    }
    setTestingKitchen(true);
    await PrintService.testPrint(config.kitchenPrinter);
    setTestingKitchen(false);
  };

  const handleTestClient = async () => {
    if (!config.clientPrinter) {
      alert("Selecciona una impresora de cliente primero");
      return;
    }
    setTestingClient(true);
    await PrintService.testPrint(config.clientPrinter);
    setTestingClient(false);
  };

  return (
    <div className="printer-settings">
      <div className="printer-settings-header">
        <h2>Configuración de Impresoras</h2>
        <Button onClick={loadPrinters} disabled={loading}>
          {loading ? "Cargando..." : "Actualizar Lista"}
        </Button>
      </div>

      {printers.length === 0 && !loading && (
        <Card className="p-6 text-center text-gray-500">
          <Printer size={48} className="mx-auto mb-4 opacity-50" />
          <p>No se encontraron impresoras conectadas</p>
          <p className="text-sm mt-2">
            Asegúrate de que el Print Server esté corriendo y las impresoras conectadas
          </p>
        </Card>
      )}

      {printers.length > 0 && (
        <div className="printer-config-form">
          <Card className="p-6 mb-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Printer size={20} />
              Impresora de Cocina (Comanda)
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label>Seleccionar Impresora</Label>
                <select
                  className="w-full p-2 border rounded mt-1"
                  value={config.kitchenPrinter}
                  onChange={(e) => setConfig({ ...config, kitchenPrinter: e.target.value })}
                >
                  <option value="">-- Seleccionar --</option>
                  {printers.map((printer) => (
                    <option key={printer} value={printer}>
                      {printer}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Número de Copias</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={config.copies}
                  onChange={(e) => setConfig({ ...config, copies: parseInt(e.target.value) || 1 })}
                />
              </div>

              <Button 
                onClick={handleTestKitchen} 
                disabled={!config.kitchenPrinter || testingKitchen}
                variant="outline"
                className="w-full"
              >
                {testingKitchen ? "Imprimiendo..." : "Imprimir Prueba"}
              </Button>
            </div>
          </Card>

          <Card className="p-6 mb-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Printer size={20} />
              Impresora de Cliente (Ticket)
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label>Seleccionar Impresora</Label>
                <select
                  className="w-full p-2 border rounded mt-1"
                  value={config.clientPrinter}
                  onChange={(e) => setConfig({ ...config, clientPrinter: e.target.value })}
                >
                  <option value="">-- Seleccionar --</option>
                  {printers.map((printer) => (
                    <option key={printer} value={printer}>
                      {printer}
                    </option>
                  ))}
                </select>
              </div>

              <Button 
                onClick={handleTestClient} 
                disabled={!config.clientPrinter || testingClient}
                variant="outline"
                className="w-full"
              >
                {testingClient ? "Imprimiendo..." : "Imprimir Prueba"}
              </Button>
            </div>
          </Card>

          <Card className="p-6 mb-4">
            <h3 className="text-lg font-bold mb-4">Configuración General</h3>
            
            <div>
              <Label>Tamaño de Papel</Label>
              <select
                className="w-full p-2 border rounded mt-1"
                value={config.paperSize}
                onChange={(e) => setConfig({ ...config, paperSize: e.target.value as "80mm" | "58mm" })}
              >
                <option value="80mm">80mm (Recomendado)</option>
                <option value="58mm">58mm</option>
              </select>
            </div>
          </Card>

          <Button onClick={handleSave} className="w-full" size="lg">
            <Check className="mr-2" size={20} />
            Guardar Configuración
          </Button>
        </div>
      )}

      <style jsx>{`
        .printer-settings {
          max-width: 800px;
          margin: 0 auto;
        }

        .printer-settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .printer-settings-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .printer-config-form {
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
}