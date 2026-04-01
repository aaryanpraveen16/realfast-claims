import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const EligibilityCheck = () => {
  const [memberId, setMemberId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/providers/eligibility/${memberId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Member not found or check failed.');
    } finally {
      setLoading(false);
    }
  };

  const proceedToClaim = () => {
    navigate(`/provider/submit-cashless?memberId=${memberId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Search Section */}
        <div className="bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-100">
           <div className="flex flex-col items-center text-center space-y-8">
              <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                 <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <div className="space-y-3">
                 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Check Member Eligibility</h1>
                 <p className="text-slate-400 font-bold max-w-sm">Enter the Member ID to verify policy coverage and limits in real-time.</p>
              </div>
              <form onSubmit={handleCheck} className="w-full flex gap-4 max-w-lg">
                 <input 
                   required
                   value={memberId}
                   onChange={(e) => setMemberId(e.target.value)}
                   placeholder="MEMBER-UUID-HERE"
                   className="flex-1 px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-400 focus:bg-white rounded-2xl text-slate-900 font-bold outline-none transition-all"
                 />
                 <button 
                  type="submit" 
                  disabled={loading}
                  className="px-10 py-5 bg-indigo-600 hover:bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95"
                 >
                   {loading ? 'Searching...' : 'Check'}
                 </button>
              </form>
           </div>
        </div>

        {/* Results Section */}
        {error && (
           <div className="p-10 bg-red-50 border-2 border-dashed border-red-100 rounded-[2.5rem] text-center animate-in fade-in slide-in-from-top-4">
              <p className="text-red-700 font-black uppercase tracking-widest text-[10px]">{error}</p>
           </div>
        )}

        {result && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Eligibility Banner */}
              <div className={`p-8 rounded-[2.5rem] flex items-center justify-between border-2 ${
                result.is_eligible 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                 <div className="flex items-center gap-6">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${result.is_eligible ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                       <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         {result.is_eligible 
                           ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                           : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
                       </svg>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
                       <h2 className="text-2xl font-black">{result.is_eligible ? 'Member is Eligible' : 'Eligibility Denied'}</h2>
                       {result.reason && <p className="text-sm font-bold opacity-75">{result.reason}</p>}
                    </div>
                 </div>
                 {result.is_eligible && (
                    <button 
                      onClick={proceedToClaim}
                      className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                    >
                      Proceed to Cashless Claim
                    </button>
                 )}
              </div>

              {/* Health Passport Details */}
              {result.is_eligible && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Policy Overview</h3>
                       <div className="space-y-6">
                          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                             <span className="text-[11px] font-black uppercase text-slate-400">Policy Name</span>
                             <span className="font-bold text-slate-900">{result.policy_name}</span>
                          </div>
                          <div className="space-y-4">
                             <div className="flex justify-between text-[11px] font-black uppercase text-slate-400 px-1">
                                <span>Annual Limit Progress</span>
                                <span>₹{result.annual_used} / ₹{result.annual_limit}</span>
                             </div>
                             <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${(result.annual_used / result.annual_limit) * 100}%` }}></div>
                             </div>
                          </div>
                          <div className="space-y-4">
                             <div className="flex justify-between text-[11px] font-black uppercase text-slate-400 px-1">
                                <span>Deductible Met</span>
                                <span>₹{result.deductible_met} / ₹{result.deductible}</span>
                             </div>
                             <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${(result.deductible_met / result.deductible) * 100}%` }}></div>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-xl space-y-8">
                       <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Covered Services</h3>
                       <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                          {result.covered_services.map((s: any, i: number) => (
                             <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                                <span className="text-xs font-bold text-white uppercase tracking-tight">{s.service_type.replace('_', ' ')}</span>
                                <div className="flex items-center gap-3">
                                   <span className="text-[9px] font-black text-indigo-400 uppercase">Limit: ₹{s.limit_per_year}</span>
                                   {s.requires_preauth && <span className="px-2 py-1 bg-amber-900/40 text-amber-500 text-[8px] font-black rounded uppercase border border-amber-900/50">Pre-Auth</span>}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              )}
           </div>
        )}

      </div>
    </div>
  );
};
