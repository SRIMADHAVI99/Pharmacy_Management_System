import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Search, Trash2, ShoppingCart, User } from 'lucide-react';

const POS = () => {
  const [medicines, setMedicines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0); // Optional
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medRes, custRes] = await Promise.all([
          api.get('/medicines'),
          api.get('/customers')
        ]);
        setMedicines(medRes.data);
        setCustomers(custRes.data);
      } catch (error) {
        toast.error('Failed to load POS data');
      }
    };
    fetchData();
  }, []);

  const addToCart = (medicine) => {
    if (medicine.quantity <= 0) {
      toast.error('Out of stock!');
      return;
    }
    
    // Check expiry
    if (new Date(medicine.expiry_date) < new Date()) {
      toast.error('Cannot sell expired medicine!');
      return;
    }

    const existing = cart.find(item => item.medicine_id === medicine.id);
    if (existing) {
      if (existing.quantity >= medicine.quantity) {
        toast.error('Not enough stock available');
        return;
      }
      setCart(cart.map(item => item.medicine_id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { 
        medicine_id: medicine.id, 
        name: medicine.name, 
        unit_price: medicine.selling_price, 
        quantity: 1,
        requires_prescription: medicine.requires_prescription,
        prescription_verified: medicine.requires_prescription === 1 ? false : true
      }]);
    }
  };

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) return;
    const med = medicines.find(m => m.id === id);
    if (newQty > med.quantity) {
      toast.error('Not enough stock available');
      return;
    }
    setCart(cart.map(item => item.medicine_id === id ? { ...item, quantity: newQty } : item));
  };

  const verifyPrescription = (id) => {
    setCart(cart.map(item => item.medicine_id === id ? { ...item, prescription_verified: true } : item));
    toast.success('Prescription marked as verified for this sale');
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.medicine_id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount - discount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    // Validate prescription required
    const needsPrescription = cart.find(item => item.requires_prescription && !item.prescription_verified);
    if (needsPrescription) {
      toast.error(`Medicine ${needsPrescription.name} requires a verified prescription.`);
      return;
    }

    try {
      const res = await api.post('/sales', {
        customer_id: selectedCustomer || null,
        items: cart,
        payment_method: paymentMethod,
        discount: discount,
        tax: taxAmount
      });
      
      toast.success('Sale completed successfully');
      setCart([]);
      setDiscount(0);
      setSelectedCustomer('');
      
      // Update local medicines stock
      const updatedMeds = [...medicines];
      cart.forEach(item => {
        const medIndex = updatedMeds.findIndex(m => m.id === item.medicine_id);
        if (medIndex !== -1) {
          updatedMeds[medIndex].quantity -= item.quantity;
        }
      });
      setMedicines(updatedMeds);

      // Download invoice
      if (res.data.invoice_url) {
        window.open(`http://localhost:5000${res.data.invoice_url}`, '_blank');
      }

    } catch (error) {
      toast.error(error.response?.data?.error || 'Checkout failed');
    }
  };

  const filteredMedicines = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
      {/* Product Selection */}
      <div className="lg:w-7/12 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search medicines to add..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredMedicines.map(med => {
              const isExpired = new Date(med.expiry_date) < new Date();
              return (
              <div 
                key={med.id} 
                onClick={() => addToCart(med)}
                className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${med.quantity > 0 && !isExpired ? 'border-gray-200 hover:border-blue-300 bg-white' : 'border-red-200 bg-red-50 opacity-75'}`}
              >
                <div className="font-semibold text-gray-800 mb-1 truncate" title={med.name}>{med.name}</div>
                <div className="text-xs text-gray-500 mb-2 truncate">{med.generic_name || 'N/A'}</div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                  <span className="font-bold text-blue-600">₹{Number(med.selling_price).toFixed(2)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${med.quantity > 0 && !isExpired ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isExpired ? 'Expired' : `Stock: ${med.quantity}`}
                  </span>
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="lg:w-5/12 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <ShoppingCart size={20} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-800">Current Sale</h2>
        </div>
        
        {/* Customer Select */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Customer (Optional)</label>
          </div>
          <select 
            value={selectedCustomer} 
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Walk-in Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
            ))}
          </select>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart size={48} className="mb-4 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.medicine_id} className="flex flex-col bg-white p-3 rounded-lg border border-gray-100 shadow-sm gap-2">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-500">₹{Number(item.unit_price).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.medicine_id, item.quantity - 1)} className="px-2 py-1 bg-gray-50 hover:bg-gray-100">-</button>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => updateQuantity(item.medicine_id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center py-1 outline-none text-sm font-medium bg-transparent"
                        />
                        <button onClick={() => updateQuantity(item.medicine_id, item.quantity + 1)} className="px-2 py-1 bg-gray-50 hover:bg-gray-100">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.medicine_id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  {item.requires_prescription && !item.prescription_verified && (
                    <div className="flex justify-between items-center bg-red-50 p-2 rounded text-sm text-red-700">
                      <span>Requires Prescription</span>
                      <button onClick={() => verifyPrescription(item.medicine_id)} className="bg-red-100 hover:bg-red-200 px-2 py-1 rounded font-semibold">Verify</button>
                    </div>
                  )}
                  {item.requires_prescription && item.prescription_verified && (
                    <div className="text-xs text-green-600 font-semibold bg-green-50 p-1 rounded inline-block">Prescription Verified</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals & Actions */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-gray-800">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Tax ({taxRate}%)</span>
              <span className="font-medium text-gray-800">₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Discount (₹)</span>
              <input 
                type="number" 
                value={discount} 
                onChange={(e) => setDiscount(Math.max(0, e.target.value))}
                className="w-20 text-right border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-3 mb-4 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-2xl font-bold text-blue-600">₹{Math.max(0, total).toFixed(2)}</span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <div className="flex gap-2">
              {['Cash', 'Card', 'UPI'].map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${paymentMethod === method ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
