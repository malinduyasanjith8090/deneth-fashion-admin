import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderAPI } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate, cn } from '../../utils/cn';
import { Search, Eye, Download } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const OrderList = () => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: ordersResponse, isLoading } = useQuery({ 
    queryKey: ['orders'], 
    queryFn: () => orderAPI.getOrders() 
  });

  // Destructure the response correctly
  const orders = ordersResponse?.success ? ordersResponse.orders : [];

  const filteredOrders = orders.filter(order => 
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerPhone.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Shipped': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'Delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  const handleExportCSV = () => {
    // Simple CSV export
    const headers = ['Order ID', 'Customer', 'Phone', 'Total', 'Status', 'Date'];
    const csvData = orders.map(order => [
      order.orderId,
      order.customerName,
      order.customerPhone,
      order.total,
      order.status,
      formatDate(order.createdAt)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Orders exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-slate-400">Track and manage customer orders.</p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleExportCSV}
        >
          <Download size={18} /> Export CSV
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-700/50 flex gap-4 bg-surface">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-slate-700 text-sm rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-300">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr><td colSpan={6} className="p-6 text-center">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center">No orders found</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{order.orderId}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white">{order.customerName}</p>
                        <p className="text-xs">{order.customerPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4 text-white font-medium">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", getStatusColor(order.status))}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedOrder(order.orderId)}
                      >
                        <Eye size={16} className="text-indigo-400" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedOrder && (
        <OrderDetailsModal 
          orderId={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
};

const OrderDetailsModal = ({ orderId, onClose }: { orderId: string, onClose: () => void }) => {
  const queryClient = useQueryClient();
  
  const { data: orderResponse, isLoading } = useQuery({ 
    queryKey: ['order', orderId], 
    queryFn: () => orderAPI.getOrder(orderId) 
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      orderAPI.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      toast.success('Order status updated');
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (!orderResponse?.success || !orderResponse.order) return null;

  const order = orderResponse.order;

  return (
    <Modal isOpen={true} onClose={onClose} title={`Order Details - ${order.orderId}`} size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-slate-500 uppercase">Customer Details</h4>
            <p className="text-white font-medium">{order.customerName}</p>
            <p className="text-sm">{order.customerAddress}, {order.customerCity}</p>
            <p className="text-sm">{order.customerPhone}</p>
            {order.customerEmail && (
              <p className="text-sm text-indigo-400">{order.customerEmail}</p>
            )}
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-slate-500 uppercase">Order Info</h4>
            <p className="text-sm">Date: {formatDate(order.createdAt)}</p>
            <p className="text-sm">Payment: <span className="text-white">{order.paymentMethod}</span></p>
            <div className="mt-2">
              <select 
                className="bg-slate-800 border border-slate-600 rounded text-sm px-2 py-1 text-white"
                value={order.status}
                onChange={(e) => updateMutation.mutate({ id: order.orderId, status: e.target.value })}
                disabled={updateMutation.isPending}
              >
                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {updateMutation.isPending && (
                <span className="ml-2 text-xs text-slate-400">Updating...</span>
              )}
            </div>
          </div>
        </div>

        <div className="border rounded-lg border-slate-700 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Size / Color</th>
                <th className="px-4 py-2 text-right">Qty</th>
                <th className="px-4 py-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3">
                    <span className="text-white">{item.name}</span>
                  </td>
                  <td className="px-4 py-3">{item.size} / {item.color}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-800/50">
              <tr>
                <td colSpan={3} className="px-4 py-2 text-right text-slate-400">Subtotal</td>
                <td className="px-4 py-2 text-right font-medium">{formatCurrency(order.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="px-4 py-2 text-right text-slate-400">Shipping</td>
                <td className="px-4 py-2 text-right font-medium">{formatCurrency(order.shippingFee)}</td>
              </tr>
              <tr className="border-t border-slate-700">
                <td colSpan={3} className="px-4 py-3 text-right font-bold text-white">Total</td>
                <td className="px-4 py-3 text-right font-bold text-indigo-400">{formatCurrency(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {order.notes && (
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-slate-500 uppercase mb-2">Order Notes</h4>
            <p className="text-white text-sm">{order.notes}</p>
          </div>
        )}
        
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={() => window.print()}>Print Invoice</Button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderList;