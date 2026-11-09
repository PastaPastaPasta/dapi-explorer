import React from 'react';
import { Reading, ReadError } from './ReadState';

interface CardProps {
  title: string;
  method?: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function Card({ title, method, children, className = '', loading, error, onRetry }: CardProps) {
  return (
    <div className={`dh-card dh-card--flush ${className}`}>
      <div className="dh-card__head response-head">
        <div><h2 className="dh-h3">{title}</h2>{method && <code className="response-method">{method}</code>}</div>
        <span className="dh-badge dh-badge--reported">Reported</span>
      </div>
      <div className="px-4 pb-4 md:px-5">
        {loading ? (
          <Reading subject={title.toLowerCase()} />
        ) : error ? (
          <ReadError error={error} subject={title.toLowerCase()} onRetry={onRetry} />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

interface StatProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

export function Stat({ label, value, mono }: StatProps) {
  const missing = value == null ||
    (typeof value === 'string' && (!value.trim() || value === 'N/A')) ||
    (typeof value === 'number' && !Number.isFinite(value));
  return (
    <div className="dh-stat min-w-0">
      <dt className="dh-stat__label">{label}</dt>
      <dd className={`dh-stat__value ${mono || missing || (typeof value === 'string' && value.startsWith('—')) ? 'stat-text' : 'stat-number'} ${mono ? 'font-mono' : ''}`}>
        {missing ? '— · Not reported by this node' : typeof value === 'boolean' ? String(value) : value}
      </dd>
    </div>
  );
}
