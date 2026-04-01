import { Layout } from '../../App';

// TODO: ProviderDashboard
// Purpose: Display overview for healthcare provider: pending cashless claims, 
//          eligibility checks, and settlement status.
// Components: EligibilityWidget, ClaimsList, QuickActions
export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Provider Dashboard</h2>
        <div className="flex gap-4">
          <button className="bg-primary-600 text-white px-4 py-2 rounded">Check Eligibility</button>
          <button className="border border-primary-600 text-primary-600 px-4 py-2 rounded">Submit New Claim</button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="font-semibold text-gray-900 mb-4">Pending Cashless Claims</h3>
        <p className="text-gray-500 italic">TODO: Claims queue</p>
      </div>
    </div>
  );
};

// TODO: EligibilityCheck
// Purpose: Check member's policy details for specific service types before treatment.
// Calls:  GET /api/providers/eligibility/:memberId
export const EligibilityCheck = () => <div>TODO: EligibilityCheck</div>;

// TODO: SubmitCashlessClaim
// Purpose: Multi-step form for providers to submit cashless claims for policyholders.
// Calls:  POST /api/providers/claims
export const SubmitCashlessClaim = () => <div>TODO: SubmitCashlessClaim</div>;
