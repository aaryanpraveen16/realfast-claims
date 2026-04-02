import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const MEDICAL_CONDITIONS = [
  'Diabetes', 
  'Hypertension', 
  'Asthma', 
  'Heart Disease', 
  'Thyroid', 
  'None of the above'
];

export const MemberRegister = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    aadhaar_hash: '',
    medicalConditions: [] as string[],
    otherConditions: '',
    role: 'MEMBER'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.dob || !formData.aadhaar_hash) {
        setError('Please fill in all identity details.');
        return;
      }
      if (formData.aadhaar_hash.length !== 4) {
        setError('Aadhaar must be last 4 digits.');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('phone', formData.phone);
      data.append('dob', formData.dob);
      data.append('aadhaar_hash', formData.aadhaar_hash);
      data.append('role', 'MEMBER');

      const medicalStr = formData.medicalConditions.filter(c => c !== 'None of the above').join(', ') + 
                        (formData.otherConditions ? `, ${formData.otherConditions}` : '');
      if (medicalStr) {
        data.append('medical_conditions', medicalStr);
      }

      if (selectedFile) {
        data.append('file', selectedFile);
      }

      await axios.post('/api/auth/register', data);
      
      navigate('/login', { state: { message: 'Welcome to RealFast! Enrollment successful.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1576091160550-217359f42af4?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-fixed">
      <div className="max-w-xl w-full space-y-8 bg-white/95 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl border border-blue-50/50">
        
        {/* Progress Header */}
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Member Enrollment</h2>
              <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mt-1">
                {step === 1 ? 'Step 1: Identity & Account' : 'Step 2: Medical Declaration'}
              </p>
            </div>
            <div className="flex gap-2">
              <div className={`h-2 w-12 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary-600' : 'bg-slate-200'}`} />
              <div className={`h-2 w-12 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary-600' : 'bg-slate-200'}`} />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm font-bold rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Legal Name</label>
                  <input name="name" type="text" required value={formData.name} onChange={handleChange}
                    className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-600 focus:bg-white transition-all outline-none font-medium"
                    placeholder="John Doe" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                    <input name="email" type="email" required value={formData.email} onChange={handleChange}
                      className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-600 focus:bg-white transition-all outline-none font-medium text-sm"
                      placeholder="john@example.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Create Password</label>
                    <input name="password" type="password" required value={formData.password} onChange={handleChange}
                      className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-600 focus:bg-white transition-all outline-none font-medium text-sm"
                      placeholder="••••••••" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                    <input name="phone" type="tel" required value={formData.phone} onChange={handleChange}
                      className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-600 focus:bg-white transition-all outline-none font-medium"
                      placeholder="+91..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date of Birth</label>
                    <input name="dob" type="date" required value={formData.dob} onChange={handleChange}
                      className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-600 focus:bg-white transition-all outline-none font-medium text-sm" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Aadhaar (Last 4 Digits)</label>
                  <input name="aadhaar_hash" type="text" required maxLength={4} value={formData.aadhaar_hash} onChange={(e) => setFormData({...formData, aadhaar_hash: e.target.value.replace(/\D/g, '')})}
                    className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-600 focus:bg-white transition-all outline-none font-black text-xl tracking-[0.5em]"
                    placeholder="0000" />
                </div>
              </div>

              <button type="button" onClick={nextStep}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transform active:scale-[0.98] transition-all shadow-xl shadow-slate-200">
                Continue to Medical Info
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Select any pre-existing conditions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {MEDICAL_CONDITIONS.map(condition => (
                    <button key={condition} type="button" onClick={() => toggleCondition(condition)}
                      className={`px-4 py-4 rounded-2xl border text-left text-xs font-black transition-all ${
                        formData.medicalConditions.includes(condition) 
                          ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-100' 
                          : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-primary-300'
                      }`}>
                      {condition}
                    </button>
                  ))}
                </div>
                <textarea name="otherConditions" placeholder="Any other medical history or remarks..." value={formData.otherConditions} onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-600 focus:bg-white transition-all outline-none font-medium text-sm min-h-[100px]" />
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Supporting Health Reports (Optional)</h3>
                <div className="relative group/file">
                  <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="opacity-0 absolute inset-0 cursor-pointer z-10" />
                  <div className={`w-full p-8 border-2 border-dashed rounded-[2rem] transition-all flex flex-col items-center justify-center gap-2 ${
                    selectedFile ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100 group-hover/file:border-primary-300'
                  }`}>
                    <svg className={`h-10 w-10 ${selectedFile ? 'text-green-500' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p className={`text-xs font-black ${selectedFile ? 'text-green-700' : 'text-slate-500'}`}>
                      {selectedFile ? selectedFile.name : 'Drag or click to upload PDF/JPG'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setStep(1)}
                  className="py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all">
                  Back
                </button>
                <button type="button" onClick={handleSubmit} disabled={loading}
                  className={`py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary-100 ${
                    loading ? 'bg-primary-300 cursor-not-allowed text-primary-100' : 'bg-primary-600 hover:bg-primary-700 text-white transform active:scale-[0.98]'
                  }`}>
                  {loading ? 'Processing...' : 'Complete Enrollment'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-400 font-medium">
            Already enrolled?{' '}
            <Link to="/login" className="font-black text-primary-600 hover:text-primary-700 underline underline-offset-8 decoration-2 decoration-primary-100 hover:decoration-primary-300 transition-all">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
