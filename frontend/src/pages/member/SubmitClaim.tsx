import { useNavigate } from 'react-router-dom';
import { ClaimForm } from '../../components/ClaimForm';

export const SubmitClaim = () => {
  const navigate = useNavigate();

  const handleSuccess = (claimId: string) => {
    navigate(`/member/claims/${claimId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-top-4 duration-700">
             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             Hassle-Free Reimbursement
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Submit Your Claim</h1>
          <p className="text-slate-500 font-bold max-w-lg mx-auto">
            Fill in the details from your bill and upload the medical documents. 
            Our intelligent engine will start the review instantly.
          </p>
        </div>

        {/* Claim Form Component */}
        <ClaimForm mode="MEMBER" onSubmitSuccess={handleSuccess} />

        {/* Support Callout */}
        <div className="flex items-center justify-center gap-8 py-8 px-10 bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
           <div className="flex -space-x-3 overflow-hidden">
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-100"></div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100"></div>
           </div>
           <p className="text-[11px] font-bold text-slate-500">
             Need help with ICD codes? <span className="text-indigo-600 cursor-pointer">Chat with our Support Adjudicator</span>
           </p>
        </div>

      </div>
    </div>
  );
};
