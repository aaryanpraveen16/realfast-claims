import { StatusBadge } from '../../components/StatusBadge';

// TODO: AdjudicatorDashboard
// Purpose: Main dashboard for claim adjudicators: 
//          shows current queue size, SLA performance, and recent decisions.
// Components: QueueStats, MyRecentDecisions, PriorityFlags
export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Adjudicator Dashboard</h2>
        <div className="flex gap-4">
          <div className="flex-1 p-6 bg-red-50 rounded border-red-200 border">
            <p className="text-red-700 text-sm font-medium uppercase">Pending Review</p>
            <p className="text-3xl font-bold text-red-900">24</p>
          </div>
          <div className="flex-1 p-6 bg-yellow-50 rounded border-yellow-200 border">
            <p className="text-yellow-700 text-sm font-medium uppercase">SLA Near Breach</p>
            <p className="text-3xl font-bold text-yellow-900">8</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="font-semibold text-gray-900 mb-4">Claims Queue</h3>
        <p className="text-gray-500 italic">TODO: Claims queue</p>
      </div>
    </div>
  );
};

// TODO: ClaimsQueue
// Purpose: List of all claims currently assigned to the adjudicator. 
//          Sortable by SLA deadline and claim amount.
// Calls:  GET /api/adjudication/queue
export const ClaimsQueue = () => <div>TODO: ClaimsQueue</div>;

// TODO: ClaimReview
// Purpose: Detailed view for adjudicators to review claim line items, 
//          medical documents, and rules engine results.
// Calls:  GET /api/adjudication/claims/:id, POST /api/adjudication/line-items/:id/decide
export const ClaimReview = () => <div>TODO: ClaimReview</div>;

// TODO: DisputeResolution
// Purpose: Resolution interface for member-filed disputes.
// Calls:  GET /api/disputes, POST /api/disputes/:id/resolve
export const DisputeResolution = () => <div>TODO: DisputeResolution</div>;
