import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export const ClaimsList = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/claims/me/member', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setClaims(res.data);
      } catch (err: any) {
        setError('Failed to fetch claims.');
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'UNDER_REVIEW': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'APPROVED': return 'bg-green-50 text-green-600 border-green-100';
      case 'DENIED': return 'bg-red-50 text-red-600 border-red-100';
      case 'PAID': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-300">Syncing with Claims Engine...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        
        <div className="flex items-center justify-between">
           <div className="space-y-1">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Claims</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Live tracking & Adjudication Status</p>
           </div>
           <Link 
            to="/member/submit-claim"
            className="px-8 py-4 bg-indigo-600 hover:bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all text-sm"
           >
             + New Claim
           </Link>
        </div>

        {error && <div className="p-6 bg-red-50 text-red-600 rounded-3xl font-bold border border-red-100 text-center">{error}</div>}

        {claims.length === 0 ? (
           <div className="bg-white p-20 rounded-[3rem] shadow-sm border border-slate-100 text-center space-y-6">
              <div className="h-24 w-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto border border-slate-100">
                 <svg className="h-10 w-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No active claims found</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 gap-4">
              {claims.map(claim => (
                 <div key={claim.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group overflow-hidden relative">
                    {/* Background ID Accent */}
                    <span className="absolute top-0 right-0 p-4 text-[4rem] font-black text-slate-50 translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform select-none">#{claim.id.slice(0,4)}</span>
                    
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                       <div className="flex items-center gap-6">
                          <div className={`h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100`}>
                             <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={claim.claim_type === 'CASHLESS' ? "M13 10V3L4 14h7v7l9-11h-7z" : "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} /></svg>
                          </div>
                          <div>
                             <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(claim.status)}`}>
                                  {claim.status.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{claim.claim_type}</span>
                             </div>
                             <h3 className="text-xl font-black text-slate-900 mt-1">{claim.provider_name}</h3>
                             <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Submitted: {new Date(claim.submitted_at).toLocaleDateString()}</p>
                          </div>
                       </div>

                       <div className="flex items-end flex-col gap-4 text-right">
                          <div className="space-y-1">
                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Charged</div>
                             <div className="text-2xl font-black text-slate-900">₹{claim.total_charged.toLocaleString()}</div>
                          </div>
                          <Link 
                            to={`/member/claims/${claim.id}`}
                            className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-100 hover:bg-indigo-600 transition-colors"
                          >
                            View Breakdown
                          </Link>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        )}

      </div>
    </div>
  );
};
