import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CoverageRule {
  id: string;
  service_type: string;
  limit_per_year: number;
  requires_preauth: boolean;
}

interface Policy {
  id: string;
  name: string;
  plan_type: string;
  premium: number;
  deductible: number;
  deductible_type: string;
  annual_limit: number;
  room_rent_limit: number;
  copay_pct: number;
  ped_waiting_days: number;
  coverage_rules: CoverageRule[];
}

export const PolicySelection = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [policiesRes, memberRes] = await Promise.all([
          axios.get('/api/policies', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/members/me', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setPolicies(policiesRes.data);
        setMember(memberRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelect = (policyId: string) => {
    navigate(`/member/checkout/${policyId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Upgrade Your Protection</h2>
        <p className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
          Select an Insurance Plan
        </p>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
          Compare plans and upgrade to a better coverage option for you and your family.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {policies.map((policy) => {
          const isCurrentPlan = member?.policy_id === policy.id;
          return (
            <div 
              key={policy.id}
              className={`flex flex-col rounded-3xl shadow-xl transition-all duration-300 overflow-hidden border ${
                isCurrentPlan 
                  ? 'bg-slate-50 border-indigo-200 ring-2 ring-indigo-600 relative' 
                  : 'bg-white border-gray-100 hover:shadow-2xl'
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute top-0 right-0 p-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white tracking-widest uppercase">
                    Your Current Plan
                  </span>
                </div>
              )}

              <div className={`px-8 py-10 border-b ${isCurrentPlan ? 'bg-indigo-50/50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{policy.name}</h3>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-6">{policy.plan_type.replace('_', ' ')}</p>
                <div className="flex items-baseline mb-2">
                  <span className="text-5xl font-extrabold tracking-tight text-gray-900">₹{policy.premium.toLocaleString()}</span>
                  <span className="ml-1 text-xl font-semibold text-gray-500">/year</span>
                </div>
                <p className="text-sm text-gray-400">Includes all taxes and surcharges</p>
              </div>

              <div className="flex-grow p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-2xl">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Annual Limit</p>
                    <p className="text-lg font-bold text-indigo-900 uppercase">₹{(policy.annual_limit / 100000).toFixed(1)} Lakh</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Deductible</p>
                    <p className="text-lg font-bold text-slate-900">₹{policy.deductible.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Key Coverage Rules</h4>
                  <ul className="space-y-3">
                    {policy.coverage_rules.slice(0, 5).map((rule) => (
                      <li key={rule.id} className="flex items-center text-sm text-gray-600">
                        <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="flex-grow font-medium text-gray-700">{rule.service_type.replace('_', ' ')}</span>
                        <span className="font-bold text-gray-900">₹{rule.limit_per_year.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-8 bg-white border-t border-gray-100">
                <button
                  onClick={() => !isCurrentPlan && handleSelect(policy.id)}
                  disabled={isCurrentPlan}
                  className={`w-full py-4 px-6 rounded-2xl text-lg font-bold transition-all duration-200 transform ${
                    isCurrentPlan 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-200'
                  }`}
                >
                  {isCurrentPlan ? 'Currently Active' : member?.policy_id ? 'Upgrade to this Plan' : 'Select This Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
