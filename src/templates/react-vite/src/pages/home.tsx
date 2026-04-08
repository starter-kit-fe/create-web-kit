import { BuildInfo } from "../components/build-info";

export function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <section className="space-y-5">
          <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-cyan-300">
            React Vite Flow
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Ship a React SPA with the boring setup already handled.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            This starter keeps the official Vite scaffold, then layers in
            shadcn/ui, TanStack Query/Table, prettier, lint-staged, and a few
            opinionated defaults so the project starts closer to production.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-medium text-cyan-300">UI</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              shadcn/ui is initialized and ready for component-level work.
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-medium text-cyan-300">Data</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Query primitives and request helpers are in place for API-driven
              screens.
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-medium text-cyan-300">Workflow</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Formatting and pre-commit checks are ready so the repo stays tidy.
            </p>
          </article>
        </section>

        <BuildInfo />
      </div>
    </main>
  );
}
