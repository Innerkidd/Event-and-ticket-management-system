import React from 'react';

const StatusBadge = ({ status = '' }) => {
  const upperStatus = String(status).toUpperCase();

  const getBadgeClass = (st) => {
    switch (st) {
      case 'ACTIVE':
      case 'CONFIRMED':
      case 'SUCCESS':
      case 'APPROVED':
      case 'PUBLISHED':
        return 'badge-emerald';

      case 'PENDING':
      case 'DRAFT':
        return 'badge-amber';

      case 'REJECTED':
      case 'FAILED':
      case 'CANCELLED':
      case 'SUSPENDED':
        return 'badge-rose';

      case 'INACTIVE':
      case 'COMPLETED':
      default:
        return 'badge-indigo';
    }
  };

  return (
    <span className={`status-badge ${getBadgeClass(upperStatus)}`}>
      {upperStatus || 'N/A'}
    </span>
  );
};

export default StatusBadge;
