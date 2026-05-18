"use client";

import { useEffect, useState } from "react";
import { ServiceCard } from "./ServiceCard";
import { fetchServices, type ServiceListItem } from "@/lib/api";

export function ServiceGrid() {
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 h-48 animate-pulse" />
        ))}
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((svc) => (
        <ServiceCard key={svc.id} {...svc} />
      ))}
    </div>
  );
}
