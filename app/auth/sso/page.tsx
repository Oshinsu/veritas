import Link from "next/link";

export default function SSOPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <div className="glass-panel space-y-6 p-10">
        <h1 className="text-3xl font-semibold text-slate-100">Connexion SSO OrionPulse</h1>
        <p className="text-sm text-slate-400">
          Redirection vers le fournisseur SAML/SCIM interne. Vérifiez que vous êtes connecté au VPN MQ/GP/GF avant de poursuivre.
        </p>
        <button className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-accent-muted">
          Continuer vers l’IdP
        </button>
        <p className="text-xs text-slate-500">
          Besoin d’aide ? Consultez la <Link href="/governance" className="text-accent">documentation sécurité</Link> ou contactez ops@orionpulse.dom.
        </p>
      </div>
    </div>
  );
}
