import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export const ProviderRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    license_no: '',
    specialty: '',
    city: '',
    state: '',
    role: 'PROVIDER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/register', {
        ...formData,
        password_hash: formData.password,
      });
      navigate('/login', { state: { message: 'Provider registration submitted. Welcome to the network!' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-fixed">
      <div className="max-w-2xl w-full space-y-8 bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-slate-200">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-10h1m-1 4h1m-1 4h1" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Provider Network Registration
          </h2>
          <p className="mt-3 text-slate-500 font-medium text-center max-w-sm">
            Join the RealFast network to streamline your cashless claim processing and eligibility verification.
          </p>
        </div>
        
        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 flex items-center gap-3">
              <svg className="h-5 w-5 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1 group-focus-within:text-indigo-600 transition-colors">Facility/Provider Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all outline-none"
                  placeholder="Apollo Hospitals"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1 group-focus-within:text-indigo-600 transition-colors">Official Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all outline-none"
                  placeholder="admin@healthcare.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1 group-focus-within:text-indigo-600 transition-colors">Access Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1 group-focus-within:text-indigo-600 transition-colors">Contact Number</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all outline-none"
                  placeholder="+91..."
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1 group-focus-within:text-indigo-600 transition-colors">Medical License No.</label>
                <input
                  name="license_no"
                  type="text"
                  required
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all outline-none"
                  placeholder="MED-123456"
                  value={formData.license_no}
                  onChange={handleChange}
                />
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1 group-focus-within:text-indigo-600 transition-colors">Specialization</label>
                <input
                  name="specialty"
                  type="text"
                  required
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all outline-none"
                  placeholder="General Medicine / Surgery"
                  value={formData.specialty}
                  onChange={handleChange}
                />
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1 group-focus-within:text-indigo-600 transition-colors">City</label>
                <input
                  name="city"
                  type="text"
                  required
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all outline-none"
                  placeholder="Mumbai"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1 group-focus-within:text-indigo-600 transition-colors">State</label>
                <input
                  name="state"
                  type="text"
                  required
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all outline-none"
                  placeholder="Maharashtra"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full relative flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-indigo-100 text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] focus:outline-none transition-all disabled:opacity-50 overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting Application...
                </div>
              ) : 'Join Provider Network'}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <p className="text-slate-500 font-medium">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold underline underline-offset-4 decoration-2">
              Sign in to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
