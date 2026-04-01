import { Layout } from '../../App';

// TODO: MemberDashboard
// Purpose: Display overview of member's policy, active claims, and dependents.
// Components: PolicyCard, RecentClaimsTable, DependentsList
const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Welcome back, Member</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded bg-blue-50">
            <p className="text-sm text-blue-600 font-medium">Policy Status</p>
            <p className="text-2xl font-bold">Active</p>
          </div>
          <div className="p-4 border rounded bg-green-50">
            <p className="text-sm text-green-600 font-medium">Deductible Met</p>
            <p className="text-2xl font-bold">₹15,000</p>
          </div>
          <div className="p-4 border rounded bg-purple-50">
            <p className="text-sm text-purple-600 font-medium">Claims Processed</p>
            <p className="text-2xl font-bold">4</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Claims</h3>
        <p className="text-gray-500 italic">TODO: Claims list component here</p>
      </div>
    </div>
  );
};

export default Dashboard;
