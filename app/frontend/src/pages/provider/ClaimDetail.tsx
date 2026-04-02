import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/claims/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setClaim(res.data);
      } catch (err) {
        console.error('Failed to fetch claim detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaim();
  }, [id]);

  if (loading) return <div className="p-20 text-center animate-pulse">Syncing Hospital Records...</div>;
  if (!claim) return <div className="p-20 text-center">Claim Not Found</div>;

  return (
     <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="h-10 w-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all active:scale-95">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
           </button>
           <h1 className="text-2xl font-black text-slate-900 tracking-tight">Provider Portal <span className="text-slate-400 font-bold ml-2">Claim #{claim.id.slice(0, 8)}</span></h1>
        </div>

        {/* Global Summary Card */}
        <div className="bg-white rounded-[3rem] shadow-xl p-12 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-12 overflow-hidden relative">
           <div className="absolute top-0 right-0 p-12 text-[12rem] font-black text-slate-50 translate-x-1/4 -translate-y-1/4 select-none uppercase tracking-tighter">{claim.status.slice(0,4)}</div>
           
           <div className="relative z-10 flex flex-col gap-6 w-full md:w-auto">
              <div>
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-indigo-50 text-indigo-600 border-indigo-100`}>
                    {claim.status.replace('_', ' ')}
                 </span>
                 <h2 className="text-4xl font-black text-slate-900 mt-4 tracking-tight">{claim.member_name}</h2>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Patient Profile</p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA Deadline</label>
                    <p className="font-bold text-slate-900">{new Date(claim.sla_deadline).toLocaleDateString()}</p>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnosis</label>
                    <p className="font-bold text-slate-900">{claim.diagnosis_code}</p>
                 </div>
              </div>
           </div>

           <div className="relative z-10 text-center md:text-right space-y-6 w-full md:w-auto">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Payable (Tentative)</label>
                 <div className="text-5xl font-black text-slate-900 tracking-tighter">₹{claim.total_charged.toLocaleString()}</div>
                 <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Processing Batch #4092</p>
              </div>
           </div>
        </div>

        {/* Treatment Details */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
           <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Level Breakdown</h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-10 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Service</th>
                       <th className="px-10 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Procedure</th>
                       <th className="px-10 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Billed Amount</th>
                       <th className="px-10 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {claim.line_items.map((li: any) => (
                       <tr key={li.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-6 text-sm font-black text-slate-900 uppercase tracking-tight">{li.service_type}</td>
                          <td className="px-10 py-6 text-sm font-bold text-slate-500 font-mono">{li.procedure_code}</td>
                          <td className="px-10 py-6 text-sm font-black text-slate-900">₹{li.charged_amount.toLocaleString()}</td>
                          <td className="px-10 py-6">
                             <span className="px-3 py-1 bg-slate-100 text-[8px] font-black text-slate-500 rounded-full uppercase tracking-widest">
                                {li.status}
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        <div className="p-8 bg-indigo-900 rounded-[2.5rem] text-white flex justify-between items-center overflow-hidden relative group">
           <div className="absolute top-0 right-0 h-full w-1/2 bg-white/5 skew-x-12 translate-x-1/2"></div>
           <div className="relative z-10">
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Payment Instructions</p>
              <p className="text-xl font-bold max-w-md">Payments for APPROVED claims are batched every Monday. Ensure NEFT details are current in Provider Settings.</p>
           </div>
           <button className="relative z-10 px-8 py-4 bg-white text-indigo-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">Support Desk</button>
        </div>

      </div>
    </div>
  );
};
