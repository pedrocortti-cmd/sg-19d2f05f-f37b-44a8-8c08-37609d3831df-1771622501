import { useState } from "react";
import { X, CreditCard, Smartphone, DollarSign, Plus, Trash2 } from "lucide-react";
import type { Payment } from "@/types/pos";
import { formatCurrency } from "@/lib/utils";

interface PaymentModalProps {
  total: number;
  onClose: () => void;
  onConfirm: (payments: Payment[], note: string) => void;
}

export function PaymentModal({ total, onClose, onConfirm }: PaymentModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentMethod, setCurrentMethod] = useState<"cash" | "card" | "transfer" | "qr">("cash");
  const [currentAmount, setCurrentAmount] = useState<string>("");
  const [note, setNote] = useState("");

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - totalPaid;
  const change = totalPaid > total ? totalPaid - total : 0;

  const handleAddPayment = () => {
    const amount = parseFloat(currentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("❌ Ingresa un monto válido");
      return;
    }

    setPayments([...payments, { 
      id: Date.now(), 
      method: currentMethod, 
      amount,
      timestamp: new Date()
    }]);
    setCurrentAmount("");
  };

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (totalPaid < total) {
      alert(`❌ Falta pagar: ${formatCurrency(remaining)}`);
      return;
    }

    onConfirm(payments, note);
  };

  const methodLabels = {
    cash: "Efectivo",
    card: "Tarjeta",
    transfer: "Transferencia",
    qr: "QR/Billetera",
  };

  const methodIcons = {
    cash: DollarSign,
    card: CreditCard,
    transfer: Smartphone,
    qr: Smartphone,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">💰 Recibir Pago</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Total a Pagar */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium mb-1">
              TOTAL A PAGAR
            </div>
            <div className="text-3xl font-bold text-blue-900">
              {formatCurrency(total)}
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["cash", "card", "transfer", "qr"] as const).map((method) => {
                const Icon = methodIcons[method];
                return (
                  <button
                    key={method}
                    onClick={() => setCurrentMethod(method)}
                    className={`p-3 border-2 rounded-lg transition ${
                      currentMethod === method
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">
                      {methodLabels[method]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium mb-2">Monto</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddPayment()}
                placeholder="0"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-lg"
                autoFocus
              />
              <button
                onClick={handleAddPayment}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Agregar
              </button>
            </div>

            {/* Quick Amounts */}
            <div className="grid grid-cols-5 gap-2 mt-2">
              {[10000, 20000, 50000, 100000, remaining].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setCurrentAmount(amount.toString())}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition"
                >
                  {amount === remaining ? "Exacto" : formatCurrency(amount)}
                </button>
              ))}
            </div>
          </div>

          {/* Pagos Agregados */}
          {payments.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Pagos Registrados
              </label>
              <div className="space-y-2">
                {payments.map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">
                        {methodLabels[payment.method]}
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(payment.amount)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePayment(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumen */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total a Pagar:</span>
              <span className="font-bold">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Pagado:</span>
              <span className="font-bold text-green-600">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            {remaining > 0 && (
              <div className="flex justify-between text-sm">
                <span>Falta:</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(remaining)}
                </span>
              </div>
            )}
            {change > 0 && (
              <div className="flex justify-between text-lg border-t pt-2">
                <span className="font-bold">Vuelto:</span>
                <span className="font-bold text-blue-600">
                  {formatCurrency(change)}
                </span>
              </div>
            )}
          </div>

          {/* Nota */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nota (opcional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Cliente pagó con billete de 100.000"
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={totalPaid < total}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
              totalPaid >= total
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {totalPaid >= total
              ? "Confirmar Pago"
              : `Falta ${formatCurrency(remaining)}`}
          </button>
        </div>
      </div>
    </div>
  );
}