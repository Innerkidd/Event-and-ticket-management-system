import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const PublicLayout = () => {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-container">
          <p>© {new Date().getFullYear()} EventHub System. Concert & Party Ticketing Hackathon Prototype.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
