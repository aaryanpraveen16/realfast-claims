import { useState } from 'react';
import axios from 'axios';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string;
  onSuccess: () => void;
}

export const DisputeModal = ({ isOpen, onClose, claimId, onSuccess }: DisputeModalProps) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for the dispute.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/claims/${claimId}/dispute`, 
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit dispute. Only adjudicated claims can be disputed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Submit Dispute</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Challenge the insurance decision for this claim.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                Reason for Dispute
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Explain why you disagree with the approved amount or denial..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-medium"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 px-6 border border-slate-100 rounded-2xl text-slate-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-[2] py-4 px-6 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
              >
                {submitting ? 'Submitting...' : 'Confirm Dispute'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-100">
           <p className="text-[10px] text-slate-400 font-medium leading-relaxed text-center italic">
              Disputes typically take 3-5 business days for medical review. 
              You will be notified once a final decision is reached.
           </p>
        </div>
      </div>
    </div>
  );
};
