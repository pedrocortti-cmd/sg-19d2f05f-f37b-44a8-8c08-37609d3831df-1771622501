import { useState, useRef } from "react";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";

interface LogoSettingsProps {
  currentLogo: string | null;
  onLogoChange: (logoUrl: string | null) => void;
}

export function LogoSettings({ currentLogo, onLogoChange }: LogoSettingsProps) {
  const [preview, setPreview] = useState<string | null>(currentLogo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("❌ Solo se permiten archivos de imagen");
      return;
    }

    // Validar tamaño (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("❌ El archivo es muy grande. Máximo 2MB");
      return;
    }

    // Leer y previsualizar
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onLogoChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    if (confirm("¿Estás seguro de eliminar el logo?")) {
      setPreview(null);
      onLogoChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <ImageIcon className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold">Logo del Negocio</h3>
      </div>

      <div className="space-y-4">
        {/* Preview */}
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Logo"
              className="max-w-full max-h-48 mx-auto rounded-lg border-2 border-gray-200"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No hay logo configurado</p>
            <p className="text-sm text-gray-400">
              Sube una imagen para mostrar en los tickets
            </p>
          </div>
        )}

        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full justify-center"
          >
            <Upload className="w-5 h-5" />
            {preview ? "Cambiar Logo" : "Subir Logo"}
          </button>
        </div>

        <p className="text-sm text-gray-500">
          💡 <strong>Recomendaciones:</strong> Formato PNG o JPG. Máximo 2MB.
          Dimensiones recomendadas: 300x100px.
        </p>
      </div>
    </div>
  );
}