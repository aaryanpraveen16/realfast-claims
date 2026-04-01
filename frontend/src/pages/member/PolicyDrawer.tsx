import React from 'react';
import { createPortal } from 'react-dom';

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

interface PolicyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
}

export const PolicyDrawer: React.FC<PolicyDrawerProps> = ({ isOpen, onClose, policy }) => {
  if (!policy) return null;

  const content = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-[0_0_50px_rgba(0,0,0,0.15)] z-[110] transform transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{policy.name}</h2>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">
              {policy.plan_type.replace('_', ' ')} Plan Details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-slate-200 transition-all text-slate-400 hover:text-slate-600 active:scale-95"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-grow overflow-y-auto px-8 py-8 space-y-10 custom-scrollbar overscroll-contain">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-200">
              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-2 opacity-75">Max Annual Limit</p>
              <p className="text-2xl font-black">₹{policy.annual_limit.toLocaleString()}</p>
            </div>
            <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Premium Cost</p>
              <p className="text-2xl font-black text-slate-900">₹{policy.premium.toLocaleString()}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Policy Parameters</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Deductible Type', value: policy.deductible_type.replace('_', ' '), highlight: false },
                { label: 'Deductible Amount', value: `₹${policy.deductible.toLocaleString()}`, highlight: false },
                { label: 'Co-pay Percentage', value: `${policy.copay_pct}%`, highlight: false },
                { label: 'Room Rent Limit', value: `₹${policy.room_rent_limit.toLocaleString()} / day`, highlight: false },
                { label: 'PED Waiting Period', value: `${policy.ped_waiting_days} days`, highlight: true },
              ].map((item, idx) => (
                <div key={idx} className={`flex justify-between items-center p-5 rounded-2xl border transition-colors ${
                  item.highlight ? 'bg-amber-50 border-amber-100 text-amber-900' : 'bg-slate-50 border-slate-100 text-slate-900'
                }`}>
                  <span className={`text-sm font-bold ${item.highlight ? 'text-amber-700' : 'text-slate-500'}`}>{item.label}</span>
                  <span className="text-sm font-black uppercase tracking-tight">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coverage Rules Breakdown */}
          <div className="space-y-6 pb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Coverage Rules</h3>
            <div className="space-y-4">
              {policy.coverage_rules.map((rule) => (
                <div key={rule.id} className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1">
                      <p className="font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors uppercase text-sm">
                        {rule.service_type.replace('_', ' ')}
                      </p>
                      {rule.requires_preauth && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black bg-indigo-100 text-indigo-700 tracking-wider">
                          PRE-AUTH REQ
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">₹{rule.limit_per_year.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Per Year</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-full w-full rounded-full opacity-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 bg-white sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full py-5 bg-slate-900 text-white text-sm font-black rounded-2xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-200 uppercase tracking-widest"
          >
            Close Details
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
};
