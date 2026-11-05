import React from 'react';
import { Reading, ReadError } from './ReadState';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function Card({ title, children, className = '', loading, error, onRetry }: CardProps) {
  return (
    <div className={`dh-card dh-card--flush ${className}`}>
      <div className="dh-card__head">
        <h2 className="dh-card__title">{title}</h2>
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
  return (
    <div className="dh-stat min-w-0">
      <dt className="dh-stat__label">{label}</dt>
      <dd className={`dh-stat__value [overflow-wrap:anywhere] ${mono ? 'font-mono text-sm font-normal break-all' : ''}`}>
        {value}
      </dd>
    </div>
  );
}
