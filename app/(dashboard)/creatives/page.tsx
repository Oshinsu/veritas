import { SectionHeader } from "@/components/ui/section-header";
import { Pill } from "@/components/ui/pill";
import { fetchCreativeAssets } from "@/lib/data/creatives";
import { requireWorkspaceContext } from "@/lib/server/context";

export default async function CreativesPage() {
  const { supabase, workspaceId } = await requireWorkspaceContext();
  const assets = await fetchCreativeAssets(supabase, workspaceId);

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Creative Intelligence"
        description="Analyse CV/ASR, fatigue et recommandations"
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {assets.length === 0 && (
          <p className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
            Importez vos assets créatifs via les connecteurs MCP pour activer cette vue.
          </p>
        )}
        {assets.map((creative) => (
          <div key={creative.id} className="glass-panel overflow-hidden">
            <div
              className="h-40 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${creative.thumbnailUrl ?? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80"})` }}
            />
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{creative.name}</h3>
                <Pill>{creative.status}</Pill>
              </div>
              <p className="text-sm text-slate-400">Plateforme : {creative.platform}</p>
              <p className="text-sm text-slate-300">
                Fatigue :
                {creative.analysis.fatigueScore != null
                  ? ` ${creative.analysis.fatigueScore.toFixed(1)}`
                  : " —"}
                {" "}· Tags :
                {creative.analysis.tags.length > 0
                  ? ` ${creative.analysis.tags.join(", ")}`
                  : " —"}
              </p>
              <button className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-xs text-slate-200 hover:border-accent-subtle">
                Générer brief GPT-5
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
