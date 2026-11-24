import React from 'react';
import { ReadBoundary } from './ReadState';

interface CardProps {
  title: string;
  method?: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: Error | null;
  hasData?: boolean;
  onRetry?: () => void;
}

export function Card({ title, method, children, className = '', loading, error, hasData, onRetry }: CardProps) {
  return (
    <div className={`dh-card dh-card--flush ${className}`}>
      <div className="dh-card__head response-head">
        <h2 className="dh-h3">{title}</h2>
        {method && <code className="response-method" title="DAPI method">{method}</code>}
      </div>
      <div className="px-4 pb-4 md:px-5">
        <ReadBoundary subject={title.toLowerCase()} loading={loading} error={error} hasData={hasData} onRetry={onRetry}>
          {children}
        </ReadBoundary>
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
