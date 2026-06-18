import { formatDate } from '../../utils/formatDate';

const CATEGORY_COLORS = {
  tech: '#1a73e8',
  business: '#188038',
  media: '#f9ab00',
  sports: '#ea4335',
  entertainment: '#ff6d01',
  influence: '#9334e6',
};

export default function EmailCard({ email, isActive, onClick, enter }) {
  const dotColor = CATEGORY_COLORS[email.category] || '#9aa0a6';
  const preview = email.body.replace(/\n/g, ' ').substring(0, 100);

  return (
    <div
      className={`email-card ${!email.read ? 'unread' : ''} ${isActive ? 'active' : ''} ${enter ? 'email-card-enter' : ''}`}
      onClick={onClick}
    >
      <div className="email-time">{formatDate(email.timestamp)}</div>
      <div className="email-sender">
        <span className={`read-dot ${email.read ? 'hidden' : ''}`} style={{ background: dotColor }} />
        {email.senderName}
        <span className="category-tag">{email.category}</span>
      </div>
      <div className="email-subject">{email.subject}</div>
      <div className="email-preview">{preview}…</div>
    </div>
  );
}
