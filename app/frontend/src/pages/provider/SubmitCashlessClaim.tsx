import { useSearchParams, useNavigate } from 'react-router-dom';
import { ClaimForm } from '../../components/ClaimForm';

export const SubmitCashlessClaim = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const memberId = searchParams.get('memberId') || '';

  const handleSuccess = (claimId: string) => {
    navigate(`/provider/claims/${claimId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-top-4 duration-700">
             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             Cashless Urgent Submission (1h SLA)
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">File Cashless Claim</h1>
          <p className="text-slate-500 font-bold max-w-lg mx-auto">
            Submitting for Member: <span className="text-slate-900 font-black tracking-tight">{memberId}</span>
          </p>
        </div>

        {/* Claim Form Component */}
        <ClaimForm 
          mode="PROVIDER" 
          initialMemberId={memberId} 
          onSubmitSuccess={handleSuccess} 
        />

        {/* Info Box */}
        <div className="p-10 bg-indigo-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg className="h-32 w-32" fill="white" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
           </div>
           <div className="relative z-10 space-y-4">
              <h4 className="text-indigo-300 font-black text-[10px] uppercase tracking-widest">Provider Notice</h4>
              <p className="text-white text-lg font-bold leading-relaxed max-w-xl">
                Please ensure all line items match the hospital discharge summary exactly. 
                Our AI-adjudicator processes cashless claims within 60 minutes.
              </p>
              <div className="flex gap-4 pt-4">
                 <div className="flex items-center gap-2 text-indigo-400 text-[9px] font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    SLA Priority: High
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
