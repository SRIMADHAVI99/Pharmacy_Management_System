import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines');
      setMedicines(res.data);
    } catch (error) {
      toast.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    reset({
      name: '', generic_name: '', category: '', manufacturer: '', batch_number: '', 
      dosage: '', form: '', purchase_price: '', selling_price: '', quantity: '', 
      min_stock: '10', expiry_date: '', requires_prescription: false
    });
    setIsModalOpen(true);
  };

  const openEditModal = (med) => {
    setEditingId(med.id);
    reset({
      name: med.name,
      generic_name: med.generic_name,
      category: med.category,
      manufacturer: med.manufacturer,
      batch_number: med.batch_number,
      dosage: med.dosage,
      form: med.form,
      purchase_price: med.purchase_price,
      selling_price: med.selling_price,
      quantity: med.quantity,
      min_stock: med.min_stock,
      expiry_date: med.expiry_date.split('T')[0],
      requires_prescription: med.requires_prescription === 1
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await api.put(`/medicines/${editingId}`, data);
        toast.success('Medicine updated');
      } else {
        await api.post('/medicines', data);
        toast.success('Medicine added');
      }
      setIsModalOpen(false);
      fetchMedicines();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.delete(`/medicines/${id}`);
        toast.success('Medicine deleted');
        fetchMedicines();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const filtered = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  const getStockBadge = (qty, min, expiry) => {
    if (new Date(expiry) < new Date()) return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">Expired</span>;
    if (qty === 0) return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">Out of Stock</span>;
    if (qty <= min) return <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-800">Low Stock</span>;
    return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">In Stock</span>;
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Medicines</h1>
        <button onClick={openAddModal} className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/90">
          <Plus size={18} /> Add Medicine
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 p-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:border-primary" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50 text-sm text-gray-600">
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Batch</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="7" className="p-4 text-center">Loading...</td></tr> : 
             filtered.map(m => (
              <tr key={m.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.generic_name}</div>
                </td>
                <td className="p-4">{m.category}</td>
                <td className="p-4">{m.batch_number}</td>
                <td className="p-4">₹{m.selling_price}</td>
                <td className="p-4">{m.quantity}</td>
                <td className="p-4">{getStockBadge(m.quantity, m.min_stock, m.expiry_date)}</td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => openEditModal(m)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">{editingId ? 'Edit Medicine' : 'Add Medicine'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input {...register('name', { required: true })} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Generic Name</label>
                  <input {...register('generic_name')} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input {...register('category')} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Manufacturer</label>
                  <input {...register('manufacturer')} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Batch Number *</label>
                  <input {...register('batch_number', { required: true })} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date *</label>
                  <input type="date" {...register('expiry_date', { required: true })} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Purchase Price *</label>
                  <input type="number" step="0.01" {...register('purchase_price', { required: true })} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Selling Price *</label>
                  <input type="number" step="0.01" {...register('selling_price', { required: true })} className="w-full border rounded p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity *</label>
                  <input type="number" {...register('quantity', { required: true })} disabled={!!editingId} className="w-full border rounded p-2 disabled:bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Stock *</label>
                  <input type="number" {...register('min_stock', { required: true })} className="w-full border rounded p-2" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" {...register('requires_prescription')} id="rx" />
                <label htmlFor="rx">Requires Prescription</label>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicines;
