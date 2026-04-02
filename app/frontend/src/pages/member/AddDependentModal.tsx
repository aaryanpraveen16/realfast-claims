import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

interface AddDependentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RELATIONSHIPS = ['SPOUSE', 'CHILD', 'FATHER', 'MOTHER', 'OTHER'];
const MEDICAL_CONDITIONS = [
  'Diabetes', 
  'Hypertension', 
  'Asthma', 
  'Heart Disease', 
  'Thyroid', 
  'None of the above'
];

export const AddDependentModal: React.FC<AddDependentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    relationship: 'SPOUSE',
    aadhaar: '',
    medicalConditions: [] as string[],
    otherConditions: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCondition = (condition: string) => {
    setFormData(prev => {
      if (condition === 'None of the above') {
        return { ...prev, medicalConditions: ['None of the above'] };
      }
      const filtered = prev.medicalConditions.filter(c => c !== 'None of the above');
      if (filtered.includes(condition)) {
        return { ...prev, medicalConditions: filtered.filter(c => c !== condition) };
      }
      return { ...prev, medicalConditions: [...filtered, condition] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.aadhaar.length !== 12 || !/^\d+$/.test(formData.aadhaar)) {
      setError('Aadhaar Number must be exactly 12 numeric digits.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('dob', new Date(formData.dob).toISOString());
      formDataToSend.append('relationship', formData.relationship);
      formDataToSend.append('aadhaar_hash', `mock_hash_${formData.aadhaar}`);
      
      const medicalStr = formData.medicalConditions.filter(c => c !== 'None of the above').join(', ') + 
                        (formData.otherConditions ? `, ${formData.otherConditions}` : '');
      if (medicalStr) {
        formDataToSend.append('medical_conditions', medicalStr);
      }
      
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }

      await axios.post('/api/members/me/dependents', formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onSuccess();

      onClose();
      // Reset form
      setFormData({ name: '', dob: '', relationship: 'SPOUSE', aadhaar: '', medicalConditions: [], otherConditions: '' });
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add dependent.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Scroll Wrapper */}
      <div className="fixed inset-0 z-[160] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 pointer-events-none">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl pointer-events-auto overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500 my-8">

          
          {/* Header */}
          <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 relative">
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Onboard Dependent</h2>
             <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Intelligent Eligibility & Underwriting</p>
             
             <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
               <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            {error && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">{error}</div>}

            {/* Basic Info Group */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">1. Identity Details</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Full Legal Name</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Aditi Sharma" className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Relationship</label>
                    <select value={formData.relationship} onChange={(e) => setFormData({...formData, relationship: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold appearance-none bg-slate-50">
                      {RELATIONSHIPS.map(rel => <option key={rel} value={rel}>{rel === 'SPOUSE' ? 'Spouse' : rel === 'CHILD' ? 'Child' : rel.charAt(0) + rel.slice(1).toLowerCase()}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Date of Birth</label>
                    <input required type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-medium" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Aadhaar Number</label>
                  <input required type="text" maxLength={12} value={formData.aadhaar} onChange={(e) => setFormData({...formData, aadhaar: e.target.value.replace(/\D/g, '')})} placeholder="0000 0000 0000" className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-medium tracking-[0.2em] text-lg" />
                </div>
              </div>
            </div>

            {/* Medical Declaration Group */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">2. Medical Declaration</h3>
              <div className="grid grid-cols-2 gap-3">
                {MEDICAL_CONDITIONS.map(condition => (
                  <button 
                    key={condition} type="button" onClick={() => toggleCondition(condition)}
                    className={`px-4 py-3 rounded-xl border text-left text-xs font-bold transition-all ${
                      formData.medicalConditions.includes(condition) ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-200'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
              <textarea placeholder="Other conditions or remarks (Optional)" value={formData.otherConditions} onChange={(e) => setFormData({...formData, otherConditions: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-medium text-sm min-h-[80px]" />
            </div>

            {/* Document Upload Group */}
            <div className="space-y-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">3. Supporting Documents (Optional)</h3>
               <div className="relative group/file">
                  <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="opacity-0 absolute inset-0 cursor-pointer z-10" />
                  <div className={`w-full p-6 border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center gap-2 ${
                    selectedFile ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100 group-hover/file:border-indigo-200'
                  }`}>
                    <svg className={`h-8 w-8 ${selectedFile ? 'text-green-500' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p className={`text-xs font-bold ${selectedFile ? 'text-green-700' : 'text-slate-500'}`}>
                      {selectedFile ? selectedFile.name : 'Upload Medical Reports / PED Declarations'}
                    </p>
                    <span className="text-[9px] font-bold text-slate-400">PDF, PNG, JPG (Max 5MB)</span>
                  </div>
               </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl text-lg font-black transition-all shadow-xl shadow-indigo-100 transform active:scale-[0.98] mt-4 ${
              loading ? 'bg-indigo-400 cursor-not-allowed text-indigo-50' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}>
              {loading ? 'Analyzing Profile...' : 'Submit for Underwriting'}
            </button>
            <p className="text-center text-[10px] font-bold text-slate-400 px-4 leading-relaxed uppercase tracking-tighter">
              Healthy dependents under 55 are auto-approved instantly. High-risk profiles require manual review.
            </p>
          </form>
        </div>
      </div>
    </div>
</>


  );

  return createPortal(modalContent, document.body);
};
