export function HashValue({ value, label, full = false, href }: { value: string | null | undefined; label: string; full?: boolean; href?: string }) {
  if (!value?.trim()) return <span className="text-sm text-gray-500">— · Not reported by this node</span>;
  return <dashhq-hash value={value} label={label} full={full ? '' : undefined} href={href}>{value}</dashhq-hash>;
}
