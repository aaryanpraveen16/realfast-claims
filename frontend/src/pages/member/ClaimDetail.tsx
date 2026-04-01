import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export const ClaimDetail = () => {
  const { id } = useParams();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/claims/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setClaim(res.data);
      } catch (err: any) {
        setError('Failed to fetch claim details.');
      } finally {
        setLoading(false);
      }
    };
    fetchClaim();
  }, [id]);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-300 tracking-[0.3em] uppercase text-xs">Accessing Adjudication Data...</div>;
  if (error || !claim) return <div className="p-20 text-center text-red-500 font-bold uppercase tracking-widest">{error || 'Claim Not Found'}</div>;

  const isWithinSLA = new Date() < new Date(claim.sla_deadline);
  const slaColor = isWithinSLA ? 'text-indigo-600' : 'text-red-500';

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-4">
           <Link to="/member/claims" className="h-10 w-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all active:scale-95">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
           </Link>
           <h1 className="text-2xl font-black text-slate-900 tracking-tight">Claim Details <span className="text-slate-400 font-bold ml-2">#{claim.id.slice(0, 8)}</span></h1>
        </div>

        {/* Global Summary Card */}
        <div className="bg-white rounded-[3rem] shadow-xl p-12 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-12 overflow-hidden relative">
           <div className="absolute top-0 right-0 p-12 text-[12rem] font-black text-slate-50 translate-x-1/4 -translate-y-1/4 select-none uppercase">{claim.status.split('_')[0]}</div>
           
           <div className="relative z-10 flex flex-col gap-6 w-full md:w-auto">
              <div>
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-indigo-50 text-indigo-600 border-indigo-100`}>
                    {claim.status.replace('_', ' ')}
                 </span>
                 <h2 className="text-4xl font-black text-slate-900 mt-4 tracking-tight">{claim.provider_name}</h2>
              </div>
              <div className="grid grid-cols-2 gap-8">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted Date</label>
                    <p className="font-bold text-slate-900">{new Date(claim.date_of_visit).toLocaleDateString()}</p>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnosis Code</label>
                    <p className="font-bold text-slate-900">{claim.diagnosis_code || 'N/A'}</p>
                 </div>
              </div>
           </div>

           <div className="relative z-10 text-center md:text-right space-y-6 w-full md:w-auto">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current SLA Deadline</label>
                 <p className={`text-xl font-black ${slaColor}`}>
                    {new Date(claim.sla_deadline).toLocaleString()}
                 </p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Processing in Progress</p>
              </div>
              <div className="h-px w-full bg-slate-100"></div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount Requested</label>
                 <div className="text-5xl font-black text-slate-900 tracking-tighter">₹{claim.total_charged.toLocaleString()}</div>
              </div>
           </div>
        </div>

        {/* Line Items Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
           <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Treatment Breakdown</h3>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{claim.line_items.length} Items</p>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-10 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Service Type</th>
                       <th className="px-10 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                       <th className="px-10 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Requested</th>
                       <th className="px-10 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {claim.line_items.map((li: any) => (
                       <tr key={li.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-6">
                             <div className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{li.service_type.replace('_', ' ')}</div>
                          </td>
                          <td className="px-10 py-6 text-sm font-bold text-slate-500">{li.procedure_code}</td>
                          <td className="px-10 py-6 text-sm font-black text-slate-900">₹{li.charged_amount.toLocaleString()}</td>
                          <td className="px-10 py-6">
                             <span className="px-3 py-1 bg-slate-100 text-[8px] font-black text-slate-500 rounded-full uppercase tracking-widest border border-slate-200">
                                {li.status}
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Global Action Footer */}
        <div className="flex flex-col md:flex-row gap-6">
           <button 
             disabled 
             className="flex-1 py-6 bg-slate-100 text-slate-400 rounded-3xl text-[11px] font-black uppercase tracking-widest cursor-not-allowed border-2 border-dashed border-slate-200"
            >
              Export EOB (Available at Terminal Status)
           </button>
           <button 
             disabled 
             className="flex-1 py-6 bg-slate-100 text-slate-400 rounded-3xl text-[11px] font-black uppercase tracking-widest cursor-not-allowed border-2 border-dashed border-slate-200"
            >
              Submit Dispute
           </button>
        </div>

      </div>
    </div>
  );
};
