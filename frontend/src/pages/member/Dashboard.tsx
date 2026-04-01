import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { PolicyDrawer } from './PolicyDrawer';
import { AddDependentModal } from './AddDependentModal';
import { UnderwritingTimelineModal } from './UnderwritingTimelineModal';

export const Dashboard = () => {
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [timelineTarget, setTimelineTarget] = useState<{ id: string, type: 'MEMBER' | 'DEPENDENT', name: string } | null>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/members/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const memberData = response.data;
      if (!memberData.policy_id) {
        navigate('/member/select-policy');
        return;
      }

      setMember(memberData);
    } catch (err) {
      console.error('Failed to fetch member profile', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/claims/me/member', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClaims(response.data);
    } catch (err) {
      console.error('Failed to fetch claims', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchClaims();
  }, [navigate]);

  useEffect(() => {
    if (location.state?.paymentSuccess) {
      setNotification({ message: '✓ Payment Successful! Your policy is now active.', type: 'success' });
      window.history.replaceState({}, document.title);
    } else if (location.state?.upgradeSuccess) {
      setNotification({ message: '🎉 Policy Upgrade Successful! Enjoy your enhanced coverage.', type: 'success' });
      window.history.replaceState({}, document.title);
    } else if (location.state?.dependentActivationSuccess) {
      setNotification({ message: '✓ Premium Paid! Dependent is now active.', type: 'success' });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddSuccess = () => {
    setNotification({ message: '✓ Dependent linked! Check status for activation requirements.', type: 'success' });
    fetchProfile();
  };

  const handlePayDependent = (dependentId: string) => {
    navigate(`/member/checkout/${member.policy_id}?dependent=${dependentId}`);
  };

  const handleOpenTimeline = (id: string, type: 'MEMBER' | 'DEPENDENT', name: string) => {
    setTimelineTarget({ id, type, name });
    setIsTimelineOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!member) return null;

  const isIndividualPlan = member.policy?.plan_type === 'INDIVIDUAL';
  const isPendingPayment = member.status === 'PENDING_PAYMENT';
  const dependents = member.dependents || [];
  const maxDependentsReached = dependents.length >= 5;

  return (
    <>
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {notification && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 rounded-[2rem] p-6 text-center shadow-2xl animate-in fade-in slide-in-from-top-8 duration-500 z-[200] max-w-lg w-full border border-indigo-500/20 backdrop-blur-xl ${notification.type === 'success' ? 'bg-indigo-600/90 text-white' : 'bg-slate-900/90 text-white'
          }`}>
          <p className="text-xl font-black">{notification.message}</p>
        </div>
      )}

      {isPendingPayment && (
        <div className="bg-amber-50 border border-amber-200 rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm border-dashed">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-amber-900 font-bold">Policy Activation Pending</p>
              <p className="text-amber-700 text-sm">Your payment was not completed. Finish payment to activate coverage.</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/member/checkout/${member.policy_id}`)}
            className="px-6 py-2 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors whitespace-nowrap shadow-lg shadow-amber-200"
          >
            Complete Payment
          </button>
        </div>
      )}

      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back, {member.name}</h2>
          <p className="text-slate-500 font-medium mt-1">Your coverage status is shown below.</p>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-black border tracking-widest ${member.status === 'ACTIVE'
              ? 'bg-green-100 text-green-700 border-green-200'
              : 'bg-amber-100 text-amber-700 border-amber-200'
            }`}>
            <span className={`h-2 w-2 rounded-full mr-2 ${member.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'
              }`}></span>
            {member.status === 'ACTIVE' ? 'POLICY ACTIVE' : member.status === 'PENDING_UNDERWRITING' ? 'IN UNDERWRITING' : 'PENDING'}
          </span>
          {member.status === 'PENDING_UNDERWRITING' && (
            <span className="ml-4 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl border border-indigo-100 text-[10px] uppercase tracking-widest animate-pulse">
              Under Review
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden group text-white">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="h-24 w-24 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 5.67v5.33c0 4.633 2.19 9.003 5.65 11.722a12.019 12.019 0 0012.7 0C24.81 20.003 27 15.633 27 11v-5.33l-1.382-.686z" />
            </svg>
          </div>
          <div className="relative z-10 space-y-6">
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">Your Active Plan</p>
              <h3 className="text-2xl font-black leading-tight tracking-tight">{member.policy?.name || 'N/A'}</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10 backdrop-blur-sm"
              >
                View Benefits
              </button>
              <button
                onClick={() => navigate('/member/select-policy')}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Annual Limit Used</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-4xl font-black text-slate-900">₹{(member.limit_used || 0).toLocaleString()}</p>
              <p className="text-sm font-bold text-slate-400">/ ₹{member.policy?.annual_limit?.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-6 w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
            <div
              className="bg-indigo-600 h-full rounded-full shadow-lg shadow-indigo-100 transition-all duration-1000"
              style={{ width: `${Math.min(100, ((member.limit_used || 0) / (member.policy?.annual_limit || 1)) * 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Claim Overview</p>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Recent Claims</span>
              <span className="text-sm font-black text-indigo-600 leading-none">{claims.length}</span>
            </div>
            {claims.length === 0 ? (
              <>
                <p className="text-xs font-medium text-slate-400 leading-relaxed">No claims filed yet.</p>
                <button
                  onClick={() => navigate('/member/submit-claim')}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 transition-all hover:-translate-y-0.5"
                >
                  File claim
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Total Charged</span>
                  <span className="text-sm font-black text-slate-900 leading-none">
                    ₹{claims.reduce((sum, c) => sum + c.total_charged, 0).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/member/claims')}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200"
                >
                  View History
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Family Dependents</h3>
          <div>
            {isIndividualPlan ? (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 uppercase tracking-wider">Upgrade Required</span>
            ) : maxDependentsReached ? (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-wider">Full (5/5)</span>
            ) : (
              <button
                onClick={() => setIsAddModalOpen(true)}
                disabled={isPendingPayment}
                className="px-6 py-2 bg-indigo-600 text-white text-xs font-black rounded-full shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest active:scale-95 disabled:opacity-50"
              >
                + Add Member
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            onClick={() => member.status === 'PENDING_UNDERWRITING' && handleOpenTimeline(member.id, 'MEMBER', member.name)}
            className={`p-8 bg-white rounded-[2.5rem] border shadow-sm flex flex-col justify-between transition-all group ${member.status === 'PENDING_UNDERWRITING' ? 'border-amber-200 hover:border-amber-400 cursor-pointer bg-amber-50/10' : 'border-slate-100'
              }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl ${member.status === 'ACTIVE' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
                }`}>
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 leading-none">{member.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Self (Primary)</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
              <span className={`px-3 py-1 text-[9px] font-bold rounded-lg tracking-widest uppercase ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                {member.status === 'ACTIVE' ? 'Active' : 'In Underwriting'}
              </span>
              <span className="text-[10px] font-bold text-slate-300">Base Plan Holder</span>
            </div>
          </div>

          {dependents.map((dep: any) => (
            <div
              key={dep.id}
              onClick={() => dep.status === 'PENDING_UNDERWRITING' && handleOpenTimeline(dep.id, 'DEPENDENT', dep.name)}
              className={`p-8 bg-white rounded-[2.5rem] border shadow-sm flex flex-col justify-between transition-all ${dep.status === 'PENDING_UNDERWRITING' ? 'border-amber-200 hover:border-amber-400 cursor-pointer bg-amber-50/10' : 'border-slate-100'
                }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl ${dep.status === 'ACTIVE' ? 'bg-green-50 text-green-600' :
                    dep.status === 'PENDING_UNDERWRITING' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-50 text-slate-400'
                  }`}>
                  {dep.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-none">{dep.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{dep.relationship}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                {dep.status === 'ACTIVE' ? (
                  <span className="px-3 py-1 bg-green-100 text-[9px] font-bold text-green-700 rounded-lg tracking-widest uppercase">Active</span>
                ) : dep.status === 'PENDING_UNDERWRITING' ? (
                  <span className="px-3 py-1 bg-amber-100 text-[9px] font-bold text-amber-700 rounded-lg tracking-widest uppercase">In Underwriting</span>
                ) : dep.status === 'AWAITING_PAYMENT' ? (
                  <button
                    onClick={() => handlePayDependent(dep.id)}
                    className="px-3 py-1 bg-indigo-600 text-[9px] font-bold text-white rounded-lg tracking-widest uppercase hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                  >
                    Pay ₹{(dep.base_premium + dep.loading_amount).toLocaleString()}
                  </button>
                ) : (
                  <span className="px-3 py-1 bg-slate-100 text-[9px] font-bold text-slate-500 rounded-lg tracking-widest uppercase">{dep.status}</span>
                )}
              </div>
            </div>
          ))}

          {!isIndividualPlan && dependents.length < 5 && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-8 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 group hover:border-indigo-100 hover:bg-indigo-50/50 transition-all text-slate-300 hover:text-indigo-600"
            >
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors text-slate-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">Add Dependent</p>
            </button>
          )}
        </div>
      </div>

    </div>

    <PolicyDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} policy={member.policy} />

    <AddDependentModal
      isOpen={isAddModalOpen}
      onClose={() => setIsAddModalOpen(false)}
      onSuccess={handleAddSuccess}
    />

    {timelineTarget && (
      <UnderwritingTimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        entityId={timelineTarget.id}
        entityType={timelineTarget.type}
        entityName={timelineTarget.name}
      />
    )}
    </>
  );
};
