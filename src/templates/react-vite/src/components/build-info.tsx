export function BuildInfo() {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
      <div className="flex flex-col gap-2 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
        <span>Mode: {import.meta.env.MODE}</span>
        <span>API: {import.meta.env.VITE_API_BASE_URL ?? "/api"}</span>
      </div>
    </section>
  );
}
