import React from 'react';
import { Reading, ReadError } from './ReadState';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: Error | null;
}

export function Card({ title, children, className = '', loading, error }: CardProps) {
  return (
    <div className={`panel bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      <div className="p-4">
        {loading ? (
          <Reading subject={title.toLowerCase()} />
        ) : error ? (
          <ReadError error={error} subject={title.toLowerCase()} />
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
    <div className="py-2">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className={`stat-value mt-1 text-gray-900 ${mono ? 'font-mono text-sm break-all' : ''}`}>
        {value}
      </dd>
    </div>
  );
}
