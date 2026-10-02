import { ArrowRight, CheckCircle2, Layers3, Palette } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { taskFeature } from '@/features/tasks/foundation';

const foundations = [
  {
    icon: Layers3,
    title: 'App Router',
    description: 'Pages and layouts are ready for product routes as they are introduced.',
  },
  {
    icon: Palette,
    title: 'Shared interface',
    description: 'Tailwind CSS and shadcn/ui provide a consistent component baseline.',
  },
  {
    icon: CheckCircle2,
    title: 'Strict workflow',
    description: 'Type checking, linting, builds, and tests are part of the starting point.',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-950 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        <header className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-[0.2em] text-zinc-500 uppercase">TM-002</span>
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
            Foundation ready
          </span>
        </header>

        <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-4 text-sm font-medium text-zinc-500">Task management MVP</p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
              A calm place to turn work into progress.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
              The application foundation is in place. Product features can now be developed in focused,
              maintainable slices.
            </p>
            <Button className="mt-8" asChild>
              <a href="#features">
                Explore the foundation <ArrowRight aria-hidden="true" />
              </a>
            </Button>
          </div>

          <aside className="rounded-2xl bg-zinc-950 p-7 text-zinc-50 shadow-xl shadow-zinc-950/10">
            <p className="text-sm font-medium text-zinc-400">First feature area</p>
            <h2 className="mt-2 text-2xl font-semibold">{taskFeature.title}</h2>
            <p className="mt-3 leading-7 text-zinc-300">{taskFeature.description}</p>
          </aside>
        </section>

        <section id="features" className="grid gap-4 md:grid-cols-3">
          {foundations.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-zinc-200 bg-white p-6">
              <Icon className="h-5 w-5 text-zinc-500" aria-hidden="true" />
              <h2 className="mt-5 text-lg font-semibold">{title}</h2>
              <p className="mt-2 leading-7 text-zinc-600">{description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
