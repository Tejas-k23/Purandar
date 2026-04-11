import React, { useEffect, useRef, useState } from 'react';
import env from '../../config/env';

const DEFAULT_LIMIT = 6;

export default function MapboxSuggestInput({
  value,
  onChange,
  onSelect,
  placeholder,
  types = 'place',
  country = 'IN',
  limit = DEFAULT_LIMIT,
  displayKey = 'place_name',
  valueKey = 'text',
  queryContext = '',
  className = '',
  inputClassName = '',
  error = false,
  disabled = false,
  name,
  autoComplete = 'off',
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const ref = useRef(null);
  const token = env.mapboxAccessToken;

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!token) {
      setSuggestions([]);
      return undefined;
    }

    const query = String(value || '').trim();
    if (query.length < 2) {
      setSuggestions([]);
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const searchQuery = queryContext ? `${query}, ${queryContext}` : query;
        const encoded = encodeURIComponent(searchQuery);
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?types=${types}&autocomplete=true&limit=${limit}&country=${country}&access_token=${token}`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('Mapbox request failed');
        const data = await response.json();
        const next = (data.features || []).map((feature) => ({
          id: feature.id,
          label: feature[displayKey] || feature.place_name || feature.text,
          value: feature[valueKey] || feature.text || feature.place_name,
          feature,
        }));
        setSuggestions(next);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value, types, country, limit, token, queryContext, displayKey, valueKey]);

  return (
    <div ref={ref} className={`ppf-search-dropdown ${className}`}>
      <input
        name={name}
        className={`ppf-input ${error ? 'error' : ''} ${inputClassName}`}
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        onFocus={() => {
          if (token) setOpen(true);
        }}
        onChange={(event) => {
          onChange?.(event.target.value);
          if (token) setOpen(true);
        }}
      />
      {token && open ? (
        <div className="ppf-dropdown-list">
          {loading ? (
            <div className="ppf-dropdown-item">Loading suggestions...</div>
          ) : suggestions.length ? (
            suggestions.map((item) => (
              <div
                key={item.id}
                className="ppf-dropdown-item"
                onClick={() => {
                  onChange?.(item.value);
                  onSelect?.(item.feature, item);
                  setOpen(false);
                }}
              >
                {item.label}
              </div>
            ))
          ) : (
            <div className="ppf-dropdown-item">No matches found</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
