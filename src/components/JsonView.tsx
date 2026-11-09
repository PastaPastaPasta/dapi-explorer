import { useState } from 'react';

interface JsonViewProps {
  data: unknown;
  maxHeight?: string;
  label?: string;
}

export function JsonView({ data, maxHeight = '400px', label = 'Details · raw response' }: JsonViewProps) {
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
    <details className="dh-disclosure json-details">
      <summary><span>{label}</span></summary>
      <div className="response-head json-head"><span>Node response</span><span className="dh-badge dh-badge--reported">Reported</span></div>
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
    </details>
  );
}
