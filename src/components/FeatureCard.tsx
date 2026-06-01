import type { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/20 transition hover:-translate-y-1 hover:border-glow/80">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-glow/10 text-glow shadow-lg shadow-glow/10">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
