// TODO: StatusBadge
// Purpose: Display color-coded status for claims, line items, or payments.
// Rule:   Green for APPROVED/PAID, Red for DENIED/FAILED, Yellow for PENDING/REVIEW.
// Edge:   If status is empty, default to Gray/N/A.
export const StatusBadge = ({ status }: { status: string }) => {
  return (
    <span className="px-2 py-1 rounded text-xs font-semibold uppercase bg-gray-100 text-gray-800">
      {status || 'Unknown'}
    </span>
  );
};

// TODO: SLATimer
// Purpose: Display countdown for claim SLA deadline.
// Rule:   Turns red if time left is less than 4 hours.
// Edge:   If deadline is passed, show "SLA Breach" in bold red.
export const SLATimer = ({ deadline }: { deadline: string }) => {
  return <div className="text-sm font-mono text-gray-500">TODO: SLATimer (Deadline: {deadline})</div>;
};
