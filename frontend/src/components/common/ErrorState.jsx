import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({
  message = 'Failed to load events. Please check your internet connection.',
  onRetry,
}) => {
  return (
    <div className="error-state-card">
      <div className="error-icon-circle">
        <AlertCircle size={32} color="#f43f5e" />
      </div>
      <h3 className="error-title">Unable to Load Events</h3>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-retry">
          <RefreshCw size={16} /> Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
