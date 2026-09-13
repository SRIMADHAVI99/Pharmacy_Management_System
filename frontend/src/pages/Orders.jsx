import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Eye, Edit, X } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = async (id) => {
    try {
      const res = await api.get(`/orders/${id}`);
      setSelectedOrder(res.data);
      setIsModalOpen(true);
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusModalOpen(true);
  };

  const updateStatus = async () => {
    try {
      await api.put(`/orders/${selectedOrder.id}/status`, { status: newStatus });
      toast.success('Order status updated');
      setIsStatusModalOpen(false);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Ready': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">#{o.id}</td>
                    <td className="p-4 text-gray-700">{o.customer_name}</td>
                    <td className="p-4 text-gray-600">{new Date(o.order_date).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-blue-600">₹{Number(o.total_amount).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${o.payment_status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => openViewModal(o.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View Details"><Eye size={18} /></button>
                      <button onClick={() => openStatusModal(o)} className="p-1.5 text-primary hover:bg-blue-50 rounded" title="Update Status"><Edit size={18} /></button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-gray-500">No orders found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl text-gray-800">Order #{selectedOrder.id} Details</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Customer Info</p>
                <p className="font-medium text-gray-800">{selectedOrder.customer_name}</p>
                <p className="text-gray-600">{selectedOrder.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 mb-1">Order Date</p>
                <p className="font-medium text-gray-800">{new Date(selectedOrder.order_date).toLocaleString()}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden mb-4">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3">Medicine</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedOrder.items?.map(item => (
                    <tr key={item.id}>
                      <td className="p-3">{item.medicine_name}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">₹{Number(item.unit_price).toFixed(2)}</td>
                      <td className="p-3 text-right font-medium">₹{Number(item.total_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <div className="text-right">
                <p className="text-gray-500 text-sm mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">₹{Number(selectedOrder.total_amount).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {isStatusModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg text-gray-800">Update Status</h2>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-sm text-gray-600">Order #{selectedOrder.id}</p>
              <select 
                value={newStatus} 
                onChange={e => setNewStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={updateStatus} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
