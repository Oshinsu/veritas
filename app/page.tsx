import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <section className="px-8 py-24 mx-auto max-w-6xl text-slate-100">
      <div className="glass-panel gradient-border p-12">
        <p className="uppercase tracking-[0.4em] text-xs text-accent-subtle mb-6">
          OrionPulse • Internal SaaS
        </p>
        <h1 className="text-5xl font-semibold leading-tight mb-6">
          Orchestration marketing augmentée pour MQ · GP · GF
        </h1>
        <p className="text-lg text-slate-300 max-w-3xl">
          Connectez vos sources publicitaires via MCP, harmonisez les indicateurs MQ/GP/GF et pilotez vos budgets avec le copilot GPT-5 intégré. OrionPulse réunit dashboards, alerting et runbooks opérables dans une expérience unifiée.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/overview"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-slate-900 font-semibold hover:bg-accent-muted transition"
          >
            Ouvrir le control center
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-slate-100 hover:border-accent-subtle transition"
          >
            Configurer la plateforme
          </Link>
        </div>
      </div>
    </section>
  );
}
