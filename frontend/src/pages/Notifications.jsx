import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, CheckCircle, AlertTriangle, Package, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifs();
  }, []);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(`/notifications/read-all`);
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'Low Stock': return <Package className="text-orange-500" />;
      case 'Expiring': return <Calendar className="text-yellow-500" />;
      case 'Expired': return <AlertTriangle className="text-red-500" />;
      default: return <Bell className="text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
              {unreadCount} Unread
            </span>
          )}
        </div>
        <button onClick={markAllAsRead} className="text-primary hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors">
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center text-gray-400">
            <Bell size={48} className="mb-4 opacity-20" />
            <p>You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(n => (
              <div key={n.id} className={`p-4 transition-colors flex gap-4 ${n.is_read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}>
                <div className="mt-1">{getIcon(n.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-semibold ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h3>
                    <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <p className={`mt-1 text-sm ${n.is_read ? 'text-gray-500' : 'text-gray-700'}`}>{n.message}</p>
                </div>
                {!n.is_read && (
                  <button onClick={() => markAsRead(n.id)} className="text-sm text-primary hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors self-center flex items-center gap-1">
                    <CheckCircle size={16} /> Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
