import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Award, LayoutDashboard, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import OrganizerApplicationForm from '../components/account/OrganizerApplicationForm';

const OrganizerApplicationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applicationStatus, setApplicationStatus] = useState(
    user?.role === 'ORGANIZER' ? 'APPROVED' : 'NONE'
  );

  const handleFormSubmitSuccess = (payload) => {
    console.log('Organizer Application Submitted Payload:', payload);
    setApplicationStatus('PENDING');
  };

  return (
    <div className="discover-page-container" style={{ maxWidth: '800px', paddingTop: '2rem' }}>
      <button
        onClick={() => navigate('/account?tab=application')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Account
      </button>

      <div className="admin-section-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Organizer Application
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Host concerts, party festivals, set ticket pricing, and manage attendee gate check-ins.
        </p>

        {applicationStatus === 'APPROVED' ? (
          <div style={{ background: 'var(--bg-glass)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
            <Award size={48} color="#34d399" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>Application Approved!</h4>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 1.5rem auto' }}>
              Congratulations! Your organizer application has been approved. You can now access the Organizer Dashboard.
            </p>
            <Link to="/organizer/dashboard" className="btn btn-primary">
              <LayoutDashboard size={18} /> Open Organizer Dashboard
            </Link>
          </div>
        ) : applicationStatus === 'PENDING' ? (
          <div style={{ background: 'var(--bg-glass)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
            <Award size={48} color="#fbbf24" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>Status: Pending Review</h4>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto' }}>
              Your organizer application has been submitted and is awaiting administrator review.
            </p>
          </div>
        ) : applicationStatus === 'REJECTED' ? (
          <div style={{ background: 'var(--bg-glass)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
            <Award size={48} color="#fb7185" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>Application Rejected</h4>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto' }}>
              Your organizer application was not approved.
            </p>
          </div>
        ) : (
          <OrganizerApplicationForm onSubmitSuccess={handleFormSubmitSuccess} />
        )}
      </div>
    </div>
  );
};

export default OrganizerApplicationPage;
