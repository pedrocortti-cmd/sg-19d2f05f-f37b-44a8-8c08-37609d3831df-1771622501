import { useState, useEffect } from "react";
import { Upload, X, Eye, Check } from "lucide-react";

interface LogoSettingsProps {
  onLogoChange: (logoUrl: string | null) => void;
  currentLogo: string | null;
}

export function LogoSettings({ onLogoChange, currentLogo }: LogoSettingsProps) {
  const [preview, setPreview] = useState<string | null>(currentLogo);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPreview(currentLogo);
  }, [currentLogo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea PNG
    if (!file.type.includes("png")) {
      alert("❌ Solo se permiten archivos PNG");
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("❌ El archivo es muy grande. Máximo 2MB");
      return;
    }

    setUploading(true);

    // Leer archivo como base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      setUploading(false);
    };
    reader.onerror = () => {
      alert("❌ Error al leer el archivo");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!preview) {
      alert("❌ No hay logo para guardar");
      return;
    }

    // Guardar en localStorage
    localStorage.setItem("businessLogo", preview);
    onLogoChange(preview);
    alert("✅ Logo guardado exitosamente");
  };

  const handleRemove = () => {
    if (confirm("¿Estás seguro de que deseas eliminar el logo?")) {
      setPreview(null);
      localStorage.removeItem("businessLogo");
      onLogoChange(null);
      alert("🗑️ Logo eliminado");
    }
  };

  const handleReset = () => {
    setPreview(currentLogo);
  };

  return (
    <div className="logo-settings-container">
      <h3 className="logo-settings-title">🖼️ Logo del Negocio</h3>
      
      <div className="logo-settings-content">
        {/* Vista previa del logo */}
        <div className="logo-preview-section">
          <label className="logo-preview-label">Vista Previa</label>
          <div className="logo-preview-box">
            {preview ? (
              <img 
                src={preview} 
                alt="Logo" 
                className="logo-preview-image"
              />
            ) : (
              <div className="logo-preview-placeholder">
                <Upload className="w-12 h-12 text-gray-400" />
                <p className="text-gray-500 mt-2">Sin logo</p>
              </div>
            )}
          </div>
        </div>

        {/* Controles */}
        <div className="logo-controls-section">
          <div className="logo-upload-area">
            <label htmlFor="logo-upload" className="logo-upload-button">
              <Upload className="w-4 h-4" />
              Subir Logo PNG
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/png"
              onChange={handleFileChange}
              className="logo-upload-input"
              disabled={uploading}
            />
            <p className="logo-upload-hint">
              Formato: PNG | Tamaño máximo: 2MB
            </p>
          </div>

          {preview && (
            <div className="logo-actions">
              <button 
                className="logo-action-btn btn-save"
                onClick={handleSave}
                disabled={uploading}
              >
                <Check className="w-4 h-4" />
                Guardar Logo
              </button>
              
              <button 
                className="logo-action-btn btn-reset"
                onClick={handleReset}
                disabled={uploading || preview === currentLogo}
              >
                <Eye className="w-4 h-4" />
                Resetear
              </button>
              
              <button 
                className="logo-action-btn btn-remove"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
                Eliminar Logo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="logo-info-box">
        <h4 className="logo-info-title">ℹ️ Información</h4>
        <ul className="logo-info-list">
          <li>El logo aparecerá en la barra superior izquierda</li>
          <li>También se mostrará en la vista previa de tickets</li>
          <li>Se recomienda un tamaño de 200x200 píxeles</li>
          <li>Fondo transparente para mejor visualización</li>
        </ul>
      </div>
    </div>
  );
}