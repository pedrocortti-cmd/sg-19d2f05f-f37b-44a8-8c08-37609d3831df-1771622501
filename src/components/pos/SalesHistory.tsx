import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Calendar, Search } from "lucide-react";
import type { Sale, SaleItem } from "@/types/pos";

interface SalesHistoryProps {
  sales: Sale[];
  onCancelSale?: (saleId: number, reason: string) => void;
  onReopenSale?: (sale: Sale) => void;
}

export function SalesHistory({ sales, onCancelSale, onReopenSale }: SalesHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Debug: Log sales to console
  useEffect(() => {
    console.log("SalesHistory received sales:", sales);
  }, [sales]);

  // Format date/time
  const formatDateTime = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `Gs. ${amount.toLocaleString("es-PY")}`;
  };

  // Get sale type label
  const getSaleTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      delivery: "Delivery",
      pickup: "Para Retirar",
      dineIn: "En Local",
    };
    return labels[type] || type;
  };

  // Get payment method label
  const getPaymentMethodLabel = (method: string): string => {
    const labels: { [key: string]: string } = {
      cash: "Efectivo",
      qr: "QR",
      card: "Tarjeta",
      transfer: "Transferencia",
      pending: "Pendiente",
      other: "Otro",
    };
    return labels[method] || method;
  };

  // Filter sales
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customer?.name || "").toLowerCase().includes(searchTerm.toLowerCase());

    const saleDate = new Date(sale.date);
    const matchesStartDate = !startDate || saleDate >= new Date(startDate);
    const matchesEndDate = !endDate || saleDate <= new Date(endDate);

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  // Calculate totals
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

  // Handle view sale detail
  const handleViewDetail = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="sales-history">
      <div className="sales-history-header">
        <h2>Historial de Ventas</h2>
        <div className="sales-summary">
          <span className="summary-label">Total ventas:</span>
          <span className="summary-value">{formatCurrency(totalSales)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="sales-filters">
        <div className="search-box">
          <Search className="search-icon" />
          <Input
            type="text"
            placeholder="Buscar por número o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="date-filters">
          <div className="date-input-group">
            <Calendar className="date-icon" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Fecha desde"
            />
          </div>
          <span className="date-separator">-</span>
          <div className="date-input-group">
            <Calendar className="date-icon" />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Fecha hasta"
            />
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="sales-table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nro. Venta</TableHead>
              <TableHead>Fecha/Hora</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {sales.length === 0 
                    ? "No hay ventas registradas aún" 
                    : "No se encontraron ventas con los filtros aplicados"}
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">
                    {sale.saleNumber}
                  </TableCell>
                  <TableCell>{formatDateTime(sale.date)}</TableCell>
                  <TableCell>{sale.customer?.name || "Cliente General"}</TableCell>
                  <TableCell>{getSaleTypeLabel(sale.type)}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(sale.total)}
                  </TableCell>
                  <TableCell>{getPaymentMethodLabel(sale.paymentMethod)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(sale)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sale Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Venta</DialogTitle>
          </DialogHeader>

          {selectedSale && (
            <div className="sale-detail">
              <div className="detail-header">
                <div className="detail-row">
                  <span className="detail-label">Nro. Venta:</span>
                  <span className="detail-value">{selectedSale.saleNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Fecha/Hora:</span>
                  <span className="detail-value">
                    {formatDateTime(selectedSale.date)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tipo:</span>
                  <span className="detail-value">
                    {getSaleTypeLabel(selectedSale.type)}
                  </span>
                </div>
              </div>

              {selectedSale.customer?.name && (
                <div className="customer-info">
                  <h4>Información del Cliente</h4>
                  <div className="detail-row">
                    <span className="detail-label">Cliente:</span>
                    <span className="detail-value">
                      {selectedSale.customer.name}
                    </span>
                  </div>
                  {selectedSale.customer.phone && (
                    <div className="detail-row">
                      <span className="detail-label">Teléfono:</span>
                      <span className="detail-value">
                        {selectedSale.customer.phone}
                      </span>
                    </div>
                  )}
                  {selectedSale.customer.address && (
                    <div className="detail-row">
                      <span className="detail-label">Dirección:</span>
                      <span className="detail-value">
                        {selectedSale.customer.address}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="items-section">
                <h4>Productos</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Cant.</TableHead>
                      <TableHead className="text-right">Precio Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.quantity * item.price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="totals-section">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedSale.subtotal)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="total-row discount">
                    <span>Descuento:</span>
                    <span>-{formatCurrency(selectedSale.discount)}</span>
                  </div>
                )}
                <div className="total-row final">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedSale.total)}</span>
                </div>
                <div className="total-row">
                  <span>Medio de Pago:</span>
                  <span>{getPaymentMethodLabel(selectedSale.paymentMethod)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .sales-history-container {
          width: 100%;
          height: 100%;
          padding: 2rem;
          background: #f8fafc;
          overflow-y: auto;
        }

        .sales-history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .sales-history-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .sales-stats {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #10b981;
        }

        .sales-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 250px;
          position: relative;
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .date-filters {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .date-filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .date-filter-group label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .date-filter-group input {
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .sales-table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .sales-table {
          width: 100%;
          border-collapse: collapse;
        }

        .sales-table thead {
          background: #f1f5f9;
        }

        .sales-table th {
          padding: 1rem;
          text-align: left;
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
        }

        .sales-table td {
          padding: 1rem;
          font-size: 0.875rem;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
        }

        .sales-table tbody tr:hover {
          background: #f8fafc;
        }

        .sale-number {
          font-weight: 600;
          color: #3b82f6;
        }

        .sale-type-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .sale-type-delivery {
          background: #dbeafe;
          color: #1e40af;
        }

        .sale-type-pickup {
          background: #fef3c7;
          color: #92400e;
        }

        .sale-type-local {
          background: #dcfce7;
          color: #166534;
        }

        .sale-status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-completed {
          background: #dcfce7;
          color: #166534;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .sale-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover {
          transform: scale(1.05);
        }

        .btn-view {
          background: #dbeafe;
          color: #1e40af;
        }

        .btn-cancel {
          background: #fee2e2;
          color: #991b1b;
        }

        .btn-reopen {
          background: #fef3c7;
          color: #92400e;
        }

        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          color: #94a3b8;
        }

        .empty-state p {
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        /* Modal styles */
        .sale-detail-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .sale-detail-modal {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .close-btn {
          padding: 0.5rem;
          border: none;
          background: #f1f5f9;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .close-btn:hover {
          background: #e2e8f0;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .detail-section {
          margin-bottom: 1.5rem;
        }

        .detail-section h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .detail-value {
          font-size: 0.875rem;
          color: #334155;
          font-weight: 600;
        }

        .items-list {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .item-row:last-child {
          border-bottom: none;
        }

        .item-info {
          display: flex;
          gap: 0.5rem;
        }

        .item-qty {
          font-weight: 600;
          color: #3b82f6;
        }

        .item-name {
          color: #334155;
        }

        .item-price {
          font-weight: 600;
          color: #334155;
        }

        .payment-summary {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
        }

        .summary-total {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          padding-top: 8px;
          border-top: 2px solid #e2e8f0;
        }
      `}</style>
    </div>
  );
}