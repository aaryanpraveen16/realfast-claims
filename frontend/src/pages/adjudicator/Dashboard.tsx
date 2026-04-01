import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Dashboard = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/adjudication/queue', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueue(response.data);
    } catch (err) {
      console.error('Failed to fetch adjudication queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const nearBreachCount = queue.filter(c => {
    const deadline = new Date(c.sla_deadline).getTime();
    const now = new Date().getTime();
    return (deadline - now) < (24 * 60 * 60 * 1000); // Less than 24h
  }).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Adjudicator Command</h2>
          <p className="text-slate-500 font-medium mt-1">Review pending claims and manage SLA priorities.</p>
        </div>
        <div className="hidden md:block">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-black border tracking-widest bg-slate-900 text-white border-slate-900">
            <span className="h-2 w-2 rounded-full mr-2 bg-green-400 animate-pulse"></span>
            SYSTEM ONLINE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden group text-white">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="h-24 w-24 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="relative z-10 space-y-2">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">Queue Size</p>
            <h3 className="text-4xl font-black tracking-tight">{queue.length}</h3>
            <p className="text-xs text-slate-400 font-medium">Claims awaiting manual review</p>
          </div>
        </div>

        <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] mb-1">SLA Critical</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-4xl font-black text-slate-900">{nearBreachCount}</p>
              <p className="text-sm font-bold text-slate-400">Claims approaching breach</p>
            </div>
          </div>
          <div className="mt-6 w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min(100, (nearBreachCount / (queue.length || 1)) * 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">System Load</p>
          <div className="mt-4 space-y-4">
             <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Auto-Pass Rate</span>
                <span className="text-sm font-black text-green-600 leading-none">84%</span>
             </div>
             <p className="text-xs font-medium text-slate-400 leading-relaxed">Automation engine is processing most claims without intervention.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Queue</h3>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-wider">Priority: SLA Deadline</span>
          </div>
        </div>

        {queue.length === 0 ? (
          <div className="p-12 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-green-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">Queue is clear</p>
              <p className="text-sm text-slate-500">All claims have been adjudicated. Great work!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {queue.map((claim) => {
               const deadline = new Date(claim.sla_deadline);
               const isUrgent = (deadline.getTime() - new Date().getTime()) < (24 * 60 * 60 * 1000);

               return (
                <div 
                  key={claim.id}
                  onClick={() => navigate(`/adjudicator/claims/${claim.id}`)}
                  className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                      isUrgent ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {claim.claim_type === 'CASHLESS' ? '⚡' : '💰'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{claim.member_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {claim.provider_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-12 w-full md:w-auto">
                    <div className="text-right">
                       <p className="text-sm font-black text-slate-900">₹{claim.total_charged.toLocaleString()}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Amount</p>
                    </div>
                    <div className="text-right">
                       <p className={`text-sm font-black ${isUrgent ? 'text-amber-600' : 'text-slate-900'}`}>
                          {deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                       </p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SLA Deadline</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                      isUrgent ? 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                </div>
               );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const ClaimsQueue = () => <div>TODO: ClaimsQueue</div>;
export const ClaimReview = () => <div>TODO: ClaimReview</div>;
export const DisputeResolution = () => <div>TODO: DisputeResolution</div>;
