import { useState, useCallback, useRef } from 'react';
import { api } from '../api/client';

export function useEmails() {
  const [emails, setEmails] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const paramsRef = useRef({ folder: 'inbox' });

  const fetchEmails = useCallback(async (params = {}, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const merged = { ...paramsRef.current, ...params };
      paramsRef.current = merged;
      const data = await api.getEmails(merged);
      if (append) {
        setEmails(prev => [...prev, ...data.emails]);
      } else {
        setEmails(data.emails);
      }
      setTotal(data.total);
      setPage(data.page);
      setHasMore(data.page < data.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await api.refreshEmails();
      await fetchEmails({ ...paramsRef.current, page: 1 }, false);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setRefreshing(false);
    }
  }, [fetchEmails]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchEmails({ page: page + 1 }, true);
  }, [loading, hasMore, page, fetchEmails]);

  const updateEmail = useCallback(async (id, updates) => {
    try {
      const updated = await api.updateEmail(id, updates);
      setEmails(prev => prev.map(e => e._id === id ? { ...e, ...updated } : e));
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const setParams = useCallback((params) => {
    paramsRef.current = { ...paramsRef.current, ...params };
    fetchEmails(params, false);
  }, [fetchEmails]);

  return {
    emails, total, page, loading, refreshing, hasMore, error,
    fetchEmails, refresh, loadMore, updateEmail, setParams,
  };
}
