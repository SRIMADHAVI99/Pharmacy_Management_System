import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, Download, TrendingUp, DollarSign, Package } from 'lucide-react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesReport();
    } else if (activeTab === 'inventory') {
      fetchInventoryReport();
    }
  }, [activeTab]);

  const fetchSalesReport = async () => {
    setLoading(true);
    try {
      let query = '';
      if (startDate && endDate) {
        query = `?start_date=${startDate}&end_date=${endDate}`;
      }
      const res = await api.get(`/reports/sales${query}`);
      setSalesData(res.data);
    } catch (error) {
      toast.error('Failed to load sales report');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/inventory');
      setInventoryData(res.data);
    } catch (error) {
      toast.error('Failed to load inventory report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Reports Dashboard</h1>
        <button onClick={handlePrint} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Download size={18} /> Export / Print
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200 print:hidden">
        <button onClick={() => setActiveTab('sales')} className={`pb-2 px-1 font-medium ${activeTab === 'sales' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>
          Sales & Revenue
        </button>
        <button onClick={() => setActiveTab('inventory')} className={`pb-2 px-1 font-medium ${activeTab === 'inventory' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>
          Inventory & Stock
        </button>
      </div>

      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-end gap-4 print:hidden">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-300 rounded px-3 py-2 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-300 rounded px-3 py-2 outline-none" />
            </div>
            <button onClick={fetchSalesReport} className="bg-blue-50 text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100">
              Apply Filter
            </button>
          </div>

          {loading ? (
            <div className="text-center p-8 text-gray-500">Loading sales data...</div>
          ) : salesData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="bg-green-100 p-4 rounded-lg text-green-600"><DollarSign size={24} /></div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Revenue</p>
                    <h3 className="text-2xl font-bold">₹{Number(salesData.totalRevenue).toFixed(2)}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="bg-blue-100 p-4 rounded-lg text-blue-600"><TrendingUp size={24} /></div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Transactions</p>
                    <h3 className="text-2xl font-bold">{salesData.totalSales}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4">Revenue Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData.daily}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="daily_total" stroke="#0ea5e9" strokeWidth={3} name="Revenue (₹)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50"><h3 className="font-bold">Top Selling Medicines</h3></div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-sm text-gray-600">
                      <th className="p-3">Medicine Name</th>
                      <th className="p-3">Quantity Sold</th>
                      <th className="p-3">Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.topSelling.map((m, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3 font-medium">{m.name}</td>
                        <td className="p-3">{m.total_quantity_sold}</td>
                        <td className="p-3 text-green-600 font-medium">₹{Number(m.total_revenue).toFixed(2)}</td>
                      </tr>
                    ))}
                    {salesData.topSelling.length === 0 && <tr><td colSpan="3" className="p-4 text-center">No sales data</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center p-8 text-gray-500">Loading inventory data...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm">Total Items</p>
                  <h3 className="text-2xl font-bold">{inventoryData.length}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm">Inventory Value</p>
                  <h3 className="text-2xl font-bold text-green-600">₹{inventoryData.reduce((acc, curr) => acc + Number(curr.total_value), 0).toFixed(2)}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm">Low Stock Items</p>
                  <h3 className="text-2xl font-bold text-orange-500">{inventoryData.filter(i => i.quantity <= i.min_stock).length}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm">Expired Items</p>
                  <h3 className="text-2xl font-bold text-red-500">{inventoryData.filter(i => new Date(i.expiry_date) < new Date()).length}</h3>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50"><h3 className="font-bold">Inventory Status Report</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b text-sm text-gray-600">
                        <th className="p-3">Medicine Name</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Min Stock</th>
                        <th className="p-3">Value</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryData.map(m => {
                        const isExpired = new Date(m.expiry_date) < new Date();
                        const isLowStock = m.quantity <= m.min_stock;
                        return (
                          <tr key={m.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{m.name}</td>
                            <td className="p-3">{m.category}</td>
                            <td className="p-3">{m.quantity}</td>
                            <td className="p-3">{m.min_stock}</td>
                            <td className="p-3">₹{Number(m.total_value).toFixed(2)}</td>
                            <td className="p-3">
                              {isExpired ? <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Expired</span> :
                               isLowStock ? <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Low Stock</span> :
                               <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Healthy</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
