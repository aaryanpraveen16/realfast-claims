import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export const MemberRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    aadhaar_hash: '',
    role: 'MEMBER'
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
      navigate('/login', { state: { message: 'Welcome to RealFast! Registration successful.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1576091160550-217359f42af4?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-fixed">
      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl border border-blue-100">
        <div>
          <div className="mx-auto h-12 w-12 rounded-lg bg-primary-600 flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-center text-3xl font-bold text-gray-900 tracking-tight">
            Member Enrollment
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Secure health insurance claims at your fingertips.
          </p>
        </div>
        
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 animate-shake">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="group">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1 group-focus-within:text-primary-600 transition-colors">Full Name</label>
              <input
                name="name"
                type="text"
                required
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all outline-none"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1 group-focus-within:text-primary-600 transition-colors">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all outline-none"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1 group-focus-within:text-primary-600 transition-colors">Password</label>
              <input
                name="password"
                type="password"
                required
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all outline-none"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1 group-focus-within:text-primary-600 transition-colors">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all outline-none"
                  placeholder="+91..."
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="group">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1 group-focus-within:text-primary-600 transition-colors">DOB</label>
                <input
                  name="dob"
                  type="date"
                  required
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all outline-none"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-1 group-focus-within:text-primary-600 transition-colors">Aadhaar (Last 4 digits)</label>
              <input
                name="aadhaar_hash"
                type="text"
                required
                maxLength={4}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all outline-none"
                placeholder="1234"
                value={formData.aadhaar_hash}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-primary-600 hover:bg-primary-700 hover:shadow-primary-500/20 active:transform active:scale-95 focus:outline-none transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : 'Complete Enrollment'}
            </button>
          </div>
        </form>
        
        <div className="text-center pt-2">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
