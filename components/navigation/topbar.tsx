"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, Cloud, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const territories = [
  { code: "MQ", label: "Martinique" },
  { code: "GP", label: "Guadeloupe" },
  { code: "GF", label: "Guyane" }
];

const ranges = [
  { id: "7d", label: "7 derniers jours" },
  { id: "14d", label: "14 derniers jours" },
  { id: "30d", label: "30 derniers jours" },
  { id: "custom", label: "Personnalisé" }
];

export function Topbar() {
  const [territory, setTerritory] = useState("MQ");
  const [range, setRange] = useState("7d");

  return (
    <header className="sticky top-0 z-40 flex flex-wrap items-center gap-4 border-b border-white/5 bg-black/60 px-10 py-6 backdrop-blur-xl">
      <button className="group flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm transition hover:border-accent hover:text-accent" onClick={() => setTerritory(nextTerritory(territory))}>
        <Cloud className="h-4 w-4 text-accent" />
        {territories.find((t) => t.code === territory)?.label ?? "MQ"}
        <ChevronDown className="h-4 w-4 opacity-60" />
      </button>

      <div className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
        <CalendarDays className="h-4 w-4 text-accent" />
        <div className="flex gap-2">
          {ranges.map((item) => (
            <button
              key={item.id}
              onClick={() => setRange(item.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition",
                range === item.id ? "bg-accent/20 text-accent" : "hover:bg-white/10"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <label className="relative ml-auto flex h-10 flex-1 min-w-[240px] items-center overflow-hidden rounded-full border border-white/10 bg-white/5 px-4 text-sm text-slate-300">
        <Search className="mr-3 h-4 w-4 text-accent" />
        <input
          type="search"
          placeholder="Rechercher ou taper / pour le copilot"
          className="h-full flex-1 bg-transparent outline-none placeholder:text-slate-500"
        />
      </label>
    </header>
  );
}

function nextTerritory(code: string) {
  const index = territories.findIndex((t) => t.code === code);
  if (index === -1) return territories[0]?.code ?? "MQ";
  return territories[(index + 1) % territories.length]!.code;
}
