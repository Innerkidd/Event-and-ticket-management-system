import React from 'react';
import Header from './components/common/Header';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main-content">
        <AppRoutes />
      </main>
      <footer className="site-footer">
        <div className="footer-container">
          <p>© {new Date().getFullYear()} EventHub System. Concert & Party Ticketing Hackathon Prototype.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
