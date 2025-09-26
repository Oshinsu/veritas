"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { type McpIntegration, integrationStatusTone } from "@/lib/data/integrations";
import { navItems } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function SidebarClient({ integrations }: { integrations: McpIntegration[] }) {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r border-white/5 bg-black/30 backdrop-blur-xl p-8 flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-accent/20 grid place-items-center">
          <span className="text-accent font-semibold">OP</span>
        </div>
        <div>
          <p className="font-semibold">OrionPulse</p>
          <p className="text-xs text-slate-400">Copilot marketing MQ · GP · GF</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-start gap-3 rounded-xl border border-transparent px-4 py-3 transition-colors",
                active ? "bg-accent/10 border-accent/40 text-accent-subtle" : "hover:bg-white/5 text-slate-300"
              )}
            >
              <item.icon className="mt-0.5 h-5 w-5" />
              <span>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-slate-400">{item.description}</p>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Connecteurs MCP</p>
          <ul className="mt-3 space-y-2">
            {integrations.slice(0, 3).map((integration) => (
              <li
                key={integration.id}
                className="flex items-center justify-between text-xs text-slate-300"
              >
                <span className="truncate pr-2">{integration.platform}</span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide",
                    integrationStatusTone[integration.status]
                  )}
                >
                  {integration.status}
                </span>
              </li>
            ))}
            {integrations.length === 0 && (
              <li className="text-xs text-slate-500">Aucun connecteur configuré.</li>
            )}
          </ul>
          <p className="mt-3 text-[11px] text-slate-500">Etat complet dans Admin → Integrations.</p>
        </div>

        <div className="text-xs text-slate-500 space-y-1">
          <p>Dernière synchro MCP · automatique</p>
          <p>Quota appels restants : 82%</p>
        </div>
      </div>
    </aside>
  );
}
