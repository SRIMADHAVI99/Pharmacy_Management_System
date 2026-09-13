import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, data);
        toast.success('Customer updated');
      } else {
        await api.post('/customers', data);
        toast.success('Customer added');
      }
      setIsModalOpen(false);
      reset();
      setEditingId(null);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleEdit = (cust) => {
    setEditingId(cust.id);
    ['name', 'phone', 'email', 'address'].forEach(field => setValue(field, cust[field]));
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        toast.success('Customer deleted');
        fetchCustomers();
      } catch (error) {
        toast.error('Failed to delete customer');
      }
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    reset();
    setIsModalOpen(true);
  };

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} /> Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Address</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No customers found.</td></tr>
              ) : (
                filtered.map(cust => (
                  <tr key={cust.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{cust.name}</td>
                    <td className="p-4 text-gray-600">{cust.phone}</td>
                    <td className="p-4 text-gray-600">{cust.email}</td>
                    <td className="p-4 text-gray-600">{cust.address}</td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => handleEdit(cust)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(cust.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">{editingId ? 'Edit Customer' : 'Add Customer'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input {...register('name', { required: 'Name is required' })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input {...register('phone')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" {...register('email')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea {...register('address')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" rows="3"></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">{editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
