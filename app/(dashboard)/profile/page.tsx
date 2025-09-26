import { SectionHeader } from "@/components/ui/section-header";
import { requireWorkspaceContext } from "@/lib/server/context";
import { type SupabaseClient } from "@supabase/supabase-js";

type MembershipProfile = {
  role: string | null;
  territories: string[];
  user: {
    fullName: string | null;
    email: string | null;
  };
};

async function fetchProfile(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<MembershipProfile | null> {
  const { data: membership } = await supabase
    .from("memberships")
    .select("user_id,role,territories,users(full_name,email)")
    .eq("workspace_id", workspaceId)
    .limit(1)
    .single();

  if (!membership) {
    return null;
  }

  const territories = Array.isArray(membership.territories)
    ? membership.territories.map((territory) => String(territory))
    : [];

  const rawUser = Array.isArray(membership.users)
    ? membership.users[0]
    : membership.users;

  const user = {
    fullName:
      rawUser && typeof rawUser.full_name === "string" ? rawUser.full_name : null,
    email: rawUser && typeof rawUser.email === "string" ? rawUser.email : null
  };

  return {
    role: membership.role ?? null,
    territories,
    user
  };
}

export default async function ProfilePage() {
  const { supabase, workspaceId } = await requireWorkspaceContext();
  const membership = await fetchProfile(supabase, workspaceId);

  const preferences = [
    {
      id: "pref-1",
      label: "Langue du copilot",
      value: "Français",
      description: "Langue principale pour les réponses générées"
    },
    {
      id: "pref-2",
      label: "Canal d'alerting",
      value: process.env.DEFAULT_ALERT_CHANNEL ?? "Non configuré",
      description: "Destination des alertes critiques"
    },
    {
      id: "pref-3",
      label: "Fenêtres de gel",
      value: process.env.CHANGE_FREEZE_WINDOW ?? "Non défini",
      description: "Créneaux où aucune action automatique n'est exécutée"
    }
  ];

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Profil & Préférences"
        description="Personnalisation de l'expérience OrionPulse"
      />

      <div className="glass-panel divide-y divide-white/5">
        <div className="space-y-1 px-6 py-5">
          <p className="text-sm font-semibold text-slate-200">Utilisateur</p>
          <p className="text-sm text-accent">{membership?.user.fullName ?? "Utilisateur inconnu"}</p>
          <p className="text-xs text-slate-500">{membership?.user.email ?? "Email non défini"}</p>
        </div>
        <div className="space-y-1 px-6 py-5">
          <p className="text-sm font-semibold text-slate-200">Rôle</p>
          <p className="text-sm text-accent">{membership?.role ?? "Non défini"}</p>
          <p className="text-xs text-slate-500">Territoires : {(membership?.territories ?? []).join(", ") || "Tous"}</p>
        </div>
        {preferences.map((preference) => (
          <div key={preference.id} className="space-y-1 px-6 py-5">
            <p className="text-sm font-semibold text-slate-200">{preference.label}</p>
            <p className="text-sm text-accent">{preference.value}</p>
            <p className="text-xs text-slate-500">{preference.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
