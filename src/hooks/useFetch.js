import { useState, useEffect, useCallback } from 'react';
import { USE_MOCK_FALLBACK } from '../api/client';

/**
 * useResource — list + loading + error, with optional mock fallback so the
 * UI works before the backend is live. Also exposes optimistic `patchLocal`.
 */
export function useResource(service, mock = [], deps = []) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await service.list();
      setRows(Array.isArray(data) ? data : []);
      setUsingMock(false);
    } catch (e) {
      setError(e);
      if (USE_MOCK_FALLBACK) {
        setRows(mock);
        setUsingMock(true);
      } else {
        setRows([]);
      }
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  // Optimistic update: patch locally, then PATCH the API (rollback on failure)
  const patch = useCallback(async (id, fields) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...fields } : r)));
    try { if (!usingMock) await service.update(id, fields); } catch (e) { load(); }
  }, [service, usingMock, load]);

  return { rows, loading, error, usingMock, reload: load, patch, setRows };
}
