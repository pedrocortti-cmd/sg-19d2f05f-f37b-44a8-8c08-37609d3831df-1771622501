import { useState } from "react";
import { Plus, Edit, Trash2, X, Check, Search } from "lucide-react";
import type { DeliveryDriver } from "@/types/pos";

interface DeliveryDriversProps {
  drivers: DeliveryDriver[];
  onSaveDriver: (driver: DeliveryDriver) => void;
  onDeleteDriver: (id: number) => void;
}

export function DeliveryDrivers({
  drivers,
  onSaveDriver,
  onDeleteDriver,
}: DeliveryDriversProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingDriver, setEditingDriver] = useState<DeliveryDriver | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filteredDrivers = drivers.filter((driver) =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (driver: DeliveryDriver) => {
    setEditingDriver(driver);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingDriver({
      id: Date.now(),
      name: "",
      phone: "",
      active: true,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!editingDriver) return;

    if (!editingDriver.name.trim()) {
      alert("❌ El nombre es requerido");
      return;
    }

    onSaveDriver(editingDriver);
    setShowForm(false);
    setEditingDriver(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDriver(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este repartidor?")) {
      onDeleteDriver(id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">🛵 Repartidores</h1>
            <p className="text-gray-600">
              Gestiona los conductores de delivery
            </p>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Nuevo Repartidor
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar repartidor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4">
          {filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🛵</div>
                  <div>
                    <div className="font-semibold text-lg">{driver.name}</div>
                    {driver.phone && (
                      <div className="text-sm text-gray-600">
                        📱 {driver.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    driver.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {driver.active ? "Activo" : "Inactivo"}
                </span>
                <button
                  onClick={() => handleEdit(driver)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(driver.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {filteredDrivers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🛵</div>
              <p>No se encontraron repartidores</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && editingDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingDriver.id > 1000000000
                  ? "Nuevo Repartidor"
                  : "Editar Repartidor"}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={editingDriver.name}
                  onChange={(e) =>
                    setEditingDriver({ ...editingDriver, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={editingDriver.phone}
                  onChange={(e) =>
                    setEditingDriver({
                      ...editingDriver,
                      phone: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="0981-123456"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingDriver.active}
                  onChange={(e) =>
                    setEditingDriver({
                      ...editingDriver,
                      active: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <label className="text-sm font-medium">Activo</label>
              </div>
            </div>

            <div className="border-t p-6 flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}