import { useState } from "react";
import { X, DollarSign, CreditCard, Smartphone, Banknote } from "lucide-react";

interface Payment {
  method: "cash" | "card" | "transfer" | "qr" | "other";
  amount: number;
}

interface PaymentModalProps {
  total: number;
  initialNote?: string;
  onConfirm: (payments: Payment[], note: string) => void;
  onCancel: () => void;
}

export function PaymentModal({ total, initialNote = "", onConfirm, onCancel }: PaymentModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentMethod, setCurrentMethod] = useState<Payment["method"]>("cash");
  const [currentAmount, setCurrentAmount] = useState<string>("");
  const [note, setNote] = useState(initialNote);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - totalPaid;

  const addPayment = () => {
    const amount = parseFloat(currentAmount);
    if (!amount || amount <= 0) return;

    setPayments([...payments, { method: currentMethod, amount }]);
    setCurrentAmount("");
  };

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (remaining > 0) {
      if (!confirm(`Faltan Gs. ${remaining.toLocaleString("es-PY")} por pagar. ¿Continuar de todas formas?`)) {
        return;
      }
    }
    onConfirm(payments, note);
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("es-PY");
  };

  const getMethodIcon = (method: Payment["method"]) => {
    switch (method) {
      case "cash": return <Banknote size={18} />;
      case "card": return <CreditCard size={18} />;
      case "qr": return <Smartphone size={18} />;
      case "transfer": return <DollarSign size={18} />;
      default: return <DollarSign size={18} />;
    }
  };

  const getMethodLabel = (method: Payment["method"]) => {
    switch (method) {
      case "cash": return "Efectivo";
      case "card": return "Tarjeta";
      case "qr": return "QR";
      case "transfer": return "Transferencia";
      default: return "Otro";
    }
  };

  return (
    <div className="payment-modal-overlay" onClick={onCancel}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>Procesar Pago</h2>
          <button className="payment-modal-close" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <div className="payment-modal-body">
          <div className="payment-summary">
            <div className="payment-summary-row">
              <span>Total:</span>
              <span className="payment-summary-amount">Gs. {formatCurrency(total)}</span>
            </div>
            <div className="payment-summary-row">
              <span>Pagado:</span>
              <span className="payment-summary-paid">Gs. {formatCurrency(totalPaid)}</span>
            </div>
            <div className="payment-summary-row payment-summary-remaining">
              <span>Restante:</span>
              <span className={remaining > 0 ? "payment-summary-pending" : "payment-summary-complete"}>
                Gs. {formatCurrency(remaining)}
              </span>
            </div>
          </div>

          <div className="payment-form">
            <div className="payment-methods">
              <button
                className={`payment-method-btn ${currentMethod === "cash" ? "active" : ""}`}
                onClick={() => setCurrentMethod("cash")}
              >
                <Banknote size={20} />
                Efectivo
              </button>
              <button
                className={`payment-method-btn ${currentMethod === "card" ? "active" : ""}`}
                onClick={() => setCurrentMethod("card")}
              >
                <CreditCard size={20} />
                Tarjeta
              </button>
              <button
                className={`payment-method-btn ${currentMethod === "qr" ? "active" : ""}`}
                onClick={() => setCurrentMethod("qr")}
              >
                <Smartphone size={20} />
                QR
              </button>
              <button
                className={`payment-method-btn ${currentMethod === "transfer" ? "active" : ""}`}
                onClick={() => setCurrentMethod("transfer")}
              >
                <DollarSign size={20} />
                Transferencia
              </button>
            </div>

            <div className="payment-input-group">
              <input
                type="number"
                className="payment-input"
                placeholder="Monto"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addPayment()}
              />
              <button className="payment-add-btn" onClick={addPayment}>
                Agregar
              </button>
            </div>

            <div className="payment-quick-amounts">
              <button onClick={() => setCurrentAmount(remaining.toString())}>
                Gs. {formatCurrency(remaining)}
              </button>
              <button onClick={() => setCurrentAmount("10000")}>Gs. 10.000</button>
              <button onClick={() => setCurrentAmount("20000")}>Gs. 20.000</button>
              <button onClick={() => setCurrentAmount("50000")}>Gs. 50.000</button>
              <button onClick={() => setCurrentAmount("100000")}>Gs. 100.000</button>
            </div>
          </div>

          {payments.length > 0 && (
            <div className="payment-list">
              <h3>Pagos Registrados:</h3>
              {payments.map((payment, index) => (
                <div key={index} className="payment-item">
                  <div className="payment-item-info">
                    {getMethodIcon(payment.method)}
                    <span>{getMethodLabel(payment.method)}</span>
                  </div>
                  <div className="payment-item-amount">Gs. {formatCurrency(payment.amount)}</div>
                  <button className="payment-item-remove" onClick={() => removePayment(index)}>
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="payment-note">
            <label>Nota del pago (opcional):</label>
            <textarea
              className="payment-note-input"
              placeholder="Agregar nota..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="payment-modal-footer">
          <button className="payment-btn payment-btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className="payment-btn payment-btn-confirm"
            onClick={handleConfirm}
            disabled={payments.length === 0}
          >
            {remaining > 0 ? "Confirmar Pago Parcial" : "Confirmar Pago"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .payment-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .payment-modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .payment-modal-header {
          padding: 1.5rem;
          border-bottom: 2px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .payment-modal-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .payment-modal-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .payment-modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .payment-modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .payment-summary {
          background: #f8fafc;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .payment-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          font-size: 1rem;
        }

        .payment-summary-remaining {
          border-top: 2px solid #e2e8f0;
          margin-top: 0.5rem;
          padding-top: 1rem;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .payment-summary-amount {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1e293b;
        }

        .payment-summary-paid {
          color: #10b981;
          font-weight: 600;
        }

        .payment-summary-pending {
          color: #f59e0b;
          font-weight: 700;
        }

        .payment-summary-complete {
          color: #10b981;
          font-weight: 700;
        }

        .payment-methods {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .payment-method-btn {
          padding: 1rem;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .payment-method-btn:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .payment-method-btn.active {
          border-color: #3b82f6;
          background: #3b82f6;
          color: white;
        }

        .payment-input-group {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .payment-input {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
        }

        .payment-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .payment-add-btn {
          padding: 0.75rem 1.5rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .payment-add-btn:hover {
          background: #059669;
        }

        .payment-quick-amounts {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }

        .payment-quick-amounts button {
          padding: 0.5rem 1rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .payment-quick-amounts button:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
        }

        .payment-list {
          margin-bottom: 1.5rem;
        }

        .payment-list h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: #475569;
        }

        .payment-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }

        .payment-item-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .payment-item-amount {
          font-weight: 700;
          color: #10b981;
        }

        .payment-item-remove {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 6px;
          padding: 0.25rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .payment-item-remove:hover {
          background: #fecaca;
        }

        .payment-note {
          margin-bottom: 1rem;
        }

        .payment-note label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #475569;
        }

        .payment-note-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.9rem;
          resize: vertical;
        }

        .payment-note-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .payment-modal-footer {
          padding: 1.5rem;
          border-top: 2px solid #e2e8f0;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .payment-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .payment-btn-cancel {
          background: #f1f5f9;
          color: #475569;
        }

        .payment-btn-cancel:hover {
          background: #e2e8f0;
        }

        .payment-btn-confirm {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .payment-btn-confirm:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .payment-btn-confirm:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
}