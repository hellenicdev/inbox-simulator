import { useEffect, useRef, useCallback } from 'react';
import EmailCard from '../Email/EmailCard';
import { EmailListSkeleton } from '../UI/Skeleton';

export default function EmailList({ emails, loading, hasMore, onLoadMore, onSelect, selectedId, onRead }) {
  const sentinelRef = useRef(null);

  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  if (!loading && emails.length === 0) {
    return (
      <div className="email-list">
        <div className="empty-state">
          <h3>Your inbox is empty</h3>
          <p>Sit tight — new emails will be generated when you refresh.</p>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Click ↻ Refresh to generate new messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="email-list">
      <div className="email-list-header">
        <span>{emails.length > 0 ? `${emails.length} emails` : ''}</span>
      </div>
      {emails.map((email, i) => (
        <EmailCard
          key={email._id}
          email={email}
          isActive={selectedId === email._id}
          onClick={() => {
            if (!email.read) onRead(email._id);
            onSelect(email);
          }}
          enter={i === 0}
        />
      ))}
      {loading && <EmailListSkeleton count={3} />}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {hasMore && !loading && (
        <div className="loading-more">
          <div className="spinner" /> Loading more...
        </div>
      )}
    </div>
  );
}
