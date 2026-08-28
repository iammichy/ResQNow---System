// src/components/common/StatusBadge.jsx
const statusStyles = {
  'Submitted': 'bg-blue-100 text-blue-800',
  'Pending Verification': 'bg-amber-100 text-amber-800',
  'Verified': 'bg-indigo-100 text-indigo-800',
  'In Progress': 'bg-orange-100 text-orange-800',
  'Responders En Route': 'bg-purple-100 text-purple-800',
  'Responded': 'bg-cyan-100 text-cyan-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Invalid': 'bg-red-100 text-red-800',
};

const priorityStyles = {
  'High': 'bg-red-100 text-red-700',
  'Medium': 'bg-amber-100 text-amber-700',
  'Low': 'bg-gray-100 text-gray-700',
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${priorityStyles[priority] || 'bg-gray-100 text-gray-700'}`}>
      {priority}
    </span>
  );
}
