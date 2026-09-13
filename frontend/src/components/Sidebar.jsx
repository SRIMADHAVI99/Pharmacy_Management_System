import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Pill, 
  Package, 
  Users, 
  ShoppingCart, 
  FileText, 
  Truck, 
  LogOut,
  Bell,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Pharmacist', 'Staff'] },
    { name: 'Medicines', path: '/medicines', icon: <Pill size={20} />, roles: ['Admin', 'Pharmacist', 'Staff'] },
    { name: 'POS / Sales', path: '/pos', icon: <ShoppingCart size={20} />, roles: ['Admin', 'Pharmacist', 'Staff'] },
    { name: 'Purchases', path: '/purchases', icon: <Package size={20} />, roles: ['Admin', 'Pharmacist'] },
    { name: 'Customers', path: '/customers', icon: <Users size={20} />, roles: ['Admin', 'Pharmacist', 'Staff'] },
    { name: 'Suppliers', path: '/suppliers', icon: <Truck size={20} />, roles: ['Admin', 'Pharmacist'] },
    { name: 'Prescriptions', path: '/prescriptions', icon: <FileText size={20} />, roles: ['Admin', 'Pharmacist', 'Staff'] },
    { name: 'Orders', path: '/orders', icon: <Package size={20} />, roles: ['Admin', 'Pharmacist', 'Staff'] },
    { name: 'Reports', path: '/reports', icon: <FileText size={20} />, roles: ['Admin', 'Pharmacist'] },
    { name: 'Notifications', path: '/notifications', icon: <Bell size={20} />, roles: ['Admin', 'Pharmacist', 'Staff'] },
    { name: 'Users', path: '/users', icon: <Users size={20} />, roles: ['Admin'] },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} />, roles: ['Admin'] },
  ];

  return (
    <div className="w-64 bg-white border-r h-full flex flex-col shadow-sm">
      <div className="h-16 flex items-center px-6 border-b">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <Pill className="text-primary" />
          PharmaCare
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            if (item.roles.includes(user?.role)) {
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              );
            }
            return null;
          })}
        </nav>
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
