import { ServiceGrid } from "@/components/services/ServiceGrid";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7931A]/10 border border-[#F7931A]/20 text-[#F7931A] text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-[#F7931A] animate-pulse" />
          Live on Mezo Testnet
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
          AI Services, Paid with{" "}
          <span className="text-[#F7931A]">Bitcoin</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          The first AI inference marketplace powered by MUSD micropayments.
          No subscriptions. No API keys. Zero gas fees.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            href="#services"
            className="px-6 py-3 rounded-lg bg-[#F7931A] text-black font-medium hover:bg-[#F7931A]/90 transition-colors"
          >
            Explore Services
          </Link>
          <Link
            href="/provider"
            className="px-6 py-3 rounded-lg bg-zinc-800 text-zinc-200 font-medium hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            Become a Provider
          </Link>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBanner label="Payment" value="MUSD" sub="Bitcoin-backed" />
        <StatBanner label="Gas Fees" value="$0" sub="x402 protocol" />
        <StatBanner label="Free Tier" value="3" sub="requests/service" />
        <StatBanner label="Network" value="Mezo" sub="Bitcoin L2" />
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">How It Works</h2>
          <p className="text-zinc-500 mt-2">Three roles, one marketplace</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StepCard
            step="1"
            title="Providers"
            description="Stake MEZO tokens to register AI services. Set your price per request. Earn MUSD from every consumer call."
            color="text-purple-400"
            icon="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
          />
          <StepCard
            step="2"
            title="Consumers"
            description="Browse, try for free, then pay per request with MUSD. No accounts, no subscriptions — just connect wallet and go."
            color="text-[#F7931A]"
            icon="M13 10V3L4 14h7v7l9-11h-7z"
          />
          <StepCard
            step="3"
            title="AI Agents"
            description="Deposit MUSD in an AgentVault. Set daily limits. Your autonomous agent pays for services within guardrails."
            color="text-emerald-400"
            icon="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </div>
      </section>

      {/* Service Grid */}
      <section id="services" className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Available Services</h2>
          <p className="text-zinc-500 mt-2">Try any service for free, then pay only for what you use</p>
        </div>
        <ServiceGrid />
      </section>

      {/* Technology Section */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 space-y-6">
        <h2 className="text-xl font-bold text-center">Built on Bitcoin Infrastructure</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-sm">
          <TechItem name="Mezo L2" desc="Bitcoin Layer 2" />
          <TechItem name="MUSD" desc="BTC-backed stablecoin" />
          <TechItem name="x402" desc="HTTP-native payments" />
          <TechItem name="AgentVault" desc="Smart contract limits" />
        </div>
      </section>
    </div>
  );
}

function StatBanner({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-xl font-bold text-[#F7931A]">{value}</p>
      <p className="text-xs text-zinc-600">{sub}</p>
    </div>
  );
}

function StepCard({ step, title, description, color, icon }: { step: string; title: string; description: string; color: string; icon: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center ${color}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
        <div>
          <span className="text-xs text-zinc-600">Step {step}</span>
          <h3 className={`font-semibold ${color}`}>{title}</h3>
        </div>
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

function TechItem({ name, desc }: { name: string; desc: string }) {
  return (
    <div>
      <p className="font-semibold text-zinc-200">{name}</p>
      <p className="text-xs text-zinc-500">{desc}</p>
    </div>
  );
}
