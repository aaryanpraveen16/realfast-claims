import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Dashboard = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchClaims = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/claims/me/provider', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClaims(response.data);
    } catch (err) {
      console.error('Failed to fetch provider claims', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const pendingClaims = claims.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW');
  const totalCharged = claims.reduce((sum, c) => sum + c.total_charged, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Provider Portal</h2>
          <p className="text-slate-500 font-medium mt-1">Manage cashless requests and verify member eligibility.</p>
        </div>
        <div className="hidden md:flex gap-3">
          <button 
            onClick={() => navigate('/provider/eligibility')}
            className="px-6 py-2.5 bg-white text-slate-900 text-xs font-black rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest active:scale-95"
          >
            Verify Eligibility
          </button>
          <button 
            onClick={() => navigate('/provider/submit-cashless')}
            className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-full shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest active:scale-95"
          >
            + New Cashless Claim
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden group text-white">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="h-24 w-24 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="relative z-10 space-y-6">
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">Queue Status</p>
              <h3 className="text-2xl font-black leading-tight tracking-tight">{pendingClaims.length} Pending Actions</h3>
            </div>
            <button 
              onClick={() => navigate('/provider/submit-cashless')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2"
            >
              Start New Submission
            </button>
          </div>
        </div>

        <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Submission Value</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-4xl font-black text-slate-900">₹{totalCharged.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-400 mt-4 leading-relaxed">Cumulative value of all cashless claims submitted through the portal.</p>
        </div>

        <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Quick Verification</p>
          <div className="mt-4 space-y-4">
             <p className="text-xs font-medium text-slate-400 leading-relaxed">Instantly verify member policy details and coverages.</p>
             <button 
               onClick={() => navigate('/provider/eligibility')}
               className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-100 transition-all hover:translate-y-[-2px]"
             >
               Verify Member ID
             </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
           <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Submissions</h3>
           {claims.length > 0 && (
             <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-wider">
               Showing Last {Math.min(claims.length, 5)}
             </span>
           )}
        </div>

        {claims.length === 0 ? (
          <div className="p-12 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">No submissions yet</p>
              <p className="text-sm text-slate-500">Submit your first cashless claim to see it here.</p>
            </div>
            <button 
              onClick={() => navigate('/provider/submit-cashless')}
              className="px-8 py-3 bg-indigo-600 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest"
            >
              Start First Submission
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {claims.slice(0, 5).map((claim) => (
              <div 
                key={claim.id}
                onClick={() => navigate(`/provider/claims/${claim.id}`)}
                className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                    claim.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                    claim.status === 'REJECTED' ? 'bg-red-50 text-red-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {claim.status === 'APPROVED' ? '✓' : claim.status === 'REJECTED' ? '✕' : '•'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Claim #{claim.id.substring(0, 8).toUpperCase()}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Submitted {new Date(claim.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">₹{claim.total_charged.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Charged Amount</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                    claim.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                    claim.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                    'bg-blue-100 text-blue-700 border-blue-200'
                  }`}>
                    {claim.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const EligibilityCheck = () => <div>TODO: EligibilityCheck</div>;
export const SubmitCashlessClaim = () => <div>TODO: SubmitCashlessClaim</div>;
