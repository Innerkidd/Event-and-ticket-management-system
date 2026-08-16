import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import OrganizerSidebar from './OrganizerSidebar';
import OrganizerHeader from './OrganizerHeader';

const OrganizerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="admin-shell">
      {/* Organizer Sidebar Navigation */}
      <OrganizerSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        <OrganizerHeader onToggleSidebar={toggleSidebar} />
        <main className="admin-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OrganizerLayout;
