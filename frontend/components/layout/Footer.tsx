import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="text-lg font-bold">
              <span className="text-[#F7931A]">Cap</span>
              <span className="text-zinc-100">Cip</span>
              <span className="text-[#F7931A]">Cup</span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">
              AI Inference Marketplace on Mezo. Pay per request with Bitcoin-backed MUSD.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-zinc-300">Marketplace</h4>
            <nav className="flex flex-col gap-2 text-sm text-zinc-500">
              <Link href="/" className="hover:text-zinc-300 transition-colors">Explore Services</Link>
              <Link href="/battle" className="hover:text-zinc-300 transition-colors">Battle Mode</Link>
              <Link href="/analytics" className="hover:text-zinc-300 transition-colors">Analytics</Link>
              <Link href="/provider" className="hover:text-zinc-300 transition-colors">Become a Provider</Link>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-zinc-300">For Agents</h4>
            <nav className="flex flex-col gap-2 text-sm text-zinc-500">
              <Link href="/vault" className="hover:text-zinc-300 transition-colors">Agent Vault</Link>
              <a href="https://capcipcup-api.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">API Docs</a>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-zinc-300">Network</h4>
            <nav className="flex flex-col gap-2 text-sm text-zinc-500">
              <a href="https://explorer.test.mezo.org" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">Mezo Explorer</a>
              <a href="https://github.com/PugarHuda/capcipcup-market" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">GitHub</a>
              <a href="https://mezo.org" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">Mezo.org</a>
            </nav>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>Built for Mezo Hackathon 2026 — MUSD Track</p>
          <p>Mezo Testnet (Chain 31611) — All transactions use testnet tokens</p>
        </div>
      </div>
    </footer>
  );
}
