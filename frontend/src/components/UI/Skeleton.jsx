export function EmailSkeleton() {
  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
      <div className="skeleton skeleton-line skeleton-line-xs" style={{ marginBottom: 8 }} />
      <div className="skeleton skeleton-line" style={{ marginBottom: 6 }} />
      <div className="skeleton skeleton-line skeleton-line-sm" style={{ marginBottom: 0 }} />
    </div>
  );
}

export function EmailListSkeleton({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => <EmailSkeleton key={i} />)}
    </>
  );
}

export function Spinner({ large }) {
  return <div className={`spinner ${large ? 'spinner-lg' : ''}`} />;
}
