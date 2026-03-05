import { useState, useEffect } from "react";
import { Printer, Check, X, AlertCircle } from "lucide-react";

export function PrinterSettings() {
  const [printers, setPrinters] = useState<string[]>([]);
  const [kitchenPrinter, setKitchenPrinter] = useState("");
  const [clientPrinter, setClientPrinter] = useState("");
  const [serverStatus, setServerStatus] = useState<"connected" | "disconnected" | "checking">("checking");

  useEffect(() => {
    checkPrintServer();
    loadSettings();
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

  const loadSettings = () => {
    const saved = localStorage.getItem("printerSettings");
    if (saved) {
      const settings = JSON.parse(saved);
      setKitchenPrinter(settings.kitchenPrinter || "");
      setClientPrinter(settings.clientPrinter || "");
    }
  };

  const saveSettings = () => {
    const settings = { kitchenPrinter, clientPrinter };
    localStorage.setItem("printerSettings", JSON.stringify(settings));
    alert("✅ Configuración guardada exitosamente");
  };

  const testPrint = async (type: "kitchen" | "client") => {
    const printer = type === "kitchen" ? kitchenPrinter : clientPrinter;
    
    if (!printer) {
      alert("❌ Selecciona una impresora primero");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printer,
          type,
          test: true
        })
      });

      if (response.ok) {
        alert("✅ Impresión de prueba enviada");
      } else {
        alert("❌ Error al imprimir");
      }
    } catch (error) {
      alert("❌ No se pudo conectar con el servidor de impresión");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Printer className="w-6 h-6" />
        Configuración de Impresoras
      </h3>

      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${
            serverStatus === "connected" ? "bg-green-500" :
            serverStatus === "disconnected" ? "bg-red-500" :
            "bg-yellow-500 animate-pulse"
          }`} />
          <span className="font-medium">
            Print Server: {
              serverStatus === "connected" ? "Conectado" :
              serverStatus === "disconnected" ? "Desconectado" :
              "Verificando..."
            }
          </span>
        </div>
        
        {serverStatus === "disconnected" && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Print Server no está corriendo</p>
                <p>Asegúrate de que el servidor esté iniciado en la PC del local.</p>
                <p className="mt-1">Comando: <code className="bg-orange-100 px-2 py-1 rounded">cd print-server && npm start</code></p>
              </div>
            </div>
          </div>
        )}

        {serverStatus === "connected" && printers.length === 0 && (
          <p className="text-sm text-gray-600 mt-2">
            ⚠️ No se detectaron impresoras USB conectadas
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Impresora de Cocina (Comanda)
          </label>
          <select
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={kitchenPrinter}
            onChange={(e) => setKitchenPrinter(e.target.value)}
            disabled={serverStatus !== "connected"}
          >
            <option value="">Seleccionar impresora...</option>
            {printers.map((printer) => (
              <option key={printer} value={printer}>
                {printer}
              </option>
            ))}
          </select>
          {kitchenPrinter && (
            <button
              onClick={() => testPrint("kitchen")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              Imprimir Prueba
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Impresora de Cliente (Ticket)
          </label>
          <select
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={clientPrinter}
            onChange={(e) => setClientPrinter(e.target.value)}
            disabled={serverStatus !== "connected"}
          >
            <option value="">Seleccionar impresora...</option>
            {printers.map((printer) => (
              <option key={printer} value={printer}>
                {printer}
              </option>
            ))}
          </select>
          {clientPrinter && (
            <button
              onClick={() => testPrint("client")}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              Imprimir Prueba
            </button>
          )}
        </div>

        <div className="pt-4 border-t">
          <button
            onClick={saveSettings}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
}