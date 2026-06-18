import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEmails } from './hooks/useEmails';
import { useToast, ToastContainer } from './components/UI/Toast';
import ErrorBoundary from './components/UI/ErrorBoundary';
import AuthPage from './components/Auth/AuthPage';
import TopBar from './components/Layout/TopBar';
import Sidebar from './components/Layout/Sidebar';
import EmailList from './components/Layout/EmailList';
import PreviewPanel from './components/Layout/PreviewPanel';

function InboxApp() {
  const { user } = useAuth();
  const { emails, loading, refreshing, hasMore, error, fetchEmails, refresh, loadMore, updateEmail, setParams } = useEmails();
  const { toasts, addToast } = useToast();
  const [folder, setFolder] = useState('inbox');
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const searchTimeout = useRef(null);
  const initialLoad = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user && !initialLoad.current) {
      initialLoad.current = true;
      fetchEmails({ folder: 'inbox' });
    }
  }, [user, fetchEmails]);

  useEffect(() => {
    if (user) {
      fetchEmails({ folder, category, search, page: 1 }, false);
    }
  }, [user, folder, category]);

  useEffect(() => {
    if (!user) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setParams({ search, page: 1 });
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [search, setParams, user]);

  useEffect(() => {
    if (error) addToast(error, 'error');
  }, [error, addToast]);

  const handleRefresh = useCallback(async () => {
    if (!user) return;
    const result = await refresh();
    if (result && result.generated > 0) {
      addToast(`Generated ${result.generated} new email${result.generated > 1 ? 's' : ''}`, 'success');
    } else if (result) {
      addToast('No new emails — AI generation limit may be reached', 'info');
    }
  }, [user, refresh, addToast]);

  const handleFolderChange = useCallback((f) => {
    setFolder(f);
    setSelectedEmail(null);
    setCategory(null);
    setSearch('');
  }, []);

  const handleCategoryChange = useCallback((c) => {
    setCategory(c);
    setSelectedEmail(null);
  }, []);

  const handleRead = useCallback(async (id) => {
    await updateEmail(id, { read: true });
  }, [updateEmail]);

  const handleMoveFolder = useCallback(async (id, newFolder) => {
    await updateEmail(id, { folder: newFolder });
    setSelectedEmail(null);
    addToast(`Moved to ${newFolder}`, 'info');
  }, [updateEmail, addToast]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const unreadCount = emails.filter(e => !e.read).length;

  if (!user) return <AuthPage />;

  return (
    <div className="app-layout">
      <TopBar
        search={search}
        onSearchChange={setSearch}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <div className="main-container">
        <Sidebar
          folder={folder}
          onFolderChange={handleFolderChange}
          category={category}
          onCategoryChange={handleCategoryChange}
          unreadCount={unreadCount}
        />
        <div className="email-content">
          <EmailList
            emails={emails}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onSelect={setSelectedEmail}
            selectedId={selectedEmail?._id}
            onRead={handleRead}
          />
          <PreviewPanel
            email={selectedEmail}
            onMoveFolder={handleMoveFolder}
            onBack={() => setSelectedEmail(null)}
          />
        </div>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <InboxApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}
