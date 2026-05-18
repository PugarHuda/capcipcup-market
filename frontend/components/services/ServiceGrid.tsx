"use client";

import { useEffect, useState } from "react";
import { ServiceCard } from "./ServiceCard";
import { fetchServices, type ServiceListItem } from "@/lib/api";

type SortOption = "popular" | "fastest" | "cheapest";

export function ServiceGrid() {
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("popular");

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 rounded-lg bg-zinc-900 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        No services available. Be the first provider to register!
      </div>
    );
  }

  const filtered = services.filter((svc) =>
    svc.name.toLowerCase().includes(search.toLowerCase()) ||
    svc.model.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "popular") return b.metrics.totalRequests - a.metrics.totalRequests;
    if (sort === "fastest") return a.metrics.avgResponseTimeMs - b.metrics.avgResponseTimeMs;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services or models..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#F7931A]"
          />
        </div>
        <div className="flex gap-2">
          {(["popular", "fastest", "cheapest"] as SortOption[]).map((opt) => (
            <button
              key={opt}
              onClick={() => setSort(opt)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                sort === opt
                  ? "bg-[#F7931A] text-black"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {opt === "popular" ? "Popular" : opt === "fastest" ? "Fastest" : "Cheapest"}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          No services match "{search}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((svc) => (
            <ServiceCard key={svc.id} {...svc} />
          ))}
        </div>
      )}
    </div>
  );
}
