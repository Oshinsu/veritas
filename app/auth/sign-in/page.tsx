import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <div className="glass-panel p-10 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Connexion sécurisée</p>
          <h1 className="text-3xl font-semibold text-slate-100">Accéder à OrionPulse</h1>
          <p className="text-sm text-slate-400">
            Authentification via Supabase + SSO interne. Utilisez vos identifiants MQ/GP/GF.
          </p>
        </div>
        <form className="space-y-4">
          <label className="block text-sm">
            <span className="text-slate-300">Email professionnel</span>
            <input
              type="email"
              placeholder="prenom.nom@domaine.com"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-slate-100 outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-300">Mot de passe</span>
            <input
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-slate-100 outline-none focus:border-accent"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-accent-muted"
          >
            Se connecter
          </button>
        </form>
        <p className="text-xs text-slate-500">
          SSO requis ? <Link href="/auth/sso" className="text-accent">Initier la connexion</Link>
        </p>
      </div>
    </div>
  );
}
