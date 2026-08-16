import React from 'react';
import { Music, Disc } from 'lucide-react';

const EmptyState = ({
  message = 'No events right now — check back soon!',
}) => {
  return (
    <div className="empty-state-card">
      <div className="empty-icon-circle">
        <Disc size={36} color="#818cf8" />
      </div>
      <h3 className="empty-title">{message}</h3>
      <p className="empty-subtitle">We are constantly adding new concerts, DJ sets, and party events.</p>
    </div>
  );
};

export default EmptyState;
