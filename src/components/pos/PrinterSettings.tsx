import { useState, useEffect } from "react";
import { Printer, CheckCircle, AlertCircle } from "lucide-react";

interface PrinterInfo {
  id: number;
  name: string;
  vendorId: number;
  productId: number;
}

interface PrinterConfig {
  kitchenPrinter: number;
  clientPrinter: number;
  paperSize: "80mm" | "58mm";
  copies: number;
}

export function PrinterSettings() {
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [config, setConfig] = useState<PrinterConfig>({
    kitchenPrinter: 0,
    clientPrinter: 0,
    paperSize: "80mm",
    copies: 1
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [printServerAvailable, setPrintServerAvailable] = useState(false);

  useEffect(() => {
    checkPrintServer();
  }, []);

  const checkPrintServer = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/printers");
      if (response.ok) {
        const data = await response.json();
        setPrinters(data.printers || []);
        setPrintServerAvailable(true);
      } else {
        setPrintServerAvailable(false);
      }
    } catch (error) {
      setPrintServerAvailable(false);
      console.error("Print Server no disponible:", error);
    }
  };

  const handleTestPrint = async (printerIndex: number) => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch("http://localhost:3001/api/print/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printerIndex })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Impresión de prueba enviada correctamente" });
      } else {
        setMessage({ type: "error", text: data.error || "Error en la impresión" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "No se pudo conectar con el Print Server" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = () => {
    localStorage.setItem("printerConfig", JSON.stringify(config));
    setMessage({ type: "success", text: "Configuración guardada correctamente" });
    setTimeout(() => setMessage(null), 3000);
  };

  useEffect(() => {
    const savedConfig = localStorage.getItem("printerConfig");
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
          Configuración de Impresoras
        </h1>
        <p style={{ color: "#64748b" }}>Configura las impresoras térmicas para comandas y tickets</p>
      </div>

      {/* Estado del Print Server */}
      <div style={{
        background: printServerAvailable ? "#d1fae5" : "#fee2e2",
        border: `2px solid ${printServerAvailable ? "#10b981" : "#ef4444"}`,
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "2rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem"
      }}>
        {printServerAvailable ? (
          <CheckCircle size={24} color="#10b981" />
        ) : (
          <AlertCircle size={24} color="#ef4444" />
        )}
        <div>
          <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>
            {printServerAvailable ? "Print Server Conectado" : "Print Server No Disponible"}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
            {printServerAvailable 
              ? `Impresoras detectadas: ${printers.length}`
              : "Asegúrate de que el Print Server esté corriendo en http://localhost:3001"
            }
          </div>
        </div>
        <button
          onClick={checkPrintServer}
          style={{
            marginLeft: "auto",
            padding: "0.625rem 1.25rem",
            background: "white",
            border: "2px solid #e2e8f0",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Actualizar
        </button>
      </div>

      {/* Impresoras disponibles */}
      {printServerAvailable && printers.length > 0 && (
        <div style={{
          background: "white",
          border: "2px solid #e2e8f0",
          borderRadius: "12px",
          padding: "2rem",
          marginBottom: "2rem"
        }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>
            Impresoras Detectadas
          </h2>
          
          <div style={{ display: "grid", gap: "1rem" }}>
            {printers.map((printer) => (
              <div key={printer.id} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                background: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <Printer size={24} color="#3b82f6" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{printer.name}</div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                      VID: {printer.vendorId} | PID: {printer.productId}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleTestPrint(printer.id)}
                  disabled={loading}
                  style={{
                    padding: "0.625rem 1.25rem",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Probar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuración */}
      {printServerAvailable && (
        <div style={{
          background: "white",
          border: "2px solid #e2e8f0",
          borderRadius: "12px",
          padding: "2rem"
        }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>
            Configuración de Impresión
          </h2>

          <div style={{ display: "grid", gap: "1.5rem" }}>
            <div>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "0.5rem"
              }}>
                Impresora de Cocina (Comandas)
              </label>
              <select
                value={config.kitchenPrinter}
                onChange={(e) => setConfig({ ...config, kitchenPrinter: Number(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "0.95rem"
                }}
              >
                {printers.map((printer) => (
                  <option key={printer.id} value={printer.id}>
                    {printer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "0.5rem"
              }}>
                Impresora de Cliente (Tickets)
              </label>
              <select
                value={config.clientPrinter}
                onChange={(e) => setConfig({ ...config, clientPrinter: Number(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "0.95rem"
                }}
              >
                {printers.map((printer) => (
                  <option key={printer.id} value={printer.id}>
                    {printer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: "0.5rem"
              }}>
                Copias de Comanda
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={config.copies}
                onChange={(e) => setConfig({ ...config, copies: Number(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "0.95rem"
                }}
              />
            </div>

            <button
              onClick={handleSaveConfig}
              style={{
                padding: "0.875rem 1.5rem",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
              }}
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      )}

      {/* Mensajes */}
      {message && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          padding: "1rem 1.5rem",
          background: message.type === "success" ? "#10b981" : "#ef4444",
          color: "white",
          borderRadius: "8px",
          fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          zIndex: 1000
        }}>
          {message.text}
        </div>
      )}

      {/* Instrucciones */}
      <div style={{
        marginTop: "2rem",
        padding: "1.5rem",
        background: "#f8fafc",
        border: "2px solid #e2e8f0",
        borderRadius: "12px"
      }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
          Instrucciones de Configuración
        </h3>
        <ol style={{ paddingLeft: "1.5rem", lineHeight: "1.8", color: "#64748b" }}>
          <li>Asegúrate de que las impresoras térmicas USB estén conectadas a la PC</li>
          <li>Inicia el Print Server ejecutando <code style={{ background: "#e2e8f0", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>npm start</code> en la carpeta print-server</li>
          <li>Selecciona la impresora para cocina y para cliente</li>
          <li>Usa el botón "Probar" para verificar que las impresoras funcionen correctamente</li>
          <li>Guarda la configuración para que se aplique en todas las ventas</li>
        </ol>
      </div>
    </div>
  );
}