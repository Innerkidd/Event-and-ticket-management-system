import React from 'react';
import Skeleton from '../common/Skeleton';

const EventCardSkeleton = () => {
  return (
    <div className="event-card-skeleton">
      {/* Cover Image Placeholder */}
      <Skeleton height="190px" borderRadius="16px 16px 0 0" />

      {/* Card Content Skeleton */}
      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <Skeleton width="40%" height="16px" />
          <Skeleton width="25%" height="16px" />
        </div>
        <Skeleton width="85%" height="22px" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="60%" height="16px" style={{ marginBottom: '1rem' }} />

        <Skeleton width="75%" height="14px" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="90%" height="14px" style={{ marginBottom: '1.25rem' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.875rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Skeleton width="30%" height="24px" />
          <Skeleton width="35%" height="36px" borderRadius="10px" />
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;
