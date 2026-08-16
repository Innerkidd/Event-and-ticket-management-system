import React from 'react';

const StatCard = ({
  label,
  value,
  icon: Icon,
  color = '#818cf8',
  subtitle,
  trend,
}) => {
  return (
    <div className="admin-stat-card">
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className="stat-icon-box" style={{ background: `${color}18`, color }}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="stat-body">
        <span className="stat-value">{value !== undefined && value !== null ? value : '—'}</span>
        {trend && (
          <span className={`stat-trend ${trend.startsWith('+') ? 'trend-up' : 'trend-down'}`}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="stat-subtitle">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
