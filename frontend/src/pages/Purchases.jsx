import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save } from 'lucide-react';

const Purchases = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  
  const [items, setItems] = useState([
    { medicine_id: '', batch_number: '', quantity: 1, purchase_price: 0, expiry_date: '' }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supRes, medRes] = await Promise.all([
          api.get('/suppliers'),
          api.get('/medicines')
        ]);
        setSuppliers(supRes.data);
        setMedicines(medRes.data);
      } catch (error) {
        toast.error('Failed to load initial data');
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { medicine_id: '', batch_number: '', quantity: 1, purchase_price: 0, expiry_date: '' }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSupplier) {
      toast.error('Please select a supplier');
      return;
    }
    
    // Validate items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.medicine_id || !item.batch_number || item.quantity <= 0 || item.purchase_price < 0 || !item.expiry_date) {
        toast.error('Please fill all item fields correctly');
        return;
      }
    }

    try {
      await api.post('/purchases', {
        supplier_id: selectedSupplier,
        items: items
      });
      toast.success('Purchase recorded successfully!');
      setSelectedSupplier('');
      setItems([{ medicine_id: '', batch_number: '', quantity: 1, purchase_price: 0, expiry_date: '' }]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record purchase');
    }
  };

  const totalPurchase = items.reduce((sum, item) => sum + (Number(item.purchase_price) * Number(item.quantity) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">New Purchase</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Supplier *</label>
            <select 
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Purchase Items</h3>
              <button 
                type="button" 
                onClick={handleAddItem}
                className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors text-sm font-medium"
              >
                <Plus size={16} /> Add Row
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                    <th className="p-3 font-semibold min-w-[200px]">Medicine *</th>
                    <th className="p-3 font-semibold min-w-[150px]">Batch No *</th>
                    <th className="p-3 font-semibold min-w-[120px]">Qty *</th>
                    <th className="p-3 font-semibold min-w-[150px]">Unit Price ($) *</th>
                    <th className="p-3 font-semibold min-w-[150px]">Expiry Date *</th>
                    <th className="p-3 font-semibold min-w-[100px]">Subtotal</th>
                    <th className="p-3 font-semibold text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/30">
                      <td className="p-2">
                        <select 
                          value={item.medicine_id}
                          onChange={(e) => handleItemChange(idx, 'medicine_id', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          required
                        >
                          <option value="">Select Medicine</option>
                          {medicines.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          value={item.batch_number}
                          onChange={(e) => handleItemChange(idx, 'batch_number', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          placeholder="Batch No."
                          required
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="number" 
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="number" 
                          step="0.01"
                          min="0"
                          value={item.purchase_price}
                          onChange={(e) => handleItemChange(idx, 'purchase_price', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="date" 
                          value={item.expiry_date}
                          onChange={(e) => handleItemChange(idx, 'expiry_date', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          required
                        />
                      </td>
                      <td className="p-2 text-sm font-medium text-gray-700">
                        ${(item.quantity * item.purchase_price || 0).toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length === 1}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="text-xl font-bold text-gray-800">
              Total Purchase: <span className="text-blue-600">${totalPurchase.toFixed(2)}</span>
            </div>
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Save size={18} /> Record Purchase
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Purchases;
