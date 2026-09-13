import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Eye, FileText, Check, X, Pill, Trash2 } from 'lucide-react';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Upload Form
  const [formData, setFormData] = useState({
    customer_id: '',
    doctor_name: '',
    prescription_date: '',
    expiry_date: '',
    file: null,
  });
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [selectedMed, setSelectedMed] = useState('');
  const [dosage, setDosage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, cRes, mRes] = await Promise.all([
        api.get('/prescriptions'),
        api.get('/customers'),
        api.get('/medicines')
      ]);
      setPrescriptions(pRes.data);
      setCustomers(cRes.data);
      setMedicines(mRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMed = () => {
    if (!selectedMed) return;
    const med = medicines.find(m => m.id === parseInt(selectedMed));
    setPrescriptionItems([...prescriptionItems, { medicine_id: med.id, name: med.name, dosage_instructions: dosage }]);
    setSelectedMed('');
    setDosage('');
  };

  const handleRemoveMed = (index) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Please upload an image/pdf');
      return;
    }
    
    const form = new FormData();
    form.append('customer_id', formData.customer_id);
    form.append('doctor_name', formData.doctor_name);
    form.append('prescription_date', formData.prescription_date);
    if (formData.expiry_date) form.append('expiry_date', formData.expiry_date);
    form.append('file', formData.file);
    if (prescriptionItems.length > 0) {
      form.append('items', JSON.stringify(prescriptionItems));
    }

    try {
      await api.post('/prescriptions', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Prescription uploaded successfully');
      setIsUploadModalOpen(false);
      setFormData({ customer_id: '', doctor_name: '', prescription_date: '', expiry_date: '', file: null });
      setPrescriptionItems([]);
      fetchData();
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  const openViewModal = async (id) => {
    try {
      const res = await api.get(`/prescriptions/${id}`);
      setSelectedPrescription(res.data);
      setIsViewModalOpen(true);
    } catch (error) {
      toast.error('Failed to load prescription');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/prescriptions/${id}/verify`, { status });
      toast.success(`Prescription marked as ${status}`);
      if (selectedPrescription) {
        setSelectedPrescription({ ...selectedPrescription, verification_status: status });
      }
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Verified</span>;
      case 'Rejected': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">Rejected</span>;
      case 'Dispensed': return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">Dispensed</span>;
      default: return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Prescriptions</h1>
        <button onClick={() => setIsUploadModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90">
          <Plus size={18} /> Upload Prescription
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading prescriptions...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                <th className="p-4">ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Doctor</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prescriptions.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">#{p.id}</td>
                  <td className="p-4 text-gray-700">{p.customer_name}</td>
                  <td className="p-4 text-gray-600">Dr. {p.doctor_name}</td>
                  <td className="p-4 text-gray-600">{new Date(p.prescription_date).toLocaleDateString()}</td>
                  <td className="p-4">{getStatusBadge(p.verification_status)}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => openViewModal(p.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View"><Eye size={18} /></button>
                  </td>
                </tr>
              ))}
              {prescriptions.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-500">No prescriptions found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-xl my-8">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2"><FileText className="text-primary"/> Upload Prescription</h2>
              <button type="button" onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                  <select required value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Select Customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name *</label>
                  <input required type="text" value={formData.doctor_name} onChange={e => setFormData({...formData, doctor_name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prescription Date *</label>
                  <input required type="date" value={formData.prescription_date} onChange={e => setFormData({...formData, prescription_date: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="date" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Pill size={16}/> Prescription Medicines</h3>
                <div className="flex gap-2 mb-3">
                  <select value={selectedMed} onChange={e => setSelectedMed(e.target.value)} className="flex-1 border border-gray-300 rounded-lg p-2 outline-none">
                    <option value="">Select Medicine</option>
                    {medicines.filter(m => m.requires_prescription).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <input type="text" placeholder="Dosage (e.g. 1-0-1 after food)" value={dosage} onChange={e => setDosage(e.target.value)} className="flex-1 border border-gray-300 rounded-lg p-2 outline-none" />
                  <button type="button" onClick={handleAddMed} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200">Add</button>
                </div>
                
                {prescriptionItems.length > 0 && (
                  <ul className="space-y-2 mt-3">
                    {prescriptionItems.map((item, i) => (
                      <li key={i} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 text-sm">
                        <span><span className="font-medium text-gray-800">{item.name}</span> - {item.dosage_instructions}</span>
                        <button type="button" onClick={() => handleRemoveMed(i)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prescription File (Image/PDF) *</label>
                <input required type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setFormData({...formData, file: e.target.files[0]})} className="w-full border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-xl flex gap-6 max-h-[90vh]">
            <div className="w-1/2 flex flex-col bg-gray-50 rounded-xl overflow-hidden border">
              {selectedPrescription.image_url ? (
                selectedPrescription.image_url.endsWith('.pdf') ? (
                  <iframe src={`http://localhost:5000${selectedPrescription.image_url}`} className="w-full h-full min-h-[400px]"></iframe>
                ) : (
                  <img src={`http://localhost:5000${selectedPrescription.image_url}`} alt="Prescription" className="w-full h-auto object-contain max-h-[70vh]" />
                )
              ) : (
                <div className="p-8 text-center text-gray-400">No file uploaded</div>
              )}
            </div>
            
            <div className="w-1/2 flex flex-col space-y-6 overflow-y-auto pr-2">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-2xl text-gray-800">Prescription #{selectedPrescription.id}</h2>
                  <div className="mt-1">{getStatusBadge(selectedPrescription.verification_status)}</div>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div><span className="text-gray-500 block">Customer</span><span className="font-semibold">{selectedPrescription.customer_name}</span></div>
                <div><span className="text-gray-500 block">Doctor</span><span className="font-semibold">Dr. {selectedPrescription.doctor_name}</span></div>
                <div><span className="text-gray-500 block">Date</span><span className="font-semibold">{new Date(selectedPrescription.prescription_date).toLocaleDateString()}</span></div>
                <div><span className="text-gray-500 block">Expiry</span><span className="font-semibold">{selectedPrescription.expiry_date ? new Date(selectedPrescription.expiry_date).toLocaleDateString() : 'N/A'}</span></div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2 border-b pb-1">Prescribed Medicines</h3>
                {selectedPrescription.items && selectedPrescription.items.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedPrescription.items.map(item => (
                      <li key={item.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <span className="font-medium text-blue-700 block">{item.medicine_name}</span>
                        <span className="text-gray-600 text-sm block mt-1">{item.dosage_instructions}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">No specific medicines recorded</p>
                )}
              </div>

              <div className="mt-auto pt-6 flex gap-3 border-t border-gray-100">
                {selectedPrescription.verification_status === 'Pending' && (
                  <>
                    <button onClick={() => updateStatus(selectedPrescription.id, 'Verified')} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"><Check size={18}/> Verify</button>
                    <button onClick={() => updateStatus(selectedPrescription.id, 'Rejected')} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"><X size={18}/> Reject</button>
                  </>
                )}
                {selectedPrescription.verification_status === 'Verified' && (
                  <button onClick={() => updateStatus(selectedPrescription.id, 'Dispensed')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"><Pill size={18}/> Mark as Dispensed</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
