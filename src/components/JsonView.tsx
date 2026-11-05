import { useState } from 'react';

interface JsonViewProps {
  data: unknown;
  maxHeight?: string;
}

export function JsonView({ data, maxHeight = '400px' }: JsonViewProps) {
  const [expanded, setExpanded] = useState(false);

  const jsonString = JSON.stringify(data, (_, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    if (value instanceof Uint8Array) {
      return Array.from(value)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
    return value;
  }, 2);

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className="mb-2 dh-btn dh-btn--sm"
      >
        {expanded ? 'Collapse' : 'Expand'}
      </button>
      <pre
        className="bg-gray-50 rounded p-3 text-xs font-mono overflow-auto whitespace-pre-wrap break-all"
        style={{ maxHeight: expanded ? 'none' : maxHeight }}
      >
        {jsonString}
      </pre>
    </div>
  );
}
