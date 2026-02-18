import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Save, RotateCcw, Eye } from "lucide-react";
import type { PrintFormatConfig, BusinessInfo } from "@/types/pos";

interface Props {
  config: PrintFormatConfig;
  onSave: (config: PrintFormatConfig) => void;
}

export function PrintFormatSettings({ config, onSave }: Props) {
  const [activeTab, setActiveTab] = useState<"comanda" | "ticket">("comanda");
  const [formatConfig, setFormatConfig] = useState<PrintFormatConfig>(config);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    onSave(formatConfig);
    alert("Configuración de formato guardada correctamente");
  };

  const handleReset = () => {
    const defaultConfig: PrintFormatConfig = {
      // Comanda
      comandaTitleSize: 2,
      comandaProductSize: 1,
      comandaShowPrices: false,
      comandaCopies: 2,
      comandaCustomFields: [],
      // Ticket
      ticketHeaderSize: 2,
      ticketProductSize: 1,
      ticketTotalSize: 2,
      ticketThankYouMessage: "¡Gracias por su compra!",
      ticketShowLogo: true,
      businessInfo: {
        name: "De la Gran Burger",
        address: "Av. Principal 123",
        phone: "(021) 123-4567",
        ruc: "80012345-6",
        additionalInfo: "Delivery: (0981) 234-567"
      }
    };
    setFormatConfig(defaultConfig);
  };

  const updateComanda = (field: string, value: any) => {
    setFormatConfig({ ...formatConfig, [field]: value });
  };

  const updateTicket = (field: string, value: any) => {
    setFormatConfig({ ...formatConfig, [field]: value });
  };

  const updateBusinessInfo = (field: keyof BusinessInfo, value: string) => {
    setFormatConfig({
      ...formatConfig,
      businessInfo: { ...formatConfig.businessInfo, [field]: value }
    });
  };

  const addCustomField = () => {
    const fieldName = prompt("Nombre del campo personalizado:");
    if (fieldName) {
      updateComanda("comandaCustomFields", [
        ...formatConfig.comandaCustomFields,
        fieldName
      ]);
    }
  };

  const removeCustomField = (index: number) => {
    const fields = [...formatConfig.comandaCustomFields];
    fields.splice(index, 1);
    updateComanda("comandaCustomFields", fields);
  };

  const generatePreview = () => {
    if (activeTab === "comanda") {
      return `
========================================
${"=".repeat(40)}
${"  ".repeat(formatConfig.comandaTitleSize)}COMANDA COCINA #001
${"=".repeat(40)}

Fecha: 18/02/2026 - 17:30
Tipo: DELIVERY

----------------------------------------
PRODUCTOS
----------------------------------------
${" ".repeat(formatConfig.comandaProductSize * 2)}2x Carnívora${formatConfig.comandaShowPrices ? " - Gs. 44.000" : ""}
${" ".repeat(formatConfig.comandaProductSize * 2)}1x Chilli Doble${formatConfig.comandaShowPrices ? " - Gs. 22.000" : ""}

${formatConfig.comandaCustomFields.length > 0 ? "----------------------------------------\n" + formatConfig.comandaCustomFields.map(f => `${f}: `).join("\n") + "\n" : ""}----------------------------------------
NOTA DEL PEDIDO
----------------------------------------
Sin cebolla, extra queso

Cliente: Juan Pérez
Teléfono: 0981-234567
Dirección: Av. España 456

${"=".repeat(40)}
      `.trim();
    } else {
      return `
${"  ".repeat(formatConfig.ticketHeaderSize)}${formatConfig.businessInfo.name}
${formatConfig.businessInfo.address}
Tel: ${formatConfig.businessInfo.phone}
RUC: ${formatConfig.businessInfo.ruc}
${formatConfig.businessInfo.additionalInfo}

========================================
TICKET DE VENTA #001
========================================
Fecha: 18/02/2026 - 17:30
Cliente: Juan Pérez

----------------------------------------
${" ".repeat(formatConfig.ticketProductSize * 2)}CANT  PRODUCTO              PRECIO
----------------------------------------
${" ".repeat(formatConfig.ticketProductSize * 2)}2     Carnívora         Gs. 44.000
${" ".repeat(formatConfig.ticketProductSize * 2)}1     Chilli Doble      Gs. 22.000

----------------------------------------
Subtotal:                   Gs. 66.000
Descuento:                  Gs.      0
----------------------------------------
${"  ".repeat(formatConfig.ticketTotalSize)}TOTAL:              Gs. 66.000
----------------------------------------

Medio de Pago: Efectivo

${formatConfig.ticketThankYouMessage}

========================================
      `.trim();
    }
  };

  return (
    <div className="print-format-settings">
      <div className="format-header">
        <h2>
          <Printer className="icon" />
          Configuración de Formato de Impresión
        </h2>
        <p>Personaliza el formato de las comandas y tickets</p>
      </div>

      <div className="format-tabs">
        <button
          className={`format-tab ${activeTab === "comanda" ? "active" : ""}`}
          onClick={() => setActiveTab("comanda")}
        >
          Comanda (Cocina)
        </button>
        <button
          className={`format-tab ${activeTab === "ticket" ? "active" : ""}`}
          onClick={() => setActiveTab("ticket")}
        >
          Ticket (Cliente)
        </button>
      </div>

      <div className="format-content">
        {activeTab === "comanda" ? (
          <div className="format-section">
            <h3>Formato de Comanda para Cocina</h3>

            <div className="format-grid">
              <div className="format-field">
                <label>Tamaño del Título</label>
                <select
                  value={formatConfig.comandaTitleSize}
                  onChange={(e) => updateComanda("comandaTitleSize", Number(e.target.value))}
                >
                  <option value={1}>Normal (1x)</option>
                  <option value={2}>Grande (2x)</option>
                  <option value={3}>Extra Grande (3x)</option>
                </select>
              </div>

              <div className="format-field">
                <label>Tamaño de Productos</label>
                <select
                  value={formatConfig.comandaProductSize}
                  onChange={(e) => updateComanda("comandaProductSize", Number(e.target.value))}
                >
                  <option value={1}>Normal (1x)</option>
                  <option value={2}>Grande (2x)</option>
                </select>
              </div>

              <div className="format-field">
                <label>Número de Copias</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formatConfig.comandaCopies}
                  onChange={(e) => updateComanda("comandaCopies", Number(e.target.value))}
                />
              </div>

              <div className="format-field format-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formatConfig.comandaShowPrices}
                    onChange={(e) => updateComanda("comandaShowPrices", e.target.checked)}
                  />
                  Mostrar precios en comanda
                </label>
              </div>
            </div>

            <div className="custom-fields-section">
              <h4>Campos Personalizados</h4>
              <p className="field-description">
                Agrega campos adicionales que aparecerán en la comanda
              </p>
              
              <div className="custom-fields-list">
                {formatConfig.comandaCustomFields.map((field, index) => (
                  <div key={index} className="custom-field-item">
                    <span>{field}</span>
                    <button
                      className="remove-field-btn"
                      onClick={() => removeCustomField(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <Button variant="outline" onClick={addCustomField}>
                + Agregar Campo
              </Button>
            </div>
          </div>
        ) : (
          <div className="format-section">
            <h3>Formato de Ticket para Cliente</h3>

            <div className="format-grid">
              <div className="format-field">
                <label>Tamaño del Encabezado</label>
                <select
                  value={formatConfig.ticketHeaderSize}
                  onChange={(e) => updateTicket("ticketHeaderSize", Number(e.target.value))}
                >
                  <option value={1}>Normal (1x)</option>
                  <option value={2}>Grande (2x)</option>
                  <option value={3}>Extra Grande (3x)</option>
                </select>
              </div>

              <div className="format-field">
                <label>Tamaño de Productos</label>
                <select
                  value={formatConfig.ticketProductSize}
                  onChange={(e) => updateTicket("ticketProductSize", Number(e.target.value))}
                >
                  <option value={1}>Normal (1x)</option>
                  <option value={2}>Grande (2x)</option>
                </select>
              </div>

              <div className="format-field">
                <label>Tamaño del Total</label>
                <select
                  value={formatConfig.ticketTotalSize}
                  onChange={(e) => updateTicket("ticketTotalSize", Number(e.target.value))}
                >
                  <option value={1}>Normal (1x)</option>
                  <option value={2}>Grande (2x)</option>
                  <option value={3}>Extra Grande (3x)</option>
                </select>
              </div>

              <div className="format-field format-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formatConfig.ticketShowLogo}
                    onChange={(e) => updateTicket("ticketShowLogo", e.target.checked)}
                  />
                  Mostrar logo/encabezado
                </label>
              </div>
            </div>

            <div className="business-info-section">
              <h4>Información del Negocio</h4>
              <p className="field-description">
                Esta información aparecerá en el encabezado del ticket
              </p>

              <div className="format-grid">
                <div className="format-field full-width">
                  <label>Nombre del Negocio</label>
                  <input
                    type="text"
                    value={formatConfig.businessInfo.name}
                    onChange={(e) => updateBusinessInfo("name", e.target.value)}
                  />
                </div>

                <div className="format-field full-width">
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={formatConfig.businessInfo.address}
                    onChange={(e) => updateBusinessInfo("address", e.target.value)}
                  />
                </div>

                <div className="format-field">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    value={formatConfig.businessInfo.phone}
                    onChange={(e) => updateBusinessInfo("phone", e.target.value)}
                  />
                </div>

                <div className="format-field">
                  <label>RUC</label>
                  <input
                    type="text"
                    value={formatConfig.businessInfo.ruc}
                    onChange={(e) => updateBusinessInfo("ruc", e.target.value)}
                  />
                </div>

                <div className="format-field full-width">
                  <label>Información Adicional</label>
                  <input
                    type="text"
                    value={formatConfig.businessInfo.additionalInfo}
                    onChange={(e) => updateBusinessInfo("additionalInfo", e.target.value)}
                    placeholder="Ej: Delivery, horarios, etc."
                  />
                </div>

                <div className="format-field full-width">
                  <label>Mensaje de Agradecimiento</label>
                  <input
                    type="text"
                    value={formatConfig.ticketThankYouMessage}
                    onChange={(e) => updateTicket("ticketThankYouMessage", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="format-actions">
        <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
          <Eye className="icon" />
          {showPreview ? "Ocultar" : "Ver"} Vista Previa
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="icon" />
          Restaurar Valores por Defecto
        </Button>
        <Button onClick={handleSave}>
          <Save className="icon" />
          Guardar Configuración
        </Button>
      </div>

      {showPreview && (
        <div className="format-preview">
          <h3>Vista Previa de Impresión</h3>
          <div className="preview-paper">
            <pre>{generatePreview()}</pre>
          </div>
        </div>
      )}

      <style jsx>{`
        .print-format-settings {
          padding: 2rem;
          max-width: 1200px;
        }

        .format-header {
          margin-bottom: 2rem;
        }

        .format-header h2 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .format-header p {
          color: #6b7280;
          font-size: 0.95rem;
        }

        .format-tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
          margin-bottom: 2rem;
        }

        .format-tab {
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          font-size: 1rem;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .format-tab:hover {
          color: #3b82f6;
        }

        .format-tab.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .format-content {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 1.5rem;
        }

        .format-section h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .format-section h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
          margin-top: 2rem;
        }

        .field-description {
          color: #6b7280;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .format-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .format-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .format-field.full-width {
          grid-column: 1 / -1;
        }

        .format-field label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #374151;
        }

        .format-field input,
        .format-field select {
          padding: 0.625rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .format-field input:focus,
        .format-field select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .format-checkbox {
          flex-direction: row;
          align-items: center;
        }

        .format-checkbox label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .format-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .custom-fields-section,
        .business-info-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
        }

        .custom-fields-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .custom-field-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: #f3f4f6;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .remove-field-btn {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 4px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          line-height: 1;
        }

        .remove-field-btn:hover {
          background: #dc2626;
        }

        .format-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 12px;
        }

        .format-actions .icon {
          width: 18px;
          height: 18px;
        }

        .format-preview {
          margin-top: 2rem;
          padding: 2rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .format-preview h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .preview-paper {
          background: white;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          padding: 2rem;
          max-width: 400px;
          margin: 0 auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .preview-paper pre {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          white-space: pre-wrap;
          word-wrap: break-word;
          margin: 0;
        }

        .icon {
          width: 20px;
          height: 20px;
        }
      `}</style>
    </div>
  );
}