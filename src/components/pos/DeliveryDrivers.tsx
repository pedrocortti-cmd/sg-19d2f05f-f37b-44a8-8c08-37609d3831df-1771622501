import { useState } from "react";
import { Plus, Edit, Trash2, X, Check, Phone, User } from "lucide-react";
import type { DeliveryDriver } from "@/types/pos";

interface DeliveryDriversProps {
  drivers: DeliveryDriver[];
  onSaveDriver: (driver: DeliveryDriver) => void;
  onDeleteDriver: (id: number) => void;
}

export function DeliveryDrivers({ drivers, onSaveDriver, onDeleteDriver }: DeliveryDriversProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DeliveryDriver | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("El nombre es requerido");
      return;
    }

    const driver: DeliveryDriver = {
      id: editingDriver?.id || Date.now(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      active: formData.active
    };

    onSaveDriver(driver);
    handleCancel();
  };

  const handleEdit = (driver: DeliveryDriver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      active: driver.active
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDriver(null);
    setFormData({ name: "", phone: "", active: true });
  };

  const activeDrivers = drivers.filter(d => d.active);
  const inactiveDrivers = drivers.filter(d => !d.active);

  return (
    <div className="delivery-drivers-container">
      <div className="delivery-drivers-header">
        <h2>🛵 Repartidores</h2>
        <button
          className="btn-add-driver"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4" />
          Nuevo Repartidor
        </button>
      </div>

      {showForm && (
        <div className="driver-form-overlay">
          <div className="driver-form-modal">
            <div className="driver-form-header">
              <h3>{editingDriver ? "Editar Repartidor" : "Nuevo Repartidor"}</h3>
              <button onClick={handleCancel} className="btn-close-modal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="driver-form">
              <div className="form-group">
                <label>
                  <User className="w-4 h-4" />
                  Nombre del Repartidor *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Phone className="w-4 h-4" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ej: 0981123456"
                />
              </div>

              <div className="form-group-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  Repartidor activo
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  <Check className="w-4 h-4" />
                  {editingDriver ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="drivers-section">
        <h3>✅ Repartidores Activos ({activeDrivers.length})</h3>
        {activeDrivers.length === 0 ? (
          <div className="empty-state">
            <p>No hay repartidores activos</p>
          </div>
        ) : (
          <div className="drivers-grid">
            {activeDrivers.map((driver) => (
              <div key={driver.id} className="driver-card">
                <div className="driver-info">
                  <h4>🛵 {driver.name}</h4>
                  {driver.phone && (
                    <p className="driver-phone">📱 {driver.phone}</p>
                  )}
                </div>
                <div className="driver-actions">
                  <button
                    onClick={() => handleEdit(driver)}
                    className="btn-edit-driver"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Desactivar a ${driver.name}?`)) {
                        onSaveDriver({ ...driver, active: false });
                      }
                    }}
                    className="btn-delete-driver"
                    title="Desactivar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {inactiveDrivers.length > 0 && (
        <div className="drivers-section inactive">
          <h3>❌ Repartidores Inactivos ({inactiveDrivers.length})</h3>
          <div className="drivers-grid">
            {inactiveDrivers.map((driver) => (
              <div key={driver.id} className="driver-card inactive">
                <div className="driver-info">
                  <h4>🛵 {driver.name}</h4>
                  {driver.phone && (
                    <p className="driver-phone">📱 {driver.phone}</p>
                  )}
                </div>
                <div className="driver-actions">
                  <button
                    onClick={() => {
                      if (confirm(`¿Reactivar a ${driver.name}?`)) {
                        onSaveDriver({ ...driver, active: true });
                      }
                    }}
                    className="btn-activate-driver"
                    title="Reactivar"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar permanentemente a ${driver.name}?`)) {
                        onDeleteDriver(driver.id);
                      }
                    }}
                    className="btn-delete-driver"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}