import { useState } from "react";
import { Settings, Save } from "lucide-react";
import type { PrintFormatConfig } from "@/types/pos";

interface PrintFormatSettingsProps {
  config: PrintFormatConfig;
  onSave: (config: PrintFormatConfig) => void;
}

export function PrintFormatSettings({ config, onSave }: PrintFormatSettingsProps) {
  const [localConfig, setLocalConfig] = useState<PrintFormatConfig>(config);

  const handleSave = () => {
    onSave(localConfig);
    localStorage.setItem("printFormatConfig", JSON.stringify(localConfig));
    alert("✅ Configuración de formato guardada");
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold">Formato de Impresión</h3>
      </div>

      <div className="space-y-6">
        {/* Configuración de Comanda */}
        <div>
          <h4 className="font-semibold mb-4">📋 Comanda de Cocina</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tamaño Título
              </label>
              <input
                type="number"
                value={localConfig.comandaTitleSize}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    comandaTitleSize: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded"
                min="12"
                max="24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Tamaño Productos
              </label>
              <input
                type="number"
                value={localConfig.comandaProductSize}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    comandaProductSize: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded"
                min="10"
                max="20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Copias</label>
              <input
                type="number"
                value={localConfig.comandaCopies}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    comandaCopies: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded"
                min="1"
                max="5"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={localConfig.comandaShowPrices}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    comandaShowPrices: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label className="text-sm font-medium">Mostrar Precios</label>
            </div>
          </div>
        </div>

        {/* Configuración de Ticket Cliente */}
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">🧾 Ticket Cliente</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tamaño Encabezado
              </label>
              <input
                type="number"
                value={localConfig.ticketHeaderSize}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    ticketHeaderSize: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded"
                min="12"
                max="20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Tamaño Productos
              </label>
              <input
                type="number"
                value={localConfig.ticketProductSize}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    ticketProductSize: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded"
                min="10"
                max="16"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Tamaño Total
              </label>
              <input
                type="number"
                value={localConfig.ticketTotalSize}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    ticketTotalSize: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded"
                min="12"
                max="20"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={localConfig.ticketShowLogo}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    ticketShowLogo: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label className="text-sm font-medium">Mostrar Logo</label>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Mensaje de Agradecimiento
            </label>
            <input
              type="text"
              value={localConfig.ticketThankYouMessage}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  ticketThankYouMessage: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded"
              placeholder="¡Gracias por su compra!"
            />
          </div>
        </div>

        {/* Información del Negocio */}
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">🏪 Información del Negocio</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre del Negocio
              </label>
              <input
                type="text"
                value={localConfig.businessInfo.name}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    businessInfo: {
                      ...localConfig.businessInfo,
                      name: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={localConfig.businessInfo.address}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    businessInfo: {
                      ...localConfig.businessInfo,
                      address: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={localConfig.businessInfo.phone}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      businessInfo: {
                        ...localConfig.businessInfo,
                        phone: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">RUC</label>
                <input
                  type="text"
                  value={localConfig.businessInfo.ruc}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      businessInfo: {
                        ...localConfig.businessInfo,
                        ruc: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Información Adicional
              </label>
              <textarea
                value={localConfig.businessInfo.additionalInfo}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    businessInfo: {
                      ...localConfig.businessInfo,
                      additionalInfo: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded"
                rows={3}
                placeholder="Ej: Horarios, redes sociales, etc."
              />
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="border-t pt-6">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Save className="w-5 h-5" />
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
}