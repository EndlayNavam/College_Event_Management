const statusClassMap = {
  Active: "status-active",
  active: "status-active",
  Draft: "status-draft",
  draft: "status-draft",
  Past: "status-past",
  past: "status-past",
  pending: "status-pending",
  Pending: "status-pending",
  approved: "status-active",
  Approved: "status-active",
  rejected: "status-rejected",
  Rejected: "status-rejected"
};

export default function StatusTag({ label }) {
  const text = String(label || "pending");
  return (
    <span className={`status-tag ${statusClassMap[text] || "status-pending"}`}>
      {text}
    </span>
  );
}
