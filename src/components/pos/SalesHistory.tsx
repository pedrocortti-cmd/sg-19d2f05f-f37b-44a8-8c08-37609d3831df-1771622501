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

export function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Load mock sales data
  useEffect(() => {
    const mockSales: Sale[] = [
      {
        id: 1,
        saleNumber: "V-00001",
        date: "2026-02-18T14:30:00",
        customerName: "Juan Pérez",
        customerPhone: "0981234567",
        type: "delivery",
        items: [
          { productId: 1, productName: "Carnívora", quantity: 2, price: 22000 },
          { productId: 12, productName: "Coca Cola", quantity: 2, price: 5000 },
        ],
        subtotal: 54000,
        discount: 0,
        total: 54000,
        paymentMethod: "cash",
        status: "completed",
      },
      {
        id: 2,
        saleNumber: "V-00002",
        date: "2026-02-18T15:15:00",
        customerName: "María González",
        type: "pickup",
        items: [
          { productId: 6, productName: "Clasica", quantity: 1, price: 15000 },
          { productId: 10, productName: "Papas Fritas", quantity: 1, price: 8000 },
        ],
        subtotal: 23000,
        discount: 0,
        total: 23000,
        paymentMethod: "qr",
        status: "completed",
      },
      {
        id: 3,
        saleNumber: "V-00003",
        date: "2026-02-18T16:00:00",
        customerName: "Carlos Ramírez",
        customerPhone: "0991234567",
        type: "delivery",
        items: [
          { productId: 9, productName: "Triple", quantity: 1, price: 25000 },
          { productId: 11, productName: "Aros de Cebolla", quantity: 1, price: 9000 },
          { productId: 13, productName: "Sprite", quantity: 1, price: 5000 },
        ],
        subtotal: 39000,
        discount: 2000,
        total: 37000,
        paymentMethod: "card",
        status: "completed",
      },
    ];

    setSales(mockSales);
  }, []);

  // Format date/time
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
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
    };
    return labels[method] || method;
  };

  // Filter sales
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      "";

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
                  No se encontraron ventas
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">
                    {sale.saleNumber}
                  </TableCell>
                  <TableCell>{formatDateTime(sale.date)}</TableCell>
                  <TableCell>{sale.customerName || "-"}</TableCell>
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

              {selectedSale.customerName && (
                <div className="customer-info">
                  <h4>Información del Cliente</h4>
                  <div className="detail-row">
                    <span className="detail-label">Cliente:</span>
                    <span className="detail-value">
                      {selectedSale.customerName}
                    </span>
                  </div>
                  {selectedSale.customerPhone && (
                    <div className="detail-row">
                      <span className="detail-label">Teléfono:</span>
                      <span className="detail-value">
                        {selectedSale.customerPhone}
                      </span>
                    </div>
                  )}
                  {selectedSale.customerAddress && (
                    <div className="detail-row">
                      <span className="detail-label">Dirección:</span>
                      <span className="detail-value">
                        {selectedSale.customerAddress}
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
        .sales-history {
          padding: 24px;
        }

        .sales-history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .sales-history-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #1e293b;
        }

        .sales-summary {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .summary-label {
          font-size: 14px;
          color: #64748b;
        }

        .summary-value {
          font-size: 20px;
          font-weight: 700;
          color: #16a34a;
        }

        .sales-filters {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #64748b;
          pointer-events: none;
        }

        .search-box input {
          padding-left: 40px;
        }

        .date-filters {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .date-input-group {
          position: relative;
        }

        .date-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: #64748b;
          pointer-events: none;
          z-index: 1;
        }

        .date-input-group input {
          padding-left: 38px;
          width: 160px;
        }

        .date-separator {
          color: #94a3b8;
          font-weight: 500;
        }

        .sales-table-container {
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .sale-detail {
          padding: 16px;
        }

        .detail-header,
        .customer-info {
          margin-bottom: 24px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .customer-info h4,
        .items-section h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          color: #64748b;
          font-size: 14px;
        }

        .detail-value {
          color: #1e293b;
          font-weight: 500;
          font-size: 14px;
        }

        .items-section {
          margin-bottom: 24px;
        }

        .totals-section {
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }

        .total-row.discount {
          color: #dc2626;
        }

        .total-row.final {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          padding-top: 12px;
          margin-top: 8px;
          border-top: 2px solid #e2e8f0;
        }
      `}</style>
    </div>
  );
}