import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const ClaimReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/adjudication/claims/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setClaim(res.data);
    } catch (err) {
      console.error('Failed to fetch claim detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleDecision = async (lineItemId: string, decision: any) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/adjudication/line-items/${lineItemId}/decide`, decision, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Refresh
      await fetchDetail();
    } catch (err) {
      console.error('Decision failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Analyzing Claim Vector...</div>;
  if (!claim) return <div className="p-20 text-center">Claim not found</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Manual Adjudication</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Reviewing Claim #{claim.id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Claim & Member Info */}
        <div className="lg:col-span-2 space-y-10">
           <div className="bg-white rounded-[3rem] shadow-xl p-10 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 text-9xl font-black text-slate-50 rotate-12 select-none">{claim.claim_type}</div>
              <div className="relative z-10 space-y-8">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Medical Diagnosis</p>
                       <p className="text-2xl font-black text-slate-900 leading-tight">{claim.diagnosis_code}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA Deadline</p>
                       <p className="font-bold text-slate-900">{new Date(claim.sla_deadline).toLocaleString()}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-10 py-8 border-y border-slate-50">
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Member</p>
                       <p className="font-bold text-slate-900">{claim.member.name}</p>
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Provider</p>
                       <p className="font-bold text-slate-900">{claim.provider.name}</p>
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PED Flag</p>
                       <p className={`font-black ${claim.ped_flag ? 'text-red-500' : 'text-green-500'}`}>{claim.ped_flag ? 'YES' : 'NO'}</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight px-2">Line Item Breakdown</h3>
              <div className="space-y-4">
                 {claim.line_items.map((item: any) => (
                    <div key={item.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center justify-between group hover:border-indigo-100 transition-all">
                       <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-4">
                             <span className="px-3 py-1 bg-slate-50 text-[9px] font-black text-slate-400 rounded-full border border-slate-100 uppercase tracking-widest">{item.service_type}</span>
                             <span className="text-xs font-bold text-slate-500">{item.procedure_code}</span>
                          </div>
                          <p className="text-sm font-black text-slate-900 transition-colors uppercase tracking-tight">{item.procedure_code}</p>
                          <p className="text-xs font-bold text-red-400">{item.denial_reason_en}</p>
                       </div>

                       <div className="flex items-center gap-12">
                          <div className="text-right">
                             <p className="text-lg font-black text-slate-900">₹{item.charged_amount.toLocaleString()}</p>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Charged</p>
                          </div>
                          
                          {item.status === 'NEEDS_REVIEW' || item.status === 'PENDING' ? (
                             <div className="flex gap-2">
                                <button 
                                  onClick={() => handleDecision(item.id, { is_covered: true, approved_amount: item.charged_amount, member_owes: 0 })}
                                  className="px-6 py-3 bg-green-600 text-white text-[10px] font-black uppercase rounded-2xl shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
                                >Approve</button>
                                <button 
                                  onClick={() => handleDecision(item.id, { is_covered: false, approved_amount: 0, member_owes: item.charged_amount, denial_reason_en: 'Manually rejected by adjudicator.' })}
                                  className="px-6 py-3 bg-white text-red-600 border border-red-100 text-[10px] font-black uppercase rounded-2xl hover:bg-red-50 transition-all"
                                >Reject</button>
                             </div>
                          ) : (
                             <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                               item.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                             }`}>
                                {item.status}
                             </span>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: Policy Summary & Actions */}
        <div className="space-y-10">
           <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 p-10 text-9xl font-black text-white/5 group-hover:text-white/10 transition-all select-none">RULES</div>
              <h3 className="text-xl font-black tracking-tight mb-8">Policy Context</h3>
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Plan Name</p>
                    <p className="text-lg font-black">{claim.member.policy.name}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Copay %</p>
                       <p className="text-xl font-black">{claim.member.policy.copay_pct}%</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">PED Waiting</p>
                       <p className="text-xl font-black">{claim.member.policy.ped_waiting_days}d</p>
                    </div>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Remaining Limit</p>
                    <p className="text-2xl font-black text-green-400">₹{(claim.member.policy.annual_limit - claim.member.limit_used).toLocaleString()}</p>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Document Vault</h4>
              <div className="grid grid-cols-2 gap-4">
                 <div className="aspect-square bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-indigo-50 transition-all group">
                    <svg className="h-6 w-6 text-slate-300 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID Card</span>
                 </div>
                 <div className="aspect-square bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-all">
                    <svg className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Invoice</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
