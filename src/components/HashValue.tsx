import { hashText } from '../lib/format';

export function HashValue({ value, label, full = false, href }: { value: unknown; label: string; full?: boolean; href?: string }) {
  const text = hashText(value);
  if (!text) return <span className="text-sm text-gray-500">— · Not reported by this node</span>;
  return <dashhq-hash value={text} label={label} full={full ? '' : undefined} href={href}>{text}</dashhq-hash>;
}
