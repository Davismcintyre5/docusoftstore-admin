import { useState, useCallback } from 'react';
import adminApi from '../services/adminApi';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const request = useCallback(async (method, url, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await adminApi({
        method,
        url,
        ...options,
      });
      setData(response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Request failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, params) => request('GET', url, { params }), [request]);
  const post = useCallback((url, data) => request('POST', url, { data }), [request]);
  const put = useCallback((url, data) => request('PUT', url, { data }), [request]);
  const del = useCallback((url) => request('DELETE', url), [request]);

  return {
    loading,
    error,
    data,
    request,
    get,
    post,
    put,
    delete: del,
  };
};