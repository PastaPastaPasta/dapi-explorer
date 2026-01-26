import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: Error | null;
}

export function Card({ title, children, className = '', loading, error }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-dash-blue border-t-transparent" />
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm bg-red-50 rounded p-3">
            {error.message}
          </div>
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
      <dt className="text-xs text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className={`mt-1 text-gray-900 ${mono ? 'font-mono text-sm break-all' : ''}`}>
        {value}
      </dd>
    </div>
  );
}
