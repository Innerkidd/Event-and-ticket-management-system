import React from 'react';
import { X } from 'lucide-react';

const DetailDrawer = ({ isOpen, onClose, title = 'Details', children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <h3 className="drawer-title">{title}</h3>
          <button onClick={onClose} className="drawer-close-btn" aria-label="Close drawer">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">{children}</div>

        {/* Optional Drawer Footer */}
        {footer && <div className="drawer-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default DetailDrawer;
