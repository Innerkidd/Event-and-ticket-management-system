import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Upload, Trash2, RefreshCw, FileText, CheckCircle, AlertCircle, Info, ShieldCheck, Link as LinkIcon } from 'lucide-react';

const ORG_TYPES = [
  'Company',
  'Startup',
  'Educational Institution',
  'Student Organization',
  'Event Management Company',
  'Community / Club',
  'Non-Profit Organization',
  'Independent / Individual',
  'Other',
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];

const OrganizerApplicationForm = ({ onSubmitSuccess }) => {
  const { user } = useAuth();

  // Section 1: Basic Details
  const [fullName, setFullName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [organization, setOrganization] = useState('');
  const [orgType, setOrgType] = useState(ORG_TYPES[0]);

  // Section 2: Experience
  const [experience, setExperience] = useState('');
  const [eventCount, setEventCount] = useState(0);
  const [reason, setReason] = useState('');

  // Section 3: Social / Online Presence
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Section 4: Verification Document
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState('');

  // Declaration
  const [agreedDeclaration, setAgreedDeclaration] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError('Please upload a PDF, JPG, JPEG, or PNG file.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('File size must be 5 MB or less.');
      return;
    }

    setDocumentFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setDocumentPreview('');
    }
  };

  const handleRemoveDocument = () => {
    setDocumentFile(null);
    setDocumentPreview('');
  };

  const isValidUrl = (str) => {
    if (!str) return true;
    try {
      new URL(str.startsWith('http') ? str : `https://${str}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field Validations
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setError('Please enter a valid phone number (at least 8 digits).');
      return;
    }
    if (!organization.trim()) {
      setError('Organization or company name is required.');
      return;
    }
    if (!experience.trim()) {
      setError('Please describe your previous event-organizing experience.');
      return;
    }
    if (isNaN(eventCount) || eventCount < 0) {
      setError('Number of events organized cannot be negative.');
      return;
    }
    if (!reason.trim()) {
      setError('Please tell us why you want to become an organizer.');
      return;
    }
    if (!linkedinUrl.trim() || !isValidUrl(linkedinUrl.trim())) {
      setError('Please enter a valid LinkedIn profile URL.');
      return;
    }
    if (websiteUrl.trim() && !isValidUrl(websiteUrl.trim())) {
      setError('Please enter a valid website/social URL or leave it empty.');
      return;
    }
    if (portfolioUrl.trim() && !isValidUrl(portfolioUrl.trim())) {
      setError('Please enter a valid portfolio URL or leave it empty.');
      return;
    }
    if (!documentFile) {
      setError('Please upload one valid verification document.');
      return;
    }
    if (!agreedDeclaration) {
      setError('Please confirm that the information and document provided are accurate.');
      return;
    }

    setIsSubmitting(true);

    try {
      const applicationPayload = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        organization: organization.trim(),
        orgType,
        experience: experience.trim(),
        eventCount: Number(eventCount),
        reason: reason.trim(),
        linkedin_url: linkedinUrl.trim(),
        social_media_url: websiteUrl.trim(),
        portfolio_url: portfolioUrl.trim(),
        document_name: documentFile.name,
      };

      if (onSubmitSuccess) {
        onSubmitSuccess(applicationPayload);
      }
    } catch (err) {
      console.error('Application submission error:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = isSubmitting || !agreedDeclaration || !documentFile || !fullName.trim() || !phone.trim() || !organization.trim();

  return (
    <form onSubmit={handleSubmit} noValidate className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {error && (
        <div className="auth-error-banner" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION 1 — BASIC DETAILS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          1. Basic Details
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="appName">Full Name *</label>
            <input
              type="text"
              id="appName"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="appEmail">Account Email (Read-Only) *</label>
            <input
              type="email"
              id="appEmail"
              className="form-input"
              value={email}
              readOnly
              style={{ opacity: 0.7, cursor: 'not-allowed', background: 'rgba(255, 255, 255, 0.03)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="appPhone">Phone Number *</label>
            <input
              type="tel"
              id="appPhone"
              className="form-input"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="appOrganization">Organization / Company Name *</label>
            <input
              type="text"
              id="appOrganization"
              className="form-input"
              placeholder="e.g. Sunburn Events Pvt Ltd"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="orgType">Organization Type *</label>
          <select
            id="orgType"
            className="form-select"
            style={{ width: '100%' }}
            value={orgType}
            onChange={(e) => setOrgType(e.target.value)}
          >
            {ORG_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 2 — EXPERIENCE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          2. Event Experience
        </h4>

        <div className="form-group">
          <label className="form-label" htmlFor="experience">Previous Event Experience *</label>
          <textarea
            id="experience"
            className="form-input"
            style={{ minHeight: '90px', resize: 'vertical' }}
            placeholder="Describe previous music concerts, college fests, or party events you have organized..."
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="eventCount">Number of Events Organized *</label>
          <input
            type="number"
            id="eventCount"
            min="0"
            step="1"
            className="form-input"
            value={eventCount}
            onChange={(e) => setEventCount(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reason">Why do you want to become an organizer? *</label>
          <textarea
            id="reason"
            className="form-input"
            style={{ minHeight: '90px', resize: 'vertical' }}
            placeholder="Explain why you want to host events on EventHub..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
      </div>

      {/* SECTION 3 — SOCIAL / ONLINE PRESENCE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          3. Social / Online Presence
        </h4>

        <div className="form-group">
          <label className="form-label" htmlFor="linkedin">LinkedIn Profile URL *</label>
          <input
            type="url"
            id="linkedin"
            className="form-input"
            placeholder="https://linkedin.com/in/yourprofile"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="website">Instagram / Facebook / Website (Optional)</label>
          <input
            type="url"
            id="website"
            className="form-input"
            placeholder="https://instagram.com/youreventcompany"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="portfolio">Previous Event Page / Portfolio Link (Optional)</label>
          <input
            type="url"
            id="portfolio"
            className="form-input"
            placeholder="https://yourportfolio.com/past-events"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
          />
        </div>
      </div>

      {/* SECTION 4 — VERIFICATION DOCUMENT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          4. Verification Document
        </h4>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          Upload one valid document (Organization ID, Company Registration, College Authorization Letter, or Certificate) to support your application.
        </p>

        {documentFile ? (
          <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {documentPreview ? (
                <img src={documentPreview} alt="Preview" style={{ width: '54px', height: '54px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '54px', height: '54px', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={24} color="#818cf8" />
                </div>
              )}
              <div>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{documentFile.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  {documentFile.type.toUpperCase()} • {(documentFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                <RefreshCw size={14} /> Replace
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
              <button type="button" onClick={handleRemoveDocument} className="btn btn-danger btn-sm">
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        ) : (
          <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            background: 'rgba(11, 15, 25, 0.4)',
            color: 'var(--text-muted)'
          }}>
            <Upload size={28} style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Click to upload verification document</span>
            <span style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>PDF, JPG, JPEG or PNG (Max 5 MB)</span>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        )}

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
          Your document will be reviewed by administrators for organizer verification.
        </p>
      </div>

      {/* MANDATORY DECLARATION CHECKBOX */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
        <input
          type="checkbox"
          id="declarationCheck"
          checked={agreedDeclaration}
          onChange={(e) => setAgreedDeclaration(e.target.checked)}
          style={{ marginTop: '0.25rem', width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
        />
        <label htmlFor="declarationCheck" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', cursor: 'pointer' }}>
          I confirm that the information and document provided are accurate and belong to me / my organization. *
        </label>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="btn btn-primary"
        style={{ padding: '0.85rem', fontSize: '1rem' }}
      >
        <ShieldCheck size={18} /> {isSubmitting ? 'Submitting Application...' : 'Submit Organizer Application'}
      </button>
    </form>
  );
};

export default OrganizerApplicationForm;
