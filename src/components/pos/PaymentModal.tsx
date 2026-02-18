import { useState, useEffect } from "react";
import { X, CreditCard, Banknote, QrCode, ArrowRight, Trash2, Smartphone } from "lucide-react";
import type { Payment, PaymentMethod } from "@/types/pos";

interface PaymentModalProps {
  total: number;
  onConfirm: (payments: Payment[], note: string) => void;
  onCancel: () => void;
  initialNote?: string;
}

const formatCurrency = (amount: number) => amount.toLocaleString("es-PY");

export function PaymentModal({ total, onConfirm, onCancel, initialNote = "" }: PaymentModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentAmount, setCurrentAmount] = useState<string>(total.toString());
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState(initialNote);

  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - paidAmount;

  useEffect(() => {
    // Al abrir, sugerir el monto restante
    setCurrentAmount(remaining > 0 ? remaining.toString() : "");
  }, [payments, total]);

  const handleAddPayment = () => {
    const amount = Number(currentAmount);
    if (!amount || amount <= 0) return;

    const newPayment: Payment = {
      id: Date.now(),
      method: selectedMethod,
      amount: amount,
      reference: reference,
      timestamp: new Date()
    };

    setPayments([...payments, newPayment]);
    setReference("");
    
    // Calcular nuevo restante para el próximo input
    const newRemaining = total - (paidAmount + amount);
    setCurrentAmount(newRemaining > 0 ? newRemaining.toString() : "");
  };

  const removePayment = (id: number) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const handleConfirm = () => {
    if (paidAmount < total) {
      if (!confirm(`El monto pagado (${formatCurrency(paidAmount)}) es menor al total (${formatCurrency(total)}). ¿Desea confirmar como pago parcial/pendiente?`)) {
        return;
      }
    }
    onConfirm(payments, note);
  };

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case "cash": return "Efectivo";
      case "qr": return "QR";
      case "card": return "Tarjeta";
      case "transfer": return "Transferencia";
      case "other": return "Otro";
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "cash": return <Banknote size={24} />;
      case "qr": return <QrCode size={24} />;
      case "card": return <CreditCard size={24} />;
      case "transfer": return <ArrowRight size={24} />;
      case "other": return <Smartphone size={24} />;
    }
  };

  return (
    <div className="pos-modal-overlay">
      <div className="pos-modal">
        <div className="pos-modal-header">
          <div className="pos-modal-title">Finalizar Venta</div>
          <button className="pos-modal-close" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <div className="pos-modal-body">
          <div className="pos-payment-summary">
            <div className="pos-payment-summary-row">
              <span className="pos-payment-summary-label">Total a Pagar</span>
              <span className="pos-payment-summary-value highlight">Gs. {formatCurrency(total)}</span>
            </div>
            <div className="pos-payment-summary-row">
              <span className="pos-payment-summary-label">Pagado</span>
              <span className="pos-payment-summary-value" style={{ color: "#10b981" }}>Gs. {formatCurrency(paidAmount)}</span>
            </div>
            <div className="pos-payment-summary-row">
              <span className="pos-payment-summary-label">Restante</span>
              <span className={`pos-payment-summary-value ${remaining > 0 ? "warning" : ""}`}>
                Gs. {formatCurrency(Math.max(0, remaining))}
              </span>
            </div>
             {remaining < 0 && (
              <div className="pos-payment-summary-row">
                <span className="pos-payment-summary-label">Vuelto</span>
                <span className="pos-payment-summary-value" style={{ color: "#ef4444" }}>
                  Gs. {formatCurrency(Math.abs(remaining))}
                </span>
              </div>
            )}
          </div>

          <div className="pos-payments-list-title">Métodos de Pago</div>
          <div className="pos-payment-methods">
            {(["cash", "qr", "card", "transfer", "other"] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                className={`pos-payment-method-btn ${selectedMethod === m ? "selected" : ""}`}
                onClick={() => setSelectedMethod(m)}
              >
                {getMethodIcon(m)}
                <span>{getMethodLabel(m)}</span>
              </button>
            ))}
          </div>

          <div className="pos-payment-amount-input">
            <label>Monto</label>
            <input
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddPayment()}
              placeholder="0"
              autoFocus
            />
          </div>

          {selectedMethod !== "cash" && (
            <div className="pos-payment-reference">
              <label>Referencia / Nro. Comprobante (Opcional)</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej: 123456"
              />
            </div>
          )}

          <button 
            className="pos-btn-secondary" 
            style={{ width: "100%", marginBottom: "1.5rem", background: "#f1f5f9" }}
            onClick={handleAddPayment}
            disabled={!Number(currentAmount) || Number(currentAmount) <= 0}
          >
            Agregar Pago
          </button>

          {payments.length > 0 && (
            <div className="pos-payments-list">
              <div className="pos-payments-list-title">Pagos Registrados</div>
              {payments.map((p) => (
                <div key={p.id} className="pos-payment-item">
                  <div className="pos-payment-item-info">
                    <div className="pos-payment-item-method">
                      {getMethodLabel(p.method)}
                      {p.reference && <span style={{fontWeight: "normal", fontSize: "0.85em", marginLeft: "8px"}}>Ref: {p.reference}</span>}
                    </div>
                    <div className="pos-payment-item-timestamp">
                      {p.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="pos-payment-item-amount">Gs. {formatCurrency(p.amount)}</div>
                  <button className="pos-payment-item-remove" onClick={() => removePayment(p.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="pos-note-section">
             <div className="pos-input-group">
                <label className="pos-input-label">Nota Final del Pedido</label>
                <textarea
                  className="pos-input"
                  placeholder="Nota general..."
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
          </div>
        </div>

        <div className="pos-modal-footer">
          <button className="pos-btn-secondary" onClick={onCancel}>Cancelar</button>
          <button 
            className="pos-btn-primary" 
            onClick={handleConfirm}
            disabled={payments.length === 0}
          >
            Confirmar e Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}