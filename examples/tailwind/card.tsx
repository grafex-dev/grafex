import type { CompositionConfig } from 'grafex';

export const config: CompositionConfig = {
  width: 1200,
  height: 630,
  css: ['./styles.css'],
};

interface Props {
  title?: string;
  description?: string;
  tag?: string;
  author?: string;
  site?: string;
}

export default function Card({
  title = 'Building Modern APIs',
  description = 'Best practices for REST and GraphQL in 2026',
  tag = 'Tutorial',
  author = 'Jane Smith',
  site = 'dev.blog',
}: Props) {
  return (
    <div className="w-full h-full bg-slate-900 flex flex-col justify-between p-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-pink-500/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Top: tag */}
      <div className="flex items-center gap-3 z-10">
        <span className="bg-lime-400/15 border border-lime-400/30 rounded-md px-3 py-1 text-lime-400 text-sm font-semibold uppercase tracking-widest">
          {tag}
        </span>
      </div>

      {/* Middle: title + description */}
      <div className="flex flex-col gap-5 z-10">
        <h1 className="text-slate-50 text-6xl font-bold leading-tight tracking-tight">{title}</h1>
        <p className="text-slate-400 text-2xl leading-relaxed">{description}</p>
      </div>

      {/* Bottom: author + site */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-sky-400 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
            {author.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-200 text-lg font-semibold">{author}</span>
            <span className="text-slate-500 text-sm">5 min read</span>
          </div>
        </div>
        <span className="text-slate-500 text-base font-semibold tracking-wide">{site}</span>
      </div>

      {/* Bottom accent stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-sky-400 to-lime-400" />
    </div>
  );
}
