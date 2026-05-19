import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl font-bold text-zinc-800">404</div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Page Not Found</h2>
          <p className="text-sm text-zinc-400">
            This page doesn't exist. Maybe you're looking for a service?
          </p>
        </div>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-lg bg-[#F7931A] text-black text-sm font-medium hover:bg-[#F7931A]/90 transition-colors"
        >
          Back to Marketplace
        </Link>
      </div>
    </div>
  );
}
