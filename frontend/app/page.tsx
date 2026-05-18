import { ServiceGrid } from "@/components/services/ServiceGrid";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          AI Services, Paid with{" "}
          <span className="text-[#F7931A]">Bitcoin</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Pay per request with MUSD. No subscriptions. No API keys. Zero gas.
          Try any service for free, then pay only for what you use.
        </p>
      </section>

      <ServiceGrid />
    </div>
  );
}
