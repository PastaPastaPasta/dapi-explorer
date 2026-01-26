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
        className="absolute top-2 right-2 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 px-2 py-1 rounded"
      >
        {expanded ? 'Collapse' : 'Expand'}
      </button>
      <pre
        className="bg-gray-50 rounded p-3 text-xs font-mono overflow-auto"
        style={{ maxHeight: expanded ? 'none' : maxHeight }}
      >
        {jsonString}
      </pre>
    </div>
  );
}
