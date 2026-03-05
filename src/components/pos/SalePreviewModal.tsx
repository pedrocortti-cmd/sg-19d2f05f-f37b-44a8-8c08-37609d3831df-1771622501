import { X, Printer } from "lucide-react";
import type { Sale } from "@/types/pos";
import { formatCurrency } from "@/lib/utils";

interface SalePreviewModalProps {
  sale: Sale;
  businessLogo: string | null;
  onClose: () => void;
  onPrint: () => void;
}

export function SalePreviewModal({
  sale,
  businessLogo,
  onClose,
  onPrint,
}: SalePreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">👁️ Vista Previa</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="bg-white p-6 rounded-lg shadow-sm max-w-sm mx-auto font-mono text-sm">
            {/* Logo */}
            {businessLogo && (
              <div className="text-center mb-4">
                <img
                  src={businessLogo}
                  alt="Logo"
                  className="max-w-full max-h-16 mx-auto"
                />
              </div>
            )}

            {/* Business Info */}
            <div className="text-center mb-4 border-b pb-4">
              <div className="font-bold text-lg">De la Gran Burger</div>
              <div className="text-xs">Av. Principal 123, Asunción</div>
              <div className="text-xs">Tel: 021-1234567</div>
              <div className="text-xs">RUC: 80012345-6</div>
            </div>

            {/* Sale Info */}
            <div className="mb-4 text-xs">
              <div className="flex justify-between">
                <span>Pedido:</span>
                <span className="font-bold">{sale.saleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha:</span>
                <span>{new Date(sale.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tipo:</span>
                <span className="font-bold">
                  {sale.orderType === "delivery"
                    ? "DELIVERY"
                    : sale.orderType === "pickup"
                    ? "PARA RETIRAR"
                    : "EN LOCAL"}
                </span>
              </div>
            </div>

            {/* Customer */}
            {sale.customer && (
              <div className="mb-4 pb-4 border-b text-xs">
                <div className="font-bold mb-1">Cliente:</div>
                <div>{sale.customer.name}</div>
                {sale.customer.phone && <div>Tel: {sale.customer.phone}</div>}
                {sale.customer.address && (
                  <div>Dir: {sale.customer.address}</div>
                )}
              </div>
            )}

            {/* Items */}
            <div className="mb-4 pb-4 border-b">
              <div className="font-bold mb-2">Productos:</div>
              {sale.items.map((item, index) => (
                <div key={index} className="flex justify-between text-xs mb-1">
                  <div>
                    <span className="font-bold">{item.quantity}x</span>{" "}
                    {item.product.name}
                  </div>
                  <div>{formatCurrency(item.product.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              {sale.discount && sale.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Descuento:</span>
                  <span>-{formatCurrency(sale.discount)}</span>
                </div>
              )}
              {sale.deliveryCost && sale.deliveryCost > 0 && (
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>{formatCurrency(sale.deliveryCost)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>TOTAL:</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 pt-4 border-t text-xs">
              <div className="font-bold">¡Gracias por su compra!</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Cerrar
          </button>
          <button
            onClick={onPrint}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}