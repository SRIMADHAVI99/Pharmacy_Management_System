import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Shield, ShieldAlert, User as UserIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    reset({ username: '', password: '', role: 'Staff', status: 'Active' });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingId(user.id);
    reset({ username: user.username, role: user.role, status: user.status });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, { role: data.role, status: data.status });
        toast.success('User updated');
      } else {
        await api.post('/users', data);
        toast.success('User added');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('User deleted');
        fetchUsers();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const getRoleIcon = (role) => {
    if (role === 'Admin') return <ShieldAlert size={16} className="text-purple-600" />;
    if (role === 'Pharmacist') return <Shield size={16} className="text-blue-600" />;
    return <UserIcon size={16} className="text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button onClick={openAddModal} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                <th className="p-4">Username</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{u.username}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(u.role)}
                      <span>{u.role}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${u.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => openEditModal(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl text-gray-800">{editingId ? 'Edit User Role' : 'Add New User'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input {...register('username', { required: true })} disabled={!!editingId} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100" />
              </div>
              
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input type="password" {...register('password', { required: true })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select {...register('role')} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary">
                  <option value="Admin">Admin</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              {editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select {...register('status')} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium">{editingId ? 'Update' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
