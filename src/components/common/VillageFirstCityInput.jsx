import React, { useEffect, useMemo, useRef, useState } from 'react';
import env from '../../config/env';
import { searchVillages } from '../../utils/mapHelpers';

const DEFAULT_LIMIT = 6;

export default function VillageFirstCityInput({
  value,
  onChange,
  onSelect,
  placeholder = 'Enter city',
  className = '',
  inputClassName = '',
  error = false,
  disabled = false,
  name,
  autoComplete = 'off',
  country = 'IN',
  limit = DEFAULT_LIMIT,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remoteSuggestions, setRemoteSuggestions] = useState([]);
  const ref = useRef(null);
  const token = env.mapboxAccessToken;
  const query = String(value || '').trim();

  const villageSuggestions = useMemo(() => searchVillages(query, { limit }), [query, limit]);
  const shouldUseMapboxFallback = Boolean(token) && query.length >= 2 && villageSuggestions.length === 0;

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
    if (!shouldUseMapboxFallback) {
      setRemoteSuggestions([]);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const encoded = encodeURIComponent(query);
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?types=place&autocomplete=true&limit=${limit}&country=${country}&access_token=${token}`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('Mapbox request failed');
        const data = await response.json();
        setRemoteSuggestions((data.features || []).map((feature) => ({
          id: feature.id,
          label: feature.place_name || feature.text,
          value: feature.text || feature.place_name,
          feature,
        })));
      } catch (error) {
        if (error.name !== 'AbortError') {
          setRemoteSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [country, limit, query, shouldUseMapboxFallback, token]);

  return (
    <div ref={ref} className={`ppf-search-dropdown ${className}`.trim()}>
      <input
        name={name}
        className={`ppf-input ${error ? 'error' : ''} ${inputClassName}`.trim()}
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange?.(event.target.value);
          setOpen(true);
        }}
      />
      {open && query ? (
        <div className="ppf-dropdown-list">
          {villageSuggestions.length ? (
            villageSuggestions.map((village) => (
              <div
                key={village.name}
                className="ppf-dropdown-item"
                onClick={() => {
                  onChange?.(village.name);
                  onSelect?.({ source: 'village', village });
                  setOpen(false);
                }}
              >
                {village.name} ({village.type})
              </div>
            ))
          ) : shouldUseMapboxFallback ? (
            loading ? (
              <div className="ppf-dropdown-item">Loading suggestions...</div>
            ) : remoteSuggestions.length ? (
              remoteSuggestions.map((item) => (
                <div
                  key={item.id}
                  className="ppf-dropdown-item"
                  onClick={() => {
                    onChange?.(item.value);
                    onSelect?.({ source: 'mapbox', feature: item.feature });
                    setOpen(false);
                  }}
                >
                  {item.label}
                </div>
              ))
            ) : (
              <div className="ppf-dropdown-item">No matches found</div>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
