import { useState, useEffect } from "react";
import { 
  X, 
  Banknote, 
  CreditCard, 
  Smartphone, 
  DollarSign 
} from "lucide-react";
import { Payment } from "@/types/pos";

interface PaymentModalProps {
  total: number;
  onClose: () => void;
  onConfirm: (payments: Payment[], note: string) => void;
}

type PaymentMethod = "cash" | "card" | "qr" | "transfer";

export function PaymentModal({ total, onClose, onConfirm }: PaymentModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentAmount, setCurrentAmount] = useState("");
  const [currentMethod, setCurrentMethod] = useState<PaymentMethod>("cash");
  const [note, setNote] = useState("");

  // Calcular totales
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, total - totalPaid);
  const change = Math.max(0, totalPaid - total);

  // Inicializar monto con el total restante al abrir o cuando cambia el restante
  useEffect(() => {
    if (remaining > 0 && !currentAmount) {
      setCurrentAmount(remaining.toString());
    }
  }, [remaining, currentAmount]);

  const addPayment = () => {
    const amountVal = parseFloat(currentAmount);
    if (!amountVal || amountVal <= 0) return;

    const newPayment: Payment = {
      id: Date.now(),
      timestamp: new Date(),
      method: currentMethod,
      amount: amountVal
    };

    setPayments([...payments, newPayment]);
    setCurrentAmount(""); // Limpiar input para siguiente pago
  };

  const removePayment = (id: number) => {
    setPayments(payments.filter(p => p.id !== id));
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

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "cash": return <Banknote size={18} />;
      case "card": return <CreditCard size={18} />;
      case "qr": return <Smartphone size={18} />;
      case "transfer": return <DollarSign size={18} />;
      default: return <DollarSign size={18} />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "cash": return "Efectivo";
      case "card": return "Tarjeta";
      case "qr": return "QR";
      case "transfer": return "Transferencia";
      default: return "Otro";
    }
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>Procesar Pago</h2>
          <button className="payment-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="payment-modal-body">
          <div className="payment-summary">
            <div className="payment-summary-row">
              <span>Total a Pagar:</span>
              <span className="payment-summary-amount">Gs. {formatCurrency(total)}</span>
            </div>
            <div className="payment-summary-row">
              <span>Pagado:</span>
              <span className="payment-summary-paid">Gs. {formatCurrency(totalPaid)}</span>
            </div>
            <div className="payment-summary-row payment-summary-remaining">
              <span>{remaining > 0 ? "Faltante:" : "Vuelto:"}</span>
              <span className={remaining > 0 ? "payment-summary-pending" : "payment-summary-complete"}>
                Gs. {formatCurrency(remaining > 0 ? remaining : change)}
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
                Transf.
              </button>
            </div>

            <div className="payment-input-group">
              <div className="amount-input-wrapper">
                <span className="currency-symbol">Gs.</span>
                <input
                  type="number"
                  className="payment-input"
                  placeholder="Monto"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPayment()}
                  autoFocus
                />
              </div>
              <button className="payment-add-btn" onClick={addPayment}>
                Agregar Pago
              </button>
            </div>

            <div className="payment-quick-amounts">
              {remaining > 0 && (
                <button onClick={() => setCurrentAmount(remaining.toString())} className="exact-amount">
                  Exacto: {formatCurrency(remaining)}
                </button>
              )}
              <button onClick={() => setCurrentAmount("5000")}>5.000</button>
              <button onClick={() => setCurrentAmount("10000")}>10.000</button>
              <button onClick={() => setCurrentAmount("20000")}>20.000</button>
              <button onClick={() => setCurrentAmount("50000")}>50.000</button>
              <button onClick={() => setCurrentAmount("100000")}>100.000</button>
            </div>
          </div>

          {payments.length > 0 && (
            <div className="payment-list">
              <h3>Pagos Registrados ({payments.length})</h3>
              <div className="payment-list-scroll">
                {payments.map((payment) => (
                  <div key={payment.id} className="payment-item">
                    <div className="payment-item-info">
                      {getMethodIcon(payment.method)}
                      <span>{getMethodLabel(payment.method)}</span>
                    </div>
                    <div className="payment-item-right">
                      <span className="payment-item-amount">Gs. {formatCurrency(payment.amount)}</span>
                      <button className="payment-item-remove" onClick={() => removePayment(payment.id)}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="payment-note">
            <label>Nota del pedido (opcional):</label>
            <textarea
              className="payment-note-input"
              placeholder="Ej: Sin cebolla, Entregar en portería..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="payment-modal-footer">
          <button className="payment-btn payment-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="payment-btn payment-btn-confirm"
            onClick={handleConfirm}
            disabled={payments.length === 0 && total > 0}
          >
            {remaining > 0 ? "Confirmar Pago Parcial" : "Finalizar Venta"}
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
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .payment-modal {
          background: white;
          border-radius: 16px;
          width: 95%;
          max-width: 550px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .payment-modal-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
        }

        .payment-modal-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .payment-modal-close {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .payment-modal-close:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .payment-modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .payment-summary {
          background: #f1f5f9;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .payment-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.25rem 0;
          font-size: 0.95rem;
          color: #475569;
        }

        .payment-summary-amount, .payment-summary-paid {
          font-weight: 600;
          color: #1e293b;
        }

        .payment-summary-remaining {
          border-top: 1px solid #cbd5e1;
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .payment-summary-pending {
          color: #ef4444;
        }

        .payment-summary-complete {
          color: #10b981;
        }

        .payment-methods {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .payment-method-btn {
          padding: 0.75rem 0.25rem;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          transition: all 0.2s;
        }

        .payment-method-btn:hover {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #3b82f6;
        }

        .payment-method-btn.active {
          border-color: #3b82f6;
          background: #3b82f6;
          color: white;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
        }

        .payment-input-group {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .amount-input-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-symbol {
          position: absolute;
          left: 1rem;
          color: #64748b;
          font-weight: 600;
          pointer-events: none;
        }

        .payment-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          transition: border-color 0.2s;
        }

        .payment-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .payment-add-btn {
          padding: 0 1.25rem;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .payment-add-btn:hover {
          background: #334155;
        }

        .payment-quick-amounts {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }

        .payment-quick-amounts button {
          padding: 0.35rem 0.75rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }

        .payment-quick-amounts button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .payment-quick-amounts .exact-amount {
          background: #ecfdf5;
          border-color: #10b981;
          color: #059669;
          font-weight: 600;
        }

        .payment-list {
          margin-bottom: 1.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .payment-list h3 {
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .payment-list-scroll {
          max-height: 150px;
          overflow-y: auto;
        }

        .payment-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .payment-item:last-child {
          border-bottom: none;
        }

        .payment-item-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          color: #1e293b;
        }

        .payment-item-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .payment-item-amount {
          font-weight: 600;
          color: #10b981;
        }

        .payment-item-remove {
          background: transparent;
          color: #94a3b8;
          border: none;
          padding: 0.25rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .payment-item-remove:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .payment-note label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.5rem;
        }

        .payment-note-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.9rem;
          resize: none;
          transition: border-color 0.2s;
        }

        .payment-note-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .payment-modal-footer {
          padding: 1.25rem 1.5rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          background: #f8fafc;
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
          background: white;
          border: 1px solid #cbd5e1;
          color: #475569;
        }

        .payment-btn-cancel:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .payment-btn-confirm {
          background: #10b981;
          color: white;
          box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
        }

        .payment-btn-confirm:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .payment-btn-confirm:disabled {
          background: #cbd5e1;
          color: #94a3b8;
          box-shadow: none;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
}