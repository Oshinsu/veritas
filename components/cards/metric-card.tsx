import type { ReactNode } from "react";

export function MetricCard({ label, value, delta, icon }: { label: string; value: string; delta: string; icon?: ReactNode }) {
  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{label}</p>
        {icon}
      </div>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-emerald-400">{delta}</p>
    </div>
  );
}
