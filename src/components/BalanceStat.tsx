import { Stat } from './Card';
import { HashValue } from './HashValue';
import { creditValue, formatDash } from '../lib/format';

export function BalanceStat({ credits, unit, label }: { credits: unknown; unit: string; label: string }) {
  const value = creditValue(credits);
  return <div className="col-span-full"><Stat label={label} value={value === null ? '— · Balance not returned' : <>
    <span className="stat-amount">{formatDash(value)} <span className="stat-unit">{unit}</span></span>
    <small className="stat-exact"><HashValue value={String(value)} label="Exact credit balance" full /> credits</small>
  </>} /></div>;
}
