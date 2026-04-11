import { useEffect, useMemo, useState } from 'react';
import propertyService from '../services/propertyService';

const CACHE_TTL_MS = 60_000;
const propertiesCache = new Map();

const getCache = (key) => {
  const entry = propertiesCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    propertiesCache.delete(key);
    return null;
  }
  return entry;
};

const setCache = (key, payload, ttl = CACHE_TTL_MS) => {
  propertiesCache.set(key, {
    ...payload,
    ttl,
    timestamp: Date.now(),
  });
};

const stripMetaParams = (params) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(params)) {
    if (key.startsWith('_')) continue;
    cleaned[key] = value;
  }
  return cleaned;
};

export default function useProperties(params = {}) {
  const requestParams = useMemo(() => stripMetaParams(params), [params]);
  const stableParams = useMemo(() => JSON.stringify(requestParams), [requestParams]);
  const cacheKey = params._cacheKey || stableParams;
  const cacheTtl = Number.isFinite(params._cacheTtlMs) ? params._cacheTtlMs : CACHE_TTL_MS;
  const useCache = params._cache !== false;
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      const cached = useCache ? getCache(cacheKey) : null;
      if (cached && active) {
        setProperties(cached.properties || []);
        setPagination(cached.pagination || null);
        setLoading(false);
      } else {
        setLoading(true);
      }
      setError('');

      try {
        const response = await propertyService.getAll(JSON.parse(stableParams));
        if (!active) return;
        const items = response.data.data.items || [];
        const nextPagination = response.data.data.pagination || null;
        setProperties(items);
        setPagination(nextPagination);
        if (useCache) {
          setCache(cacheKey, { properties: items, pagination: nextPagination }, cacheTtl);
        }
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load properties');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [stableParams, cacheKey, cacheTtl, useCache]);

  return { properties, pagination, loading, error, setProperties };
}
