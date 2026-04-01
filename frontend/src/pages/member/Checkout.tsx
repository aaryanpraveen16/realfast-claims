import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CoverageRule {
  id: string;
  service_type: string;
  limit_per_year: number;
}

interface Policy {
  id: string;
  name: string;
  premium: number;
  annual_limit: number;
  coverage_rules: CoverageRule[];
}

import { useLocation } from 'react-router-dom';

export const Checkout = () => {
  const { policyId } = useParams<{ policyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dependentId = searchParams.get('dependent');
  
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI'>('CARD');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [policiesRes, memberRes] = await Promise.all([
          axios.get('/api/policies', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/members/me', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const p = policiesRes.data.find((item: Policy) => item.id === policyId);
        if (p) setPolicy(p);
        setMember(memberRes.data);
      } catch (err) {
        console.error('Failed to fetch checkout data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [policyId]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      
      if (dependentId) {
        // Pay Dependent Top-up
        await axios.post(`/api/members/me/dependents/${dependentId}/pay`, {
          method: paymentMethod
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        navigate('/member', { 
          state: { dependentActivationSuccess: true } 
        });
      } else {
        // Standard Policy Payment
        await axios.post('/api/payments/premium', {
          policyId,
          amount: policy?.premium,
          method: paymentMethod
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        navigate('/member', { 
          state: { 
            paymentSuccess: !isUpgrade,
            upgradeSuccess: isUpgrade 
          } 
        });
      }

    } catch (err) {
      console.error('Payment failed', err);
      alert('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };


  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!policy) return <div className="text-center py-20">Policy not found.</div>;

  const isUpgrade = member?.policy_id && member.policy_id !== policy.id;
  const currentPolicy = member?.policy;
  
  const dependent = dependentId ? (member?.dependents || []).find((d: any) => d.id === dependentId) : null;
  const amountToPay = dependent ? dependent.premium_amount : policy.premium;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Summary Side */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {dependent ? 'Activate Dependent Coverage' : isUpgrade ? 'Upgrade Your Coverage' : 'Complete Your Purchase'}
            </h2>
            <p className="text-slate-500 mt-2">
              {dependent 
                ? `Pay the top-up premium to activate coverage for ${dependent.name}.`
                : isUpgrade 
                ? `You're upgrading from ${currentPolicy.name} to ${policy.name}.`
                : 'Finish selecting your plan to activate your coverage immediately.'}
            </p>
          </div>

          {/* Upgrade Comparison Card */}
          {(!dependent && isUpgrade) && (
            <div className="bg-indigo-600 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <svg className="h-20 w-20" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                 </svg>
               </div>
               <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-4">Benefit Comparison</h3>
               <div className="flex justify-between items-end gap-4">
                 <div className="flex-1">
                    <p className="text-[10px] font-bold text-indigo-300 uppercase mb-1">Old Limit</p>
                    <p className="text-xl font-bold opacity-60">₹{currentPolicy.annual_limit.toLocaleString()}</p>
                 </div>
                 <div className="flex-shrink-0 mb-1">
                    <svg className="h-5 w-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                 </div>
                 <div className="flex-1 text-right">
                    <p className="text-[10px] font-bold text-indigo-300 uppercase mb-1">New Limit</p>
                    <p className="text-3xl font-black text-white">₹{policy.annual_limit.toLocaleString()}</p>
                 </div>
               </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
              {dependent ? 'Dependent Summary' : isUpgrade ? 'Upgrade Summary' : 'Order Summary'}
            </h3>
            
            {dependent ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Dependent Name</span>
                  <span className="text-slate-900 font-bold">{dependent.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Relationship</span>
                  <span className="text-slate-900 font-bold">{dependent.relationship}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">Top-up Premium</span>
                  <span className="text-2xl font-black text-indigo-600">₹{dependent.premium_amount.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">{isUpgrade ? 'New Plan' : 'Selected Plan'}</span>
                  <span className="text-slate-900 font-bold">{policy.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Annual Limit</span>
                  <span className="text-slate-900 font-bold">₹{policy.annual_limit.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">Total Premium</span>
                  <span className="text-2xl font-black text-indigo-600">₹{policy.premium.toLocaleString()}</span>
                </div>
              </div>
            )}
            
            <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                <span className="font-bold">Note:</span> {dependent 
                  ? 'Your dependent will be actively covered under your base policy rules immediately upon successful payment.'
                  : isUpgrade 
                  ? 'Your current policy will be substituted by this new plan upon successful payment.' 
                  : 'Once payment is processed, your policy will be active and you can add dependents and file claims.'}
              </p>
            </div>
          </div>
        </div>


        {/* Payment Side */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200 border border-slate-100">
          <form onSubmit={handlePayment} className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    paymentMethod === 'CARD' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <svg className={`h-6 w-6 ${paymentMethod === 'CARD' ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className={`text-sm font-bold ${paymentMethod === 'CARD' ? 'text-indigo-900' : 'text-slate-500'}`}>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    paymentMethod === 'UPI' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <svg className={`h-6 w-6 ${paymentMethod === 'UPI' ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-sm font-bold ${paymentMethod === 'UPI' ? 'text-indigo-900' : 'text-slate-500'}`}>UPI</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'CARD' ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Card Number</label>
                  <input type="text" placeholder="•••• •••• •••• ••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Expiry Date</label>
                    <input type="text" placeholder="MM / YY" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">CVV</label>
                    <input type="text" placeholder="•••" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">UPI ID</label>
                  <input type="text" placeholder="username@upi" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className={`w-full py-4 rounded-2xl text-lg font-bold transition-all shadow-xl shadow-indigo-100 transform active:scale-[0.98] ${
                processing ? 'bg-indigo-400 cursor-not-allowed text-indigo-50' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {processing ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {dependent ? 'Activating Dependent...' : isUpgrade ? 'Processing Upgrade...' : 'Processing Payment...'}
                </div>
              ) : (dependent ? `Activate for ₹${amountToPay.toLocaleString()}` : isUpgrade ? `Confirm Upgrade for ₹${amountToPay.toLocaleString()}` : `Pay ₹${amountToPay.toLocaleString()} Now`)}
            </button>


            <p className="text-center text-xs text-slate-400">
              Secured by RealFast Pay. Your data is encrypted and safe.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
