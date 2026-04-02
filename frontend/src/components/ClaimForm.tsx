import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export interface LineItemInput {
  procedure_code: string;
  service_type: string;
  service_date: string; // ISO string
  charged_amount: number;
  description?: string;
  _pcsSearchTerm?: string; 
}

interface ClaimFormProps {
  mode: 'MEMBER' | 'PROVIDER';
  initialMemberId?: string;
  onSubmitSuccess: (claimId: string) => void;
}

const ICD_CODES = [
  { code: 'J06.9', description: 'Acute upper respiratory infection' },
  { code: 'A09.9', description: 'Gastroenteritis and colitis' },
  { code: 'M54.5', description: 'Low back pain' },
  { code: 'I10', description: 'Essential hypertension' },
  { code: 'E11.9', description: 'Type 2 diabetes mellitus' },
  { code: 'N39.0', description: 'Urinary tract infection' },
  { code: 'R51.9', description: 'Headache, unspecified' },
  { code: 'L20.9', description: 'Atopic dermatitis' },
  { code: 'Z00.00', description: 'General adult medical examination' }
];

const PROCEDURE_CODES = [
  { code: '0B110Z4', description: 'Bypass Lower Lobe Bronchus to Upper Lobe Bronchus' },
  { code: '3E02329', description: 'Introduction of Other Antineoplastic into Muscle, Percutaneous Approach' },
  { code: '4A023BZ', description: 'Measurement of Cardiac Output, Percutaneous Approach' },
  { code: 'GZ11ZZZ', description: 'Individual Psychotherapy, Medical' },
  { code: 'H5000ZZ', description: 'Audiometry, Hearing Screening' }
];

const SERVICE_TYPES = [
  'DOCTOR_VISIT', 'MRI_SCAN', 'BLOOD_TEST', 'SURGERY',
  'PHYSIOTHERAPY', 'ROOM_RENT', 'MEDICINE', 'AMBULANCE'
];

export const ClaimForm = ({ mode, initialMemberId, onSubmitSuccess }: ClaimFormProps) => {
  const navigate = useNavigate();
  const [diagnosisCode, setDiagnosisCode] = useState('');
  const [dateOfVisit, setDateOfVisit] = useState(new Date().toISOString().split('T')[0]);
  const [admissionDate, setAdmissionDate] = useState('');
  const [dischargeDate, setDischargeDate] = useState('');
  const [memberId, setMemberId] = useState(initialMemberId || '');
  
  // Bank Details
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  
  // Search State
  const [providerId, setProviderId] = useState('');
  const [providers, setProviders] = useState<{ id: string; name: string; city: string; network_status: string }[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<{ id: string; name: string; city: string; network_status: string }[]>([]);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);

  const [icdSearch, setIcdSearch] = useState('');
  const [filteredIcd, setFilteredIcd] = useState<{ code: string; description: string }[]>([]);
  const [showIcdDropdown, setShowIcdDropdown] = useState(false);
  
  // Procedure PCS Search (Per line item)
  const [pcsActiveIndex, setPcsActiveIndex] = useState<number | null>(null);
  const [filteredPcs, setFilteredPcs] = useState<{ code: string; description: string }[]>([]);
  
  // Member/Dependent State
  const [isDependent, setIsDependent] = useState(false);
  const [dependentId, setDependentId] = useState('');
  const [dependents, setDependents] = useState<{ id: string, name: string, status: string }[]>([]);
  const [memberStatus, setMemberStatus] = useState<string | null>(null);
  
  // Line Items & Files
  const [lineItems, setLineItems] = useState<LineItemInput[]>([
    { procedure_code: '', service_type: 'DOCTOR_VISIT', service_date: new Date().toISOString().split('T')[0], charged_amount: 0, _pcsSearchTerm: '' }
  ]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const providerRef = useRef<HTMLDivElement>(null);
  const icdRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch Providers
        const provRes = await axios.get('/api/providers', { headers });
        setProviders(provRes.data);

        // Fetch Dependents & Profile if Member
        if (mode === 'MEMBER') {
           const memberRes = await axios.get('/api/members/me', { headers });
           const member = memberRes.data;
           setMemberStatus(member.status);
           setDependents(member.dependents || []);
           setBankAccount(member.bank_account || '');
           setIfscCode(member.ifsc_code || '');
        }
      } catch (err) {
        console.error('Failed to fetch initial form data', err);
      }
    };
    fetchData();

    // Click outside listener
    const handleClickOutside = (event: MouseEvent) => {
      if (providerRef.current && !providerRef.current.contains(event.target as Node)) {
        setShowProviderDropdown(false);
      }
      if (icdRef.current && !icdRef.current.contains(event.target as Node)) {
        setShowIcdDropdown(false);
      }
      // PCS dropdowns are handled per-item in close logic
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mode]);

  const handleProviderSearch = (val: string) => {
    setProviderId(val);
    const filtered = providers.filter(p => 
      p.name.toLowerCase().includes(val.toLowerCase()) || 
      p.city.toLowerCase().includes(val.toLowerCase()) ||
      p.id.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredProviders(filtered);
    setShowProviderDropdown(true);
  };

  const handleIcdSearch = (val: string) => {
    setIcdSearch(val);
    const filtered = ICD_CODES.filter(i => 
      i.code.toLowerCase().includes(val.toLowerCase()) || 
      i.description.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredIcd(filtered);
    setShowIcdDropdown(true);
  };

  const handlePcsSearch = (val: string, index: number) => {
    const updated = [...lineItems];
    updated[index]._pcsSearchTerm = val;
    setLineItems(updated);

    const filtered = PROCEDURE_CODES.filter(p => 
       p.code.toLowerCase().includes(val.toLowerCase()) || 
       p.description.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredPcs(filtered);
    setPcsActiveIndex(index);
  };

  const selectProvider = (p: { id: string, name: string }) => {
    setProviderId(p.name);
    (window as any)._selectedProviderId = p.id; 
    setShowProviderDropdown(false);
  };

  const selectIcd = (i: { code: string, description: string }) => {
    setDiagnosisCode(i.code);
    setIcdSearch(`${i.code} - ${i.description}`);
    setShowIcdDropdown(false);
  };

  const selectPcs = (i: { code: string, description: string }, index: number) => {
    const updated = [...lineItems];
    updated[index].procedure_code = i.code;
    updated[index]._pcsSearchTerm = `${i.code} - ${i.description}`;
    setLineItems(updated);
    setPcsActiveIndex(null);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { 
      procedure_code: '', 
      service_type: 'DOCTOR_VISIT', 
      service_date: new Date().toISOString().split('T')[0], 
      charged_amount: 0, 
      _pcsSearchTerm: '' 
    }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
    if (pcsActiveIndex === index) setPcsActiveIndex(null);
  };

  const updateLineItem = (index: number, field: keyof LineItemInput, value: any) => {
    const updated = [...lineItems];
    (updated[index] as any)[field] = value;
    setLineItems(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      // 1. Upload files first if any
      let uploadedFilePaths: string[] = [];
      if (files.length > 0) {
        setUploading(true);
        const formData = new FormData();
        files.forEach(f => formData.append('documents', f));
        
        const uploadRes = await axios.post('/api/claims/upload', formData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        uploadedFilePaths = uploadRes.data.file_paths;
        setUploading(false);
      }

      // 2. Validation
      if (admissionDate && dischargeDate) {
        if (new Date(dischargeDate) < new Date(admissionDate)) {
          throw new Error('Discharge date cannot be before admission date.');
        }
      }

      // 3. Submit Claim
      const finalProviderId = (window as any)._selectedProviderId || providerId;

      const claimData = {
        claim_type: mode === 'MEMBER' ? 'REIMBURSEMENT' : 'CASHLESS',
        diagnosis_code: diagnosisCode,
        date_of_visit: dateOfVisit,
        admission_date: admissionDate || undefined,
        discharge_date: dischargeDate || undefined,
        bank_account: mode === 'MEMBER' ? bankAccount : undefined,
        ifsc_code: mode === 'MEMBER' ? ifscCode : undefined,
        provider_id: mode === 'MEMBER' ? finalProviderId : memberId,
        dependent_id: mode === 'MEMBER' && isDependent ? dependentId : undefined,
        line_items: lineItems,
        documents: uploadedFilePaths
      };

      const res = await axios.post('/api/claims', claimData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      onSubmitSuccess(res.data.id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit claim. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  // Block the form if the member is not ACTIVE
  if (mode === 'MEMBER' && memberStatus && memberStatus !== 'ACTIVE') {
    const isUnderwriting = memberStatus === 'PENDING_UNDERWRITING';
    return (
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-14 text-center border border-slate-100 space-y-6">
        <div className={`inline-flex items-center justify-center h-20 w-20 rounded-3xl mx-auto ${
          isUnderwriting ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-400'
        }`}>
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04L3 8v5.5a8.5 8.5 0 004.5 7.5l4.5 2.5 4.5-2.5A8.5 8.5 0 0021 13.5V8l-3.382-1.672z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900">
            {isUnderwriting ? 'Underwriting In Progress' : 'Account Not Active'}
          </h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
            {isUnderwriting
              ? 'Your application is currently being reviewed by our underwriting team. You can only file claims once your policy is approved and active.'
              : 'Your account is not currently active. Please contact support for assistance.'}
          </p>
        </div>
        {isUnderwriting && (
          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 text-left space-y-2">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">What happens next?</p>
            <ul className="text-sm font-medium text-amber-700 space-y-1">
              <li>· An underwriter will review your medical history and declarations.</li>
              <li>· They may send you a message requesting more information.</li>
              <li>· Once approved, your policy activates and you can file claims.</li>
            </ul>
          </div>
        )}
        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden border border-slate-100">
      <div className="flex items-center gap-6 mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">File a New Claim</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Submit medical bills for reimbursement or cashless approval</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Basic Info Section */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 relative" ref={icdRef}>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Diagnosis (ICD-10)</label>
              <input 
                required
                value={icdSearch}
                onFocus={() => handleIcdSearch(icdSearch)}
                onChange={(e) => handleIcdSearch(e.target.value)}
                placeholder="Search diagnosis e.g. Fever"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
              {showIcdDropdown && (
                 <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-60 overflow-y-auto overflow-x-hidden p-2">
                    {filteredIcd.length > 0 ? filteredIcd.map(i => (
                       <div 
                         key={i.code}
                         onClick={() => selectIcd(i)}
                         className="px-4 py-3 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors"
                       >
                          <p className="text-sm font-black text-slate-900">{i.code}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{i.description}</p>
                       </div>
                    )) : (
                      <div className="px-4 py-3 text-slate-400 text-xs font-bold">No matching medical codes.</div>
                    )}
                 </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date of Visit</label>
              <input 
                type="date"
                required
                value={dateOfVisit}
                onChange={(e) => setDateOfVisit(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Admission Date (Optional)</label>
                <input 
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full px-6 py-4 bg-white border-none rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Discharge Date (Optional)</label>
                <input 
                  type="date"
                  value={dischargeDate}
                  onChange={(e) => setDischargeDate(e.target.value)}
                  className="w-full px-6 py-4 bg-white border-none rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
             </div>
          </div>
        </div>

        {/* Role Specific Section */}
        {mode === 'MEMBER' ? (
          <div className="space-y-8">
            <div className="space-y-6 bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100/50">
               <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Filing For</h3>
                  <div className="flex gap-4">
                     <button 
                       type="button"
                       onClick={() => setIsDependent(false)}
                       className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isDependent ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-indigo-400'}`}
                     >Myself</button>
                     <button 
                       type="button"
                       onClick={() => setIsDependent(true)}
                       className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDependent ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-indigo-400'}`}
                     >Dependent</button>
                  </div>
               </div>

               {isDependent && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                     <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">Select Dependent</label>
                     <select 
                       required={isDependent}
                       value={dependentId}
                       onChange={(e) => setDependentId(e.target.value)}
                       className="w-full px-6 py-4 bg-white border-none rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                     >
                       <option value="">Choose partner/child...</option>
                       {dependents.filter((d: any) => d.status === 'ACTIVE').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                     </select>
                  </div>
               )}

               <div className="space-y-2 relative" ref={providerRef}>
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">Select Hospital / Provider</label>
                  <input 
                    required
                    value={providerId}
                    onFocus={() => handleProviderSearch(providerId)}
                    onChange={(e) => handleProviderSearch(e.target.value)}
                    placeholder="Type provider name or ID"
                    className="w-full px-6 py-4 bg-white border-none rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                  {showProviderDropdown && (
                     <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-60 overflow-y-auto overflow-x-hidden p-2">
                        {filteredProviders.length > 0 ? filteredProviders.map(p => (
                           <div 
                             key={p.id}
                             onClick={() => selectProvider(p)}
                             className="px-4 py-3 hover:bg-indigo-50 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                           >
                              <div>
                                 <p className="text-sm font-black text-slate-900">{p.name}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.city}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${p.network_status === 'IN_NETWORK' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                 {p.network_status.replace('_', ' ')}
                              </span>
                           </div>
                        )) : (
                          <div className="px-4 py-3 text-slate-400 text-xs font-bold">No in-network hospitals found.</div>
                        )}
                     </div>
                  )}
               </div>
            </div>

            <div className="space-y-6 bg-slate-50/50 p-8 rounded-3xl border border-slate-200">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Details for Reimbursement</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Account Number</label>
                     <input 
                        required={mode === 'MEMBER'}
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="Enter 12-16 digit A/C number"
                        className="w-full px-5 py-3 bg-white border-none rounded-xl text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">IFSC Code</label>
                     <input 
                        required={mode === 'MEMBER'}
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                        placeholder="SBIN0001234"
                        className="w-full px-5 py-3 bg-white border-none rounded-xl text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                     />
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 bg-slate-50 p-8 rounded-3xl border border-slate-100">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Member ID</label>
             <input 
               readOnly={!!initialMemberId}
               required
               value={memberId}
               onChange={(e) => setMemberId(e.target.value)}
               placeholder="Enter Member ID"
               className={`w-full px-6 py-4 bg-white border-none rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none ${initialMemberId ? 'opacity-50' : ''}`}
             />
          </div>
        )}

        {/* Line Items Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Treatment Line Items</h3>
            <button 
              type="button"
              onClick={addLineItem}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
            >+ Add Item</button>
          </div>

          <div className="space-y-4">
             {lineItems.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Service Date</label>
                         <input 
                           type="date"
                           required
                           value={item.service_date}
                           onChange={(e) => updateLineItem(idx, 'service_date', e.target.value)}
                           className="w-full px-4 py-3 bg-white border-none rounded-xl text-xs font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Service Type</label>
                         <select 
                           value={item.service_type}
                           onChange={(e) => updateLineItem(idx, 'service_type', e.target.value)}
                           className="w-full px-4 py-3 bg-white border-none rounded-xl text-xs font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                         >
                           {SERVICE_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2 relative">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Procedure Code (PCS)</label>
                         <input 
                           required
                           value={item._pcsSearchTerm}
                           onFocus={() => handlePcsSearch(item._pcsSearchTerm || '', idx)}
                           onChange={(e) => handlePcsSearch(e.target.value, idx)}
                           placeholder="Search code"
                           className="w-full px-4 py-3 bg-white border-none rounded-xl text-xs font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                         />
                         {pcsActiveIndex === idx && (
                            <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-40 overflow-y-auto p-2">
                               {filteredPcs.length > 0 ? filteredPcs.map(p => (
                                  <div 
                                    key={p.code}
                                    onClick={() => selectPcs(p, idx)}
                                    className="px-4 py-2 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors"
                                  >
                                     <p className="text-[11px] font-black text-slate-900">{p.code}</p>
                                     <p className="text-[9px] font-bold text-slate-400 truncate">{p.description}</p>
                                  </div>
                               )) : (
                                  <div className="px-4 py-2 text-slate-400 text-[10px] font-bold">No codes found.</div>
                               )}
                            </div>
                         )}
                      </div>
                      <div className="space-y-2 flex gap-4 items-center">
                         <div className="flex-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Amount (₹)</label>
                            <input 
                              type="number"
                              value={item.charged_amount}
                              onChange={(e) => updateLineItem(idx, 'charged_amount', parseFloat(e.target.value))}
                              className="w-full px-4 py-3 bg-white border-none rounded-xl text-xs font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                         </div>
                         {lineItems.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeLineItem(idx)}
                              className="mt-6 p-2 text-red-400 hover:text-red-600 transition-colors"
                            >
                               <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                         )}
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-4">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Supporting Documents</h3>
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="w-full p-8 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-200 transition-all cursor-pointer flex flex-col items-center gap-3"
           >
              <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <div className="text-center">
                 <p className="text-xs font-bold text-slate-600">Click to upload bill / investigation reports</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">PDF, PNG, JPG (Max 10MB)</p>
              </div>
              <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
           </div>
           {files.length > 0 && (
             <div className="flex flex-wrap gap-2 pt-2">
                {files.map((f, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg flex items-center gap-2">
                    {f.name}
                    <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>×</button>
                  </span>
                ))}
             </div>
           )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-bold uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-6 rounded-3xl text-lg font-black transition-all shadow-xl shadow-indigo-100 transform active:scale-[0.98] ${
            loading ? 'bg-indigo-400 cursor-not-allowed opacity-75' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {loading ? (uploading ? 'Uploading Documents...' : 'Submitting Claim...') : 'Submit Claim'}
        </button>

      </form>
    </div>
  );
};
