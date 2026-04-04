import React from 'react';

export default function Loader({ label = 'Loading...' }) {
  return <div style={{ padding: '1rem 0', color: 'var(--gray-600)' }}>{label}</div>;
}


