import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { DisputeModal } from '../../components/DisputeModal';

export const ClaimDetail = () => {
  const { id } = useParams();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
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

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
           <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Treatment Breakdown</h3>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{claim.line_items.length} Items</p>
           </div>
           <div className="divide-y divide-slate-50">
              {claim.line_items.map((li: any) => {
                const statusStyles: Record<string, string> = {
                  APPROVED:      'bg-green-50 text-green-700 border-green-100',
                  DENIED:        'bg-red-50 text-red-700 border-red-100',
                  PARTIAL:       'bg-amber-50 text-amber-700 border-amber-100',
                  NEEDS_REVIEW:  'bg-indigo-50 text-indigo-700 border-indigo-100',
                };
                const statusLabel: Record<string, string> = {
                  APPROVED:     'Approved',
                  DENIED:       'Denied',
                  PARTIAL:      'Partially Approved',
                  NEEDS_REVIEW: 'Under Review',
                };
                const style = statusStyles[li.status] ?? 'bg-slate-100 text-slate-500 border-slate-200';
                const label = statusLabel[li.status] ?? li.status;
                const hasReason = li.denial_reason_en && li.denial_reason_en.trim() !== '';

                return (
                  <div key={li.id} className="px-10 py-8 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                          {li.service_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">{li.procedure_code}</p>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-xs font-bold text-slate-400">Requested</p>
                        <p className="text-lg font-black text-slate-900">₹{li.charged_amount.toLocaleString()}</p>
                      </div>
                      {li.approved_amount != null && (
                        <div className="text-right shrink-0 space-y-1">
                          <p className="text-xs font-bold text-slate-400">Approved</p>
                          <p className={`text-lg font-black ${li.approved_amount === 0 ? 'text-red-500' : 'text-green-600'}`}>
                            ₹{li.approved_amount.toLocaleString()}
                          </p>
                        </div>
                      )}
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0 ${style}`}>
                        {label}
                      </span>
                    </div>
                    {hasReason ? (
                      <div className={`flex items-start gap-3 px-5 py-4 rounded-2xl border text-sm ${
                        li.status === 'DENIED'       ? 'bg-red-50 border-red-100 text-red-700' :
                        li.status === 'NEEDS_REVIEW' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                                                       'bg-amber-50 border-amber-100 text-amber-700'
                      }`}>
                        <p className="font-medium leading-relaxed">{li.denial_reason_en}</p>
                      </div>
                    ) : null}

                    {li.adjudication?.dispute?.resolution_note && (
                      <div className="flex items-start gap-3 px-5 py-4 rounded-2xl border bg-green-50 border-green-100 text-green-700 text-sm mt-3 animate-in slide-in-from-top-2 duration-500">
                        <svg className="h-5 w-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-black uppercase text-[10px] tracking-widest mb-1 text-green-800">Adjudicator Resolution</p>
                          <p className="font-medium leading-relaxed">{li.adjudication.dispute.resolution_note}</p>
                        </div>
                      </div>
                    )}

                    {(!hasReason && li.status !== 'APPROVED') && (
                      (() => {
                        const hints: Record<string, { color: string; title: string; bullets: string[] }> = {
                          PENDING: {
                            color: 'bg-slate-50 border-slate-100 text-slate-500',
                            title: 'Awaiting adjudication',
                            bullets: [
                              'Your claim is queued for review.',
                              'The rules engine will evaluate coverage, policy limits, and PED status.',
                              'This typically completes within minutes.',
                            ]
                          },
                          DENIED: {
                            color: 'bg-red-50 border-red-100 text-red-700',
                            title: 'Common reasons for denial',
                            bullets: [
                              'The service type is not covered under your policy.',
                              'A Pre-Existing Disease (PED) waiting period has not been completed.',
                              'Your annual policy limit was exhausted before this item was processed.',
                            ]
                          },
                          NEEDS_REVIEW: {
                            color: 'bg-indigo-50 border-indigo-100 text-indigo-700',
                            title: 'Manual review required',
                            bullets: [
                              'This item is high-value and requires pre-authorization verification.',
                              'An adjudicator will review the clinical documentation.',
                              'No action is required from you at this time.',
                            ]
                          },
                          PARTIAL: {
                            color: 'bg-amber-50 border-amber-100 text-amber-700',
                            title: 'Why only part was approved',
                            bullets: [
                              'Your copay or coinsurance rate reduced the approved amount.',
                              'The per-service annual sublimit was reached.',
                              'Out-of-network penalty may have applied.',
                            ]
                          },
                          DISPUTED: {
                            color: 'bg-red-50 border-red-200 text-red-700',
                            title: 'Dispute Filed',
                            bullets: [
                              'You have formally challenged the decision for this item.',
                              'A medical adjudicator is re-evaluating the documentation.',
                              'Resolution typically takes 3-5 business days.',
                            ]
                          },
                        };
                        const hint = hints[li.status];
                        if (!hint) return null;
                        return (
                          <div className={`px-5 py-4 rounded-2xl border text-sm ${hint.color}`}>
                            <p className="font-black text-[10px] uppercase tracking-widest mb-2">{hint.title}</p>
                            <ul className="space-y-1">
                              {hint.bullets.map((b, i) => (
                                <li key={i} className="flex items-start gap-2 font-medium leading-relaxed">
                                  <span className="mt-1 shrink-0">·</span>
                                  {b}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()
                    )}
                  </div>
                );
              })}
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
             onClick={() => setIsDisputeModalOpen(true)}
             disabled={!['APPROVED', 'PARTIAL', 'DENIED'].includes(claim.status)}
             className={`flex-1 py-6 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all border-2 border-dashed ${
               ['APPROVED', 'PARTIAL', 'DENIED'].includes(claim.status)
                 ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300 transform active:scale-95 shadow-lg shadow-red-100/50'
                 : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
             }`}
            >
              Submit Dispute
           </button>
        </div>

        <DisputeModal
          isOpen={isDisputeModalOpen}
          onClose={() => setIsDisputeModalOpen(false)}
          claimId={id!}
          onSuccess={fetchClaim}
        />

      </div>
    </div>
  );
};
